const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('Connected to database successfully');
    
    // Try to query the Project table
    const projects = await prisma.project.findMany();
    console.log(`Found ${projects.length} projects`);
    
  } catch (error) {
    console.error('Database connection error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();