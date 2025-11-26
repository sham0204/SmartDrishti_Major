const { Client } = require('pg');

// Extract database connection details from DATABASE_URL
const databaseUrl = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_Q7zNfHmtiI0A@ep-purple-frost-a8dw0yuh-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require";

async function setupDatabase() {
  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Connecting to Neon database...');
    await client.connect();
    console.log('✅ Connected to database');
    
    // Check existing tables
    console.log('Checking existing tables...');
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('Existing tables:');
    res.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Check specifically for Project table
    const projectTable = res.rows.find(row => row.table_name === 'Project');
    if (projectTable) {
      console.log('✅ Project table already exists');
      return;
    }
    
    console.log('❌ Project table does not exist, creating tables...');
    
    // Create tables in the correct order
    console.log('Creating tables...');
    
    // Project table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Project" (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        "shortDescription" TEXT NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Created Project table');
    
    // User table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "User" (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(255) UNIQUE NOT NULL,
        "passwordHash" VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'USER',
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Created User table');
    
    // UserProject table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "UserProject" (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL,
        "projectId" INTEGER NOT NULL,
        status VARCHAR(50) DEFAULT 'NOT_STARTED',
        "lastActivityAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("userId", "projectId")
      );
    `);
    console.log('✅ Created UserProject table');
    
    console.log('🎉 All tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
  } finally {
    await client.end();
  }
}

setupDatabase();