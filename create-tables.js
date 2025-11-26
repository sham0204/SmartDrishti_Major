const { PrismaClient } = require('@prisma/client');

async function createTables() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Connecting to database...');
    await prisma.$connect();
    console.log('✓ Connected successfully');
    
    // Check if tables exist
    console.log('Checking existing tables...');
    const tables = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';`;
    console.log('Existing tables:', tables.map(t => t.table_name));
    
    // If Project table doesn't exist, we'll try to create it
    const projectTableExists = tables.some(t => t.table_name === 'Project');
    if (!projectTableExists) {
      console.log('Project table does not exist. Attempting to create tables...');
      
      // Try to execute the Prisma migration directly
      console.log('Executing Prisma migration...');
      const { execSync } = require('child_process');
      
      try {
        const output = execSync('npx prisma migrate deploy', { 
          cwd: __dirname,
          stdio: 'pipe',
          timeout: 30000
        });
        console.log('Migration output:', output.toString());
      } catch (migrationError) {
        console.error('Migration failed:', migrationError.message);
        console.error('Stderr:', migrationError.stderr ? migrationError.stderr.toString() : 'No stderr');
        console.error('Stdout:', migrationError.stdout ? migrationError.stdout.toString() : 'No stdout');
      }
    } else {
      console.log('Project table already exists');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTables();