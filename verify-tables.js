const { PrismaClient } = require('@prisma/client');

async function verifyTables() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Connecting to database...');
    await prisma.$connect();
    console.log('✅ Connected to database');
    
    // Check if Project table exists by querying it
    console.log('Checking Project table...');
    try {
      const projectCount = await prisma.project.count();
      console.log(`✅ Project table exists with ${projectCount} records`);
    } catch (error) {
      console.log('❌ Project table error:', error.message);
    }
    
    // Check if User table exists
    console.log('Checking User table...');
    try {
      const userCount = await prisma.user.count();
      console.log(`✅ User table exists with ${userCount} records`);
    } catch (error) {
      console.log('❌ User table error:', error.message);
    }
    
    // List all tables using raw query
    console.log('Listing all tables...');
    try {
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `;
      
      console.log('📊 All tables in database:');
      tables.forEach((row, index) => {
        console.log(`  ${index + 1}. ${row.table_name}`);
      });
    } catch (error) {
      console.log('❌ Error listing tables:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyTables();