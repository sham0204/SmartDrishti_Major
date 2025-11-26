const { Client } = require('pg');

// Your exact Neon database URL
const databaseUrl = "postgresql://neondb_owner:npg_Q7zNfHmtiI0A@ep-purple-frost-a8dw0yuh-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require";

async function testNeonConnection() {
  console.log('Testing Neon database connection...');
  console.log('Database URL:', databaseUrl);
  
  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Test connection
    await client.connect();
    console.log('✅ Successfully connected to Neon database!');
    
    // Test a simple query
    const result = await client.query('SELECT version();');
    console.log('✅ Database version:', result.rows[0].version);
    
    // Check if database exists and is accessible
    try {
      const dbCheck = await client.query('SELECT current_database(), current_user;');
      console.log('✅ Current database:', dbCheck.rows[0].current_database);
      console.log('✅ Current user:', dbCheck.rows[0].current_user);
    } catch (dbError) {
      console.log('⚠️ Database/user check failed:', dbError.message);
    }
    
    // List all tables
    try {
      const tables = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `);
      console.log('📊 Tables in database:');
      if (tables.rows.length === 0) {
        console.log('  (No tables found)');
      } else {
        tables.rows.forEach(row => {
          console.log(`  - ${row.table_name}`);
        });
      }
    } catch (tableError) {
      console.log('⚠️ Could not list tables:', tableError.message);
    }
    
    await client.end();
    console.log('\n🎉 All tests completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Provide specific troubleshooting suggestions
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 Troubleshooting suggestions:');
      console.log('1. Check if the Neon database is running');
      console.log('2. Verify your network connection');
      console.log('3. Check if there are firewall restrictions');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n🔧 Troubleshooting suggestions:');
      console.log('1. Verify the database hostname is correct');
      console.log('2. Check your DNS settings');
    } else if (error.code === '28P01') {
      console.log('\n🔧 Troubleshooting suggestions:');
      console.log('1. Verify your username and password');
      console.log('2. Check if credentials have expired');
    } else if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.log('\n🔧 Troubleshooting suggestions:');
      console.log('1. Verify the database "neondb" exists in your Neon project');
      console.log('2. Check if you have access to this database');
    }
    
    return false;
  }
}

testNeonConnection();