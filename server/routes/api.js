const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// Helper to check if the incoming request is from a logged-in superadmin
const checkIsSuperAdmin = (req) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return false;
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded && decoded.role === 'superadmin';
  } catch (err) {
    return false;
  }
};

// Helper to get default user (Kartik/Superadmin)
const getDefaultUser = async () => {
  return await prisma.user.findFirst({
    where: { role: 'superadmin' }
  }) || await prisma.user.findFirst();
};

// ==========================================
// MULTI-TENANT PUBLIC ENDPOINTS
// ==========================================

// GET /api/public/default/data - Public portfolio data for default superadmin
router.get('/public/default/data', async (req, res) => {
  try {
    const user = await getDefaultUser();
    if (!user) return res.status(404).json({ error: 'Default portfolio not found' });
    return res.redirect(`/api/public/${user.username}/data`);
  } catch (error) {
    console.error('Error fetching default portfolio:', error);
    res.status(500).json({ error: 'Failed to fetch default portfolio' });
  }
});

// GET /api/public/:username/data - Full dynamic portfolio payload for any user
router.get('/public/:username/data', async (req, res) => {
  try {
    const username = req.params.username.toLowerCase();
    const user = await prisma.user.findFirst({
      where: { username: { equals: username, mode: 'insensitive' } },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isBlocked: true,
        subscriptionStatus: true,
        subscriptionDurationMonths: true,
        subscriptionStartedAt: true,
        subscriptionExpiresAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: `Portfolio for user '${req.params.username}' not found` });
    }

    const isSuperAdmin = checkIsSuperAdmin(req);
    const isBlocked = Boolean(user.isBlocked);
    const isExpired = user.role !== 'superadmin' && user.subscriptionExpiresAt
      ? new Date() > new Date(user.subscriptionExpiresAt)
      : false;

    // If user portfolio is blocked or subscription is expired:
    // Only superadmin can view it! Public viewers receive 403 Forbidden.
    if (user.role !== 'superadmin' && (isBlocked || isExpired)) {
      if (!isSuperAdmin) {
        return res.status(403).json({
          error: 'Portfolio unavailable',
          isInactive: true,
          isBlocked,
          isExpired,
          message: isBlocked
            ? 'This portfolio has been suspended by the administrator.'
            : 'This portfolio subscription has expired. Please contact the administrator.',
          username: user.username
        });
      }
    }

    const [profile, projects, experience, skills, education, certifications, achievements, settings] = await Promise.all([
      prisma.profile.findFirst({ where: { userId: user.id } }),
      prisma.project.findMany({
        where: { userId: user.id, isPublished: true },
        orderBy: [{ featuredOrder: 'asc' }, { createdAt: 'desc' }],
        include: { caseStudy: true }
      }),
      prisma.experience.findMany({
        where: { userId: user.id },
        orderBy: { startDate: 'desc' }
      }),
      prisma.skill.findMany({
        where: { userId: user.id },
        orderBy: [{ category: 'asc' }, { name: 'asc' }]
      }),
      prisma.education.findMany({
        where: { userId: user.id },
        orderBy: { startDate: 'desc' }
      }),
      prisma.certification.findMany({
        where: { userId: user.id },
        orderBy: { date: 'desc' }
      }),
      prisma.achievement.findMany({
        where: { userId: user.id },
        orderBy: { date: 'desc' }
      }),
      prisma.siteSettings.findFirst({ where: { userId: user.id } })
    ]);

    // Group skills by category
    const groupedSkills = skills.reduce((acc, skill) => {
      const cat = skill.category || 'Other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill);
      return acc;
    }, {});

    res.json({
      user,
      profile,
      adminPreview: (isSuperAdmin && (isBlocked || isExpired)) ? {
        isBlocked,
        isExpired,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
        subscriptionDurationMonths: user.subscriptionDurationMonths
      } : null,
      projects: projects.map(p => ({
        ...p,
        description: p.shortDescription,
        caseStudy: p.caseStudy || null
      })),
      experience,
      skills: groupedSkills,
      education,
      certifications,
      achievements,
      settings: settings || {
        siteTitle: profile?.name ? `${profile.name} | Portfolio` : 'Portfolio',
        defaultTheme: 'dark',
        accentColor: '#00E5FF',
        isAvailableForHire: true
      }
    });
  } catch (error) {
    console.error('Error fetching public portfolio data:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio data' });
  }
});

// POST /api/public/:username/contact - Contact message sent to specific user
router.post('/public/:username/contact', async (req, res) => {
  try {
    const username = req.params.username.toLowerCase();
    const user = await prisma.user.findFirst({
      where: { username: { equals: username, mode: 'insensitive' } }
    });

    if (!user) {
      return res.status(404).json({ error: 'User recipient not found' });
    }

    // Disallow contact if user is blocked or expired
    if (user.role !== 'superadmin') {
      const isExpired = user.subscriptionExpiresAt ? (new Date() > new Date(user.subscriptionExpiresAt)) : false;
      if (user.isBlocked || isExpired) {
        return res.status(403).json({
          error: user.isBlocked
            ? 'This portfolio is suspended. Messages cannot be sent.'
            : 'This portfolio subscription has expired. Messages cannot be sent.'
        });
      }
    }

    const { name, email, message } = req.body;
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Please provide a valid name (at least 2 characters).' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }
    if (!message || message.trim().length < 10) {
      return res.status(400).json({ error: 'Please enter a message of at least 10 characters.' });
    }

    const savedMessage = await prisma.message.create({
      data: {
        userId: user.id,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        message: message.trim(),
        isRead: false
      }
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully!',
      id: savedMessage.id
    });
  } catch (error) {
    console.error('Error saving contact message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// ==========================================
// LEGACY COMPATIBILITY ENDPOINTS
// (Fallbacks for existing components)
// ==========================================

// GET /api/profile
router.get('/profile', async (req, res) => {
  try {
    const user = await getDefaultUser();
    const profile = await prisma.profile.findFirst({
      where: user ? { userId: user.id } : undefined
    });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// GET /api/settings
router.get('/settings', async (req, res) => {
  try {
    const user = await getDefaultUser();
    const settings = await prisma.siteSettings.findFirst({
      where: user ? { userId: user.id } : undefined
    });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// GET /api/projects
router.get('/projects', async (req, res) => {
  try {
    const user = await getDefaultUser();
    const { featured } = req.query;
    const filter = { isPublished: true };
    if (user) filter.userId = user.id;
    if (featured === 'true') filter.isFeatured = true;

    const projects = await prisma.project.findMany({
      where: filter,
      orderBy: [{ featuredOrder: 'asc' }, { createdAt: 'desc' }]
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// GET /api/projects/:slug
router.get('/projects/:slug', async (req, res) => {
  try {
    const project = await prisma.project.findFirst({
      where: { slug: req.params.slug, isPublished: true },
      include: { caseStudy: true }
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// GET /api/experience
router.get('/experience', async (req, res) => {
  try {
    const user = await getDefaultUser();
    const experience = await prisma.experience.findMany({
      where: user ? { userId: user.id } : undefined,
      orderBy: { startDate: 'desc' }
    });
    res.json(experience);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch experience' });
  }
});

// GET /api/skills
router.get('/skills', async (req, res) => {
  try {
    const user = await getDefaultUser();
    const skills = await prisma.skill.findMany({
      where: user ? { userId: user.id } : undefined,
      orderBy: { category: 'asc' }
    });
    const groupedSkills = skills.reduce((acc, skill) => {
      const cat = skill.category || 'Other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill);
      return acc;
    }, {});
    res.json(groupedSkills);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

// GET /api/education
router.get('/education', async (req, res) => {
  try {
    const user = await getDefaultUser();
    const education = await prisma.education.findMany({
      where: user ? { userId: user.id } : undefined,
      orderBy: { startDate: 'desc' }
    });
    res.json(education);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch education' });
  }
});

// GET /api/certifications
router.get('/certifications', async (req, res) => {
  try {
    const user = await getDefaultUser();
    const certs = await prisma.certification.findMany({
      where: user ? { userId: user.id } : undefined,
      orderBy: { date: 'desc' }
    });
    res.json(certs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch certifications' });
  }
});

// GET /api/achievements
router.get('/achievements', async (req, res) => {
  try {
    const user = await getDefaultUser();
    const achievements = await prisma.achievement.findMany({
      where: user ? { userId: user.id } : undefined,
      orderBy: { date: 'desc' }
    });
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

// POST /api/contact
router.post('/contact', async (req, res) => {
  try {
    const user = await getDefaultUser();
    const { name, email, message } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Please provide a valid name (at least 2 characters).' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }
    if (!message || message.trim().length < 10) {
      return res.status(400).json({ error: 'Please enter a message of at least 10 characters.' });
    }

    const savedMessage = await prisma.message.create({
      data: {
        userId: user ? user.id : 'default-user',
        name: name.trim(),
        email: email.trim().toLowerCase(),
        message: message.trim(),
        isRead: false
      }
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully!',
      id: savedMessage.id
    });
  } catch (error) {
    console.error('Error saving contact message:', error);
    res.status(500).json({ error: 'Failed to send message. Please try again later.' });
  }
});

module.exports = router;
