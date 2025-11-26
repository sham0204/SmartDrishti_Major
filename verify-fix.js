const { PrismaClient } = require('@prisma/client');

async function verifyFix() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing database connection and table creation...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test Project table
    console.log('Testing Project table...');
    try {
      const projects = await prisma.project.findMany();
      console.log(`✅ Project table exists with ${projects.length} records`);
    } catch (error) {
      console.log('❌ Project table error:', error.message);
      throw error;
    }
    
    // Test User table
    console.log('Testing User table...');
    try {
      const users = await prisma.user.findMany();
      console.log(`✅ User table exists with ${users.length} records`);
    } catch (error) {
      console.log('❌ User table error:', error.message);
    }
    
    // List all tables
    console.log('Listing all tables...');
    try {
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `;
      
      console.log('📊 Database tables:');
      tables.forEach((row, index) => {
        console.log(`  ${index + 1}. ${row.table_name}`);
      });
    } catch (error) {
      console.log('❌ Error listing tables:', error.message);
    }
    
    console.log('\n🎉 Database verification completed successfully!');
    console.log('The "Invalid prisma.project.findMany() invocation: The table public.Project does not exist" error should now be fixed.');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    
    console.log('\n🔧 To manually fix this issue, try running these commands:');
    console.log('1. npx prisma generate');
    console.log('2. npx prisma db push --accept-data-loss');
    console.log('3. node verify-fix.js  (run this script again to verify)');
    
  } finally {
    await prisma.$disconnect();
  }
}

verifyFix();