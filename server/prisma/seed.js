const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Create a default admin user
  const adminEmail = 'admin@example.com';
  const adminPassword = 'password123';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: passwordHash,
    },
  });

  console.log(`Admin user created with email: ${admin.email}`);

  // 2. Create a default profile
  const profile = await prisma.profile.create({
    data: {
      name: 'Kartik Bhadane',
      tagline: 'Software Engineer',
      bio: 'I build products and solve problems.',
      githubUrl: 'https://github.com/kartik',
    },
  });

  console.log(`Profile created for: ${profile.name}`);

  // 3. Create a dummy skill
  const skill = await prisma.skill.create({
    data: {
      name: 'React',
      category: 'Frontend',
      proficiency: 90,
    },
  });

  console.log(`Skill created: ${skill.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
