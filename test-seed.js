const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function testSeed() {
  try {
    console.log("Testing database connection...");
    await prisma.$connect();
    console.log("✅ Database connected successfully");
    
    console.log("Creating test project...");
    const project = await prisma.project.upsert({
      where: { key: "water-level" },
      update: {},
      create: {
        key: "water-level",
        title: "Water Level Detector",
        shortDescription: "Monitor and visualize tank water levels in real time."
      }
    });
    console.log("✅ Project created/updated:", project.title);
    
    console.log("Creating test user...");
    const passwordHash = await bcrypt.hash("test123", 10);
    const user = await prisma.user.upsert({
      where: { username: "testuser" },
      update: {},
      create: {
        name: "Test User",
        username: "testuser",
        email: "test@example.com",
        passwordHash,
        role: "USER"
      }
    });
    console.log("✅ User created/updated:", user.username);
    
    console.log("Linking user to project...");
    const userProject = await prisma.userProject.upsert({
      where: { userId_projectId: { userId: user.id, projectId: project.id } },
      update: {},
      create: {
        userId: user.id,
        projectId: project.id,
        status: "NOT_STARTED"
      }
    });
    console.log("✅ User linked to project");
    
    console.log("\n🎉 Test completed successfully!");
    console.log("You can now run your project pages without 'Project Not Found' errors.");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testSeed();