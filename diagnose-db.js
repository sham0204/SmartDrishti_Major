const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function diagnose() {
  try {
    console.log('Connecting to database...');
    await prisma.$connect();
    console.log('✓ Database connection successful');
    
    // Check if tables exist by querying the Prisma internal metadata
    console.log('Checking for Project table...');
    try {
      const tableCheck = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Project';`;
      console.log('Project table check result:', tableCheck);
    } catch (error) {
      console.log('Error checking for Project table:', error.message);
    }
    
    // Try to query projects
    console.log('Attempting to query projects...');
    const projects = await prisma.project.findMany();
    console.log(`✓ Found ${projects.length} projects`);
    console.log('Projects:', projects);
    
  } catch (error) {
    console.error('❌ Database Error:', error.message);
    console.error('Error code:', error.code);
    console.error('Error meta:', error.meta);
    
    // Let's also check what tables actually exist
    try {
      const tables = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`;
      console.log('Existing tables:', tables);
    } catch (tableError) {
      console.error('Error listing tables:', tableError.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();