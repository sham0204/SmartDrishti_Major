const { PrismaClient } = require('@prisma/client');

async function createTables() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Connecting to database...');
    await prisma.$connect();
    console.log('✅ Connected to database');
    
    // Test if tables exist by trying to query them
    console.log('Checking if Project table exists...');
    try {
      const projects = await prisma.project.findMany();
      console.log(`✅ Project table exists with ${projects.length} records`);
      return;
    } catch (error) {
      console.log('❌ Project table does not exist, creating tables...');
    }
    
    // Create tables one by one
    console.log('Creating Project table...');
    try {
      // We can't directly create tables with Prisma, but we can try to create a record
      // which will fail if the table doesn't exist
      await prisma.project.create({
        data: {
          key: 'test',
          title: 'Test Project',
          shortDescription: 'Test project for table creation'
        }
      });
      console.log('✅ Successfully created test project');
      
      // Clean up test record
      await prisma.project.delete({
        where: { key: 'test' }
      });
      console.log('✅ Cleaned up test project');
    } catch (error) {
      console.log('❌ Error creating project:', error.message);
      
      // Try using Prisma's db push
      console.log('Attempting to push schema to database...');
      const { execSync } = require('child_process');
      try {
        const result = execSync('npx prisma db push --accept-data-loss', {
          cwd: __dirname,
          stdio: 'inherit'
        });
        console.log('✅ Schema pushed successfully');
      } catch (pushError) {
        console.log('❌ Error pushing schema:', pushError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTables();