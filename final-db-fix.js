const { PrismaClient } = require('@prisma/client');

async function finalDbFix() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
  });
  
  try {
    console.log('Testing database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Try to create a migration using Prisma's programmatic API
    console.log('Attempting to create tables using Prisma migrate...');
    
    const { execSync } = require('child_process');
    
    // First generate the client
    console.log('Generating Prisma client...');
    execSync('npx prisma generate', { 
      cwd: __dirname, 
      stdio: 'inherit',
      timeout: 30000
    });
    console.log('✅ Prisma client generated');
    
    // Then try to push the schema
    console.log('Pushing schema to database...');
    execSync('npx prisma db push --accept-data-loss', { 
      cwd: __dirname, 
      stdio: 'inherit',
      timeout: 30000
    });
    console.log('✅ Schema pushed to database');
    
    // Test that it works
    console.log('Testing project query...');
    const projects = await prisma.project.findMany();
    console.log(`✅ Found ${projects.length} projects`);
    
    console.log('\n🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // Provide specific troubleshooting steps
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Verify your DATABASE_URL in .env is correct');
    console.log('2. Check if your Neon database is active');
    console.log('3. Ensure your network allows connections to Neon');
    console.log('4. Try running: npx prisma db push --accept-data-loss');
    
  } finally {
    await prisma.$disconnect();
  }
}

finalDbFix();