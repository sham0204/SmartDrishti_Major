const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('✓ Database connected successfully');
    
    // Test querying projects
    console.log('Testing project query...');
    const projects = await prisma.project.findMany();
    console.log(`✓ Found ${projects.length} projects`);
    
    // Test querying users
    console.log('Testing user query...');
    const users = await prisma.user.findMany();
    console.log(`✓ Found ${users.length} users`);
    
    console.log('\n🎉 Database is working properly!');
    return true;
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.error('Error code:', error.code);
    return false;
    
  } finally {
    await prisma.$disconnect();
  }
}

testConnection().then(success => {
  if (!success) {
    process.exit(1);
  }
});