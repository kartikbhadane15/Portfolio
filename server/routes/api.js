const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

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
      select: { id: true, username: true, email: true, role: true }
    });

    if (!user) {
      return res.status(404).json({ error: `Portfolio for user '${req.params.username}' not found` });
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
