const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createUser({ name, username, email, password, role }) {
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.upsert({
    where: { username },
    update: {},
    create: {
      name,
      username,
      email,
      passwordHash,
      role
    }
  });
}

async function createProject({ key, title, shortDescription }) {
  return prisma.project.upsert({
    where: { key },
    update: {},
    create: {
      key,
      title,
      shortDescription
    }
  });
}

async function linkUserToProject({ userId, projectId }) {
  return prisma.userProject.upsert({
    where: { userId_projectId: { userId, projectId } },
    update: {},
    create: {
      userId,
      projectId,
      status: "NOT_STARTED"
    }
  });
}

async function main() {
  console.log("Seeding database...");
  
  // 1. Create default projects
  console.log("Creating default projects...");
  const [waterProject, homeProject] = await Promise.all([
    createProject({
      key: "water-level",
      title: "Water Level Detector",
      shortDescription: "Monitor and visualize tank water levels in real time."
    }),
    createProject({
      key: "home-appliances",
      title: "Home Appliances Monitoring System",
      shortDescription: "Control LEDs and fans remotely via the cloud."
    })
  ]);
  
  console.log(`Created/updated projects: ${waterProject.title}, ${homeProject.title}`);
  
  // 2. Create default demo users
  console.log("Creating default demo users...");
  const admin = await createUser({
    name: "Administrator",
    username: "admin",
    email: "admin@example.com",
    password: "admin123",
    role: "ADMIN"
  });
  
  const userPromises = Array.from({ length: 5 }).map((_, idx) =>
    createUser({
      name: `User ${idx + 1}`,
      username: `user${idx + 1}`,
      email: `user${idx + 1}@example.com`,
      password: "user123",
      role: "USER"
    })
  );
  
  const users = await Promise.all(userPromises);
  const allUsers = [admin, ...users];
  console.log(`Created/updated ${allUsers.length} users`);
  
  // 3. Link all existing users to all projects
  console.log("Linking all users to projects...");
  const projects = [waterProject, homeProject];
  
  // Get all existing users from the database (not just the demo ones)
  const existingUsers = await prisma.user.findMany();
  console.log(`Found ${existingUsers.length} total users in database`);
  
  // Link each user to each project
  for (const user of existingUsers) {
    for (const project of projects) {
      await linkUserToProject({
        userId: user.id,
        projectId: project.id
      });
    }
  }
  
  console.log(`Linked ${existingUsers.length} users to ${projects.length} projects each`);
  console.log("Seed data created successfully!");
}

main()
  .catch((error) => {
    console.error("Seeding error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });