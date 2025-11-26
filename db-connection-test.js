const { Client } = require('pg');

// Extract database connection details from DATABASE_URL
const databaseUrl = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_Q7zNfHmtiI0A@ep-purple-frost-a8dw0yuh-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require";

// Parse the URL to extract connection parameters
const url = new URL(databaseUrl);
const client = new Client({
  user: url.username,
  password: url.password,
  host: url.hostname,
  port: url.port,
  database: url.pathname.substring(1),
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    await client.connect();
    console.log('✓ Successfully connected to database');
    
    // List all tables
    console.log('Listing tables...');
    const res = await client.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('Tables in database:');
    res.rows.forEach(row => {
      console.log(`  - ${row.table_schema}.${row.table_name}`);
    });
    
    // Check specifically for Project table
    const projectRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'Project';
    `);
    
    if (projectRes.rows.length > 0) {
      console.log('✓ Project table exists');
    } else {
      console.log('✗ Project table does not exist');
    }
    
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
  } finally {
    await client.end();
  }
}

testConnection();