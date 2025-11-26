const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Function to test database connection and setup
async function setupDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('✓ Connected to database successfully');
    
    // Try to create a simple record to test write permissions
    console.log('Testing write permissions...');
    
    try {
      // Try to upsert a project
      const project = await prisma.project.upsert({
        where: { key: 'test-project' },
        update: {},
        create: {
          key: 'test-project',
          title: 'Test Project',
          shortDescription: 'Test project for database setup'
        }
      });
      console.log('✓ Write test successful, created/updated project:', project.title);
      
      // Clean up test project
      await prisma.project.delete({
        where: { key: 'test-project' }
      });
      console.log('✓ Cleaned up test project');
      
    } catch (writeError) {
      console.error('❌ Write test failed:', writeError.message);
      console.error('Error code:', writeError.code);
      return false;
    }
    
    console.log('Database setup verification completed successfully!');
    return true;
    
  } catch (connectionError) {
    console.error('❌ Database connection failed:', connectionError.message);
    console.error('Error code:', connectionError.code);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
setupDatabase().then(success => {
  if (success) {
    console.log('\n🎉 Database is ready for use!');
    process.exit(0);
  } else {
    console.log('\n💥 Database setup failed. Please check your configuration.');
    process.exit(1);
  }
});