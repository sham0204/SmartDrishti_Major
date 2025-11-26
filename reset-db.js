const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Resetting database...');
    
    // Delete existing data in the correct order to avoid foreign key constraints
    await prisma.applianceState.deleteMany();
    await prisma.waterLevelEntry.deleteMany();
    await prisma.userApiConfig.deleteMany();
    await prisma.userProject.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();
    
    console.log('Creating projects...');
    
    // Create projects
    const waterProject = await prisma.project.upsert({
      where: { key: "water-level" },
      update: {},
      create: {
        key: "water-level",
        title: "Water Level Detector",
        shortDescription: "Monitor and visualize tank water levels in real time."
      }
    });
    
    const homeProject = await prisma.project.upsert({
      where: { key: "home-appliances" },
      update: {},
      create: {
        key: "home-appliances",
        title: "Home Appliances Monitoring System",
        shortDescription: "Control LEDs and fans remotely via the cloud."
      }
    });
    
    console.log('Creating admin user...');
    
    // Create admin user
    const adminPasswordHash = await bcrypt.hash("admin123", 10);
    const admin = await prisma.user.upsert({
      where: { username: "admin" },
      update: {},
      create: {
        name: "Administrator",
        username: "admin",
        email: "admin@example.com",
        passwordHash: adminPasswordHash,
        role: "ADMIN"
      }
    });
    
    console.log('Creating demo users...');
    
    // Create demo users
    const userPromises = Array.from({ length: 5 }).map(async (_, idx) => {
      const passwordHash = await bcrypt.hash("user123", 10);
      return prisma.user.upsert({
        where: { username: `user${idx + 1}` },
        update: {},
        create: {
          name: `User ${idx + 1}`,
          username: `user${idx + 1}`,
          email: `user${idx + 1}@example.com`,
          passwordHash: passwordHash,
          role: "USER"
        }
      });
    });
    
    const users = await Promise.all(userPromises);
    const allUsers = [admin, ...users];
    
    console.log('Setting up user projects...');
    
    // Set up user projects
    for (const user of allUsers) {
      await prisma.userProject.upsert({
        where: { userId_projectId: { userId: user.id, projectId: waterProject.id } },
        update: {},
        create: {
          userId: user.id,
          projectId: waterProject.id,
          status: "NOT_STARTED"
        }
      });
      
      await prisma.userProject.upsert({
        where: { userId_projectId: { userId: user.id, projectId: homeProject.id } },
        update: {},
        create: {
          userId: user.id,
          projectId: homeProject.id,
          status: "NOT_STARTED"
        }
      });
    }
    
    console.log('Database reset and seeding completed successfully!');
    console.log('Demo users:');
    console.log('- Admin: admin / admin123');
    console.log('- Users: user1, user2, user3, user4, user5 (password: user123)');
    
  } catch (error) {
    console.error('Error resetting database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();