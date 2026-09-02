const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

const upload = multer({ storage: multer.memoryStorage() });

const getSupabaseUrl = () => {
  try {
    const key = process.env.SUPABASE_ANON_KEY;
    const payload = JSON.parse(Buffer.from(key.split('.')[1], 'base64').toString());
    return `https://${payload.ref}.supabase.co`;
  } catch (e) {
    return null;
  }
};

const supabaseUrl = getSupabaseUrl();
const supabase = supabaseUrl ? createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY) : null;

// Superadmin middleware
const requireSuperAdmin = (req, res, next) => {
  if (req.user?.role !== 'superadmin') {
    return res.status(403).json({ error: 'Access denied. Superadmin privileges required.' });
  }
  next();
};

// Helper to slugify title
const slugify = (text) => {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// --- SUPERADMIN: USER MANAGEMENT ---
router.get('/users', requireSuperAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            name: true,
            photoUrl: true
          }
        },
        _count: {
          select: {
            projects: true,
            messages: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.post('/users', requireSuperAdmin, async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ error: 'Name, username, email, and password are required' });
    }

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleanUsername || cleanUsername.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 alphanumeric characters' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check existing email or username
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.trim().toLowerCase() },
          { username: cleanUsername }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.username === cleanUsername) {
        return res.status(400).json({ error: 'This username is already taken. Please choose another.' });
      }
      return res.status(400).json({ error: 'A user with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user and initialize profile & settings
    const newUser = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        username: cleanUsername,
        passwordHash,
        role: 'user',
        profile: {
          create: {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            tagline: 'Software Engineer',
            bio: `Hi, I'm ${name.trim()}. Welcome to my portfolio!`
          }
        },
        settings: {
          create: {
            siteTitle: `${name.trim()} | Software Engineer`,
            siteDescription: `Portfolio of ${name.trim()} - Software Engineer.`,
            defaultTheme: 'dark',
            accentColor: '#00E5FF',
            isAvailableForHire: true
          }
        }
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true
      }
    });

    res.status(201).json({
      success: true,
      user: newUser,
      message: `User '${cleanUsername}' created successfully! Portfolio available at /${cleanUsername}`
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user account' });
  }
});

router.put('/users/:id/password', requireSuperAdmin, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: req.params.id },
      data: { passwordHash }
    });

    res.json({ success: true, message: 'User password reset successfully' });
  } catch (error) {
    console.error('Error resetting user password:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

router.delete('/users/:id', requireSuperAdmin, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own superadmin account' });
    }

    await prisma.user.delete({
      where: { id: req.params.id }
    });

    res.json({ success: true, message: 'User and portfolio deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// --- STATS (TENANT SCOPED) ---
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;
    const totalProjects = await prisma.project.count({ where: { userId } });
    const totalExperience = await prisma.experience.count({ where: { userId } });
    const totalSkills = await prisma.skill.count({ where: { userId } });
    const totalMessages = await prisma.message.count({ where: { userId } });
    const unreadMessages = await prisma.message.count({ where: { userId, isRead: false } });
    
    const recentProjects = await prisma.project.findMany({
      where: { userId },
      take: 3,
      orderBy: { updatedAt: 'desc' }
    });

    res.json({
      totalProjects,
      totalExperience,
      totalSkills,
      totalMessages,
      unreadMessages,
      recentProjects,
      userRole: req.user.role,
      username: req.user.username
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// --- PROJECTS (TENANT SCOPED) ---
router.get('/projects', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    const mappedProjects = projects.map(p => ({
      ...p,
      description: p.shortDescription
    }));
    res.json(mappedProjects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.post('/projects', async (req, res) => {
  try {
    const { description, demoUrl, caseStudy, tags, websiteUrl, screenshots, startDate, endDate, ...rest } = req.body;
    const project = await prisma.project.create({ 
      data: {
        ...rest,
        userId: req.user.id,
        tags: Array.isArray(tags) ? tags : [],
        screenshots: Array.isArray(screenshots) ? screenshots : [],
        liveUrl: demoUrl,
        websiteUrl,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        slug: slugify(rest.title || 'untitled'),
        shortDescription: description || '',
        isPublished: true,
        ...(caseStudy && {
          caseStudy: {
            create: caseStudy
          }
        })
      }
    });
    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

router.put('/projects/:id', async (req, res) => {
  try {
    const { description, demoUrl, caseStudy, tags, websiteUrl, screenshots, startDate, endDate, ...rest } = req.body;
    
    // Verify ownership
    const existing = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!existing) return res.status(404).json({ error: 'Project not found' });

    const data = {
      ...rest,
      tags: Array.isArray(tags) ? tags : [],
      screenshots: Array.isArray(screenshots) ? screenshots : [],
      liveUrl: demoUrl,
      websiteUrl,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      shortDescription: description
    };
    if (rest.title) {
      data.slug = slugify(rest.title);
    }
    
    if (caseStudy) {
      data.caseStudy = {
        upsert: {
          create: caseStudy,
          update: caseStudy
        }
      };
    }

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data
    });

    if (!caseStudy) {
      await prisma.caseStudy.deleteMany({
        where: { projectId: req.params.id }
      });
    }

    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

router.delete('/projects/:id', async (req, res) => {
  try {
    const deleted = await prisma.project.deleteMany({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (deleted.count === 0) return res.status(404).json({ error: 'Project not found' });
    res.json({ success: true, id: req.params.id });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// --- PROFILE (TENANT SCOPED) ---
router.get('/profile', async (req, res) => {
  try {
    let profile = await prisma.profile.findFirst({
      where: { userId: req.user.id }
    });
    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          userId: req.user.id,
          name: 'Developer',
          email: req.user.email
        }
      });
    }
    res.json(profile);
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.put('/profile', async (req, res) => {
  try {
    const { name, tagline, bio, email, photoUrl, githubUrl, linkedinUrl, twitterUrl, resumeUrl } = req.body;
    let profile = await prisma.profile.findFirst({
      where: { userId: req.user.id }
    });

    const updateData = {
      name: name?.trim() || 'Developer',
      tagline: tagline?.trim() || null,
      bio: bio?.trim() || null,
      email: email?.trim() || null,
      photoUrl: photoUrl?.trim() || null,
      githubUrl: githubUrl?.trim() || null,
      linkedinUrl: linkedinUrl?.trim() || null,
      twitterUrl: twitterUrl?.trim() || null,
      resumeUrl: resumeUrl?.trim() || null
    };

    if (profile) {
      profile = await prisma.profile.update({
        where: { id: profile.id },
        data: updateData
      });
    } else {
      profile = await prisma.profile.create({
        data: {
          ...updateData,
          userId: req.user.id
        }
      });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    if (!supabase) return res.status(500).json({ error: 'Supabase storage is not configured' });

    const file = req.file;
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('portfolio-assets')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('portfolio-assets')
      .getPublicUrl(filePath);

    res.json({ url: data.publicUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// --- EXPERIENCE (TENANT SCOPED) ---
router.get('/experience', async (req, res) => {
  try {
    const experiences = await prisma.experience.findMany({
      where: { userId: req.user.id },
      orderBy: { startDate: 'desc' }
    });
    res.json(experiences);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch experiences' });
  }
});

router.post('/experience', async (req, res) => {
  try {
    const { startDate, endDate, skills, ...rest } = req.body;
    const experience = await prisma.experience.create({
      data: {
        ...rest,
        userId: req.user.id,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        skills: Array.isArray(skills) ? skills : []
      }
    });
    res.status(201).json(experience);
  } catch (error) {
    console.error('Error creating experience:', error);
    res.status(500).json({ error: 'Failed to create experience' });
  }
});

router.put('/experience/:id', async (req, res) => {
  try {
    const { startDate, endDate, skills, ...rest } = req.body;
    const experience = await prisma.experience.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        skills: Array.isArray(skills) ? skills : []
      }
    });
    res.json(experience);
  } catch (error) {
    console.error('Error updating experience:', error);
    res.status(500).json({ error: 'Failed to update experience' });
  }
});

router.delete('/experience/:id', async (req, res) => {
  try {
    await prisma.experience.deleteMany({
      where: { id: req.params.id, userId: req.user.id }
    });
    res.json({ success: true, id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete experience' });
  }
});

// --- SKILLS (TENANT SCOPED) ---
router.get('/skills', async (req, res) => {
  try {
    const skills = await prisma.skill.findMany({
      where: { userId: req.user.id },
      orderBy: [{ category: 'asc' }, { name: 'asc' }]
    });
    res.json(skills);
  } catch (error) {
    console.error('Error fetching admin skills:', error);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

router.post('/skills', async (req, res) => {
  try {
    const { name, category, proficiency } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Skill name is required' });

    const skill = await prisma.skill.create({
      data: {
        userId: req.user.id,
        name: name.trim(),
        category: category?.trim() || 'Other',
        proficiency: proficiency ? parseInt(proficiency, 10) : null
      }
    });
    res.status(201).json(skill);
  } catch (error) {
    console.error('Error creating skill:', error);
    res.status(500).json({ error: 'Failed to create skill' });
  }
});

router.put('/skills/:id', async (req, res) => {
  try {
    const { name, category, proficiency } = req.body;
    const skill = await prisma.skill.update({
      where: { id: req.params.id },
      data: {
        name: name?.trim(),
        category: category?.trim() || 'Other',
        proficiency: proficiency ? parseInt(proficiency, 10) : null
      }
    });
    res.json(skill);
  } catch (error) {
    console.error('Error updating skill:', error);
    res.status(500).json({ error: 'Failed to update skill' });
  }
});

router.delete('/skills/:id', async (req, res) => {
  try {
    await prisma.skill.deleteMany({
      where: { id: req.params.id, userId: req.user.id }
    });
    res.json({ success: true, id: req.params.id });
  } catch (error) {
    console.error('Error deleting skill:', error);
    res.status(500).json({ error: 'Failed to delete skill' });
  }
});

// --- MESSAGES (TENANT SCOPED) ---
router.get('/messages', async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = { userId: req.user.id };

    if (status === 'read') filter.isRead = true;
    if (status === 'unread') filter.isRead = false;

    if (search && search.trim()) {
      const q = search.trim();
      filter.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { message: { contains: q, mode: 'insensitive' } },
      ];
    }

    const messages = await prisma.message.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' }
    });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching admin messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.get('/messages/stats', async (req, res) => {
  try {
    const userId = req.user.id;
    const [total, unread] = await Promise.all([
      prisma.message.count({ where: { userId } }),
      prisma.message.count({ where: { userId, isRead: false } }),
    ]);
    res.json({ total, unread, read: total - unread });
  } catch (error) {
    console.error('Error fetching message stats:', error);
    res.status(500).json({ error: 'Failed to fetch message stats' });
  }
});

router.patch('/messages/:id/read', async (req, res) => {
  try {
    const { isRead } = req.body;
    const updated = await prisma.message.update({
      where: { id: req.params.id },
      data: { isRead: Boolean(isRead) }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update message status' });
  }
});

router.delete('/messages/:id', async (req, res) => {
  try {
    await prisma.message.deleteMany({
      where: { id: req.params.id, userId: req.user.id }
    });
    res.json({ success: true, id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// --- EDUCATION (TENANT SCOPED) ---
router.get('/education', async (req, res) => {
  try {
    const education = await prisma.education.findMany({
      where: { userId: req.user.id },
      orderBy: { startDate: 'desc' }
    });
    res.json(education);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch education' });
  }
});

router.post('/education', async (req, res) => {
  try {
    const { institution, degree, fieldOfStudy, startDate, endDate } = req.body;
    const edu = await prisma.education.create({
      data: {
        userId: req.user.id,
        institution: institution?.trim(),
        degree: degree?.trim(),
        fieldOfStudy: fieldOfStudy?.trim() || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null
      }
    });
    res.status(201).json(edu);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create education' });
  }
});

router.put('/education/:id', async (req, res) => {
  try {
    const { institution, degree, fieldOfStudy, startDate, endDate } = req.body;
    const edu = await prisma.education.update({
      where: { id: req.params.id },
      data: {
        institution: institution?.trim(),
        degree: degree?.trim(),
        fieldOfStudy: fieldOfStudy?.trim() || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null
      }
    });
    res.json(edu);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update education' });
  }
});

router.delete('/education/:id', async (req, res) => {
  try {
    await prisma.education.deleteMany({
      where: { id: req.params.id, userId: req.user.id }
    });
    res.json({ success: true, id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete education' });
  }
});

// --- CERTIFICATIONS (TENANT SCOPED) ---
router.get('/certifications', async (req, res) => {
  try {
    const certs = await prisma.certification.findMany({
      where: { userId: req.user.id },
      orderBy: { date: 'desc' }
    });
    res.json(certs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch certifications' });
  }
});

router.post('/certifications', async (req, res) => {
  try {
    const { name, issuer, date, url } = req.body;
    const cert = await prisma.certification.create({
      data: {
        userId: req.user.id,
        name: name?.trim(),
        issuer: issuer?.trim(),
        date: new Date(date),
        url: url?.trim() || null
      }
    });
    res.status(201).json(cert);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create certification' });
  }
});

router.put('/certifications/:id', async (req, res) => {
  try {
    const { name, issuer, date, url } = req.body;
    const cert = await prisma.certification.update({
      where: { id: req.params.id },
      data: {
        name: name?.trim(),
        issuer: issuer?.trim(),
        date: new Date(date),
        url: url?.trim() || null
      }
    });
    res.json(cert);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update certification' });
  }
});

router.delete('/certifications/:id', async (req, res) => {
  try {
    await prisma.certification.deleteMany({
      where: { id: req.params.id, userId: req.user.id }
    });
    res.json({ success: true, id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete certification' });
  }
});

// --- ACHIEVEMENTS (TENANT SCOPED) ---
router.get('/achievements', async (req, res) => {
  try {
    const achievements = await prisma.achievement.findMany({
      where: { userId: req.user.id },
      orderBy: { date: 'desc' }
    });
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

router.post('/achievements', async (req, res) => {
  try {
    const { title, date, description } = req.body;
    const ach = await prisma.achievement.create({
      data: {
        userId: req.user.id,
        title: title?.trim(),
        date: new Date(date),
        description: description?.trim() || null
      }
    });
    res.status(201).json(ach);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create achievement' });
  }
});

router.put('/achievements/:id', async (req, res) => {
  try {
    const { title, date, description } = req.body;
    const ach = await prisma.achievement.update({
      where: { id: req.params.id },
      data: {
        title: title?.trim(),
        date: new Date(date),
        description: description?.trim() || null
      }
    });
    res.json(ach);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update achievement' });
  }
});

router.delete('/achievements/:id', async (req, res) => {
  try {
    await prisma.achievement.deleteMany({
      where: { id: req.params.id, userId: req.user.id }
    });
    res.json({ success: true, id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete achievement' });
  }
});

// --- SITE SETTINGS (TENANT SCOPED) ---
router.get('/settings', async (req, res) => {
  try {
    let settings = await prisma.siteSettings.findFirst({
      where: { userId: req.user.id }
    });
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          userId: req.user.id,
          siteTitle: 'Portfolio',
          defaultTheme: 'dark',
          accentColor: '#00E5FF',
          isAvailableForHire: true
        }
      });
    }
    res.json(settings);
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.put('/settings', async (req, res) => {
  try {
    const {
      siteTitle, siteDescription, metaKeywords,
      defaultTheme, accentColor,
      isAvailableForHire, availabilityStatus, resumeUrl,
      showExperience, showProjects, showSkills, showCredentials, showContact
    } = req.body;

    let settings = await prisma.siteSettings.findFirst({
      where: { userId: req.user.id }
    });

    const updateData = {
      siteTitle: siteTitle?.trim() || 'Portfolio',
      siteDescription: siteDescription?.trim() || null,
      metaKeywords: metaKeywords?.trim() || null,
      defaultTheme: defaultTheme === 'light' ? 'light' : 'dark',
      accentColor: accentColor?.trim() || '#00E5FF',
      isAvailableForHire: Boolean(isAvailableForHire),
      availabilityStatus: availabilityStatus?.trim() || null,
      resumeUrl: resumeUrl?.trim() || null,
      showExperience: showExperience !== undefined ? Boolean(showExperience) : true,
      showProjects: showProjects !== undefined ? Boolean(showProjects) : true,
      showSkills: showSkills !== undefined ? Boolean(showSkills) : true,
      showCredentials: showCredentials !== undefined ? Boolean(showCredentials) : true,
      showContact: showContact !== undefined ? Boolean(showContact) : true,
    };

    if (settings) {
      settings = await prisma.siteSettings.update({
        where: { id: settings.id },
        data: updateData
      });
    } else {
      settings = await prisma.siteSettings.create({
        data: {
          ...updateData,
          userId: req.user.id
        }
      });
    }

    res.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Change own password
router.put('/settings/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) return res.status(400).json({ error: 'Incorrect current password' });

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash: newHash }
    });

    res.json({ success: true, message: 'Password updated successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// Change own login email
router.put('/settings/email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { email: email.trim().toLowerCase() }
    });

    res.json({ success: true, email: updated.email, message: 'Login email updated successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update login email' });
  }
});

// Export own data
router.get('/settings/export', async (req, res) => {
  try {
    const userId = req.user.id;
    const [user, profile, projects, experience, skills, education, certifications, achievements, messages, settings] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, username: true, role: true } }),
      prisma.profile.findFirst({ where: { userId } }),
      prisma.project.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      prisma.experience.findMany({ where: { userId }, orderBy: { startDate: 'desc' } }),
      prisma.skill.findMany({ where: { userId }, orderBy: { name: 'asc' } }),
      prisma.education.findMany({ where: { userId }, orderBy: { startDate: 'desc' } }),
      prisma.certification.findMany({ where: { userId }, orderBy: { date: 'desc' } }),
      prisma.achievement.findMany({ where: { userId }, orderBy: { date: 'desc' } }),
      prisma.message.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      prisma.siteSettings.findFirst({ where: { userId } })
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      user,
      profile,
      siteSettings: settings,
      projects,
      experience,
      skills,
      education,
      certifications,
      achievements,
      messages
    };

    res.json(exportData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export portfolio data' });
  }
});

module.exports = router;
