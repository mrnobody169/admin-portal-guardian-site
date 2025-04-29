
import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupSupabase() {
  try {
    console.log('Setting up Supabase tables...');

    // Check if tables exist first
    await ensureTablesExist();

    // Insert default sites
    await createDefaultSites();
    
    // Create admin user
    await createAdminUser();

    console.log('Supabase setup completed successfully!');
  } catch (error) {
    console.error('Error setting up Supabase:', error);
  }
}

async function ensureTablesExist() {
  console.log('Ensuring tables exist in Supabase...');
  
  // We'll use SQL functions in Supabase to create tables if they don't exist
  // In a real implementation, you would use Supabase migrations or the SQL editor in the dashboard
  
  console.log('Note: Please make sure to create the following tables in Supabase:');
  console.log('1. users (id, username, password, email, name, role, created_at, updated_at)');
  console.log('2. sites (id, site_name, site_id, status, created_at, updated_at)');
  console.log('3. bank_accounts (id, account_no, account_holder, bank_name, site_id, status, created_at, updated_at)');
  console.log('4. account_logins (id, username, password, token, site_id, status, created_at, updated_at)');
  console.log('5. logs (id, action, entity, entity_id, user_id, details, created_at)');
  console.log('You can do this through the Supabase dashboard SQL editor.');
}

async function createDefaultSites() {
  try {
    console.log('Checking and creating default sites...');
    
    // Define the three required sites
    const defaultSites = [
      { site_name: "play.iwin.bio", site_id: "play-iwin-bio" },
      { site_name: "play.b52.cc", site_id: "play-b52-cc" },
      { site_name: "i.rik.vip", site_id: "i-rik-vip" }
    ];
    
    for (const siteData of defaultSites) {
      // Check if site already exists
      const { data: existingSites, error: selectError } = await supabase
        .from('sites')
        .select('*')
        .eq('site_id', siteData.site_id);
      
      if (selectError) {
        console.error(`Error checking if site ${siteData.site_name} exists:`, selectError);
        continue;
      }
      
      if (!existingSites || existingSites.length === 0) {
        // Create the site if it doesn't exist
        const { data, error } = await supabase
          .from('sites')
          .insert({
            site_name: siteData.site_name,
            site_id: siteData.site_id,
            status: 'active'
          });
        
        if (error) {
          console.error(`Error creating site ${siteData.site_name}:`, error);
        } else {
          console.log(`Created site: ${siteData.site_name}`);
        }
      } else {
        console.log(`Site already exists: ${siteData.site_name}`);
      }
    }
    
    console.log('Default sites setup completed');
  } catch (error) {
    console.error('Error creating default sites:', error);
    throw error;
  }
}

async function createAdminUser() {
  try {
    console.log('Checking and creating admin user...');
    
    // Check if admin already exists
    const { data: existingUsers, error: selectError } = await supabase
      .from('users')
      .select('*')
      .eq('username', 'admin');
    
    if (selectError) {
      console.error('Error checking if admin user exists:', selectError);
      return;
    }
    
    if (!existingUsers || existingUsers.length === 0) {
      // Hash the password
      const password = 'admin';
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      // Create the admin user
      const { data, error } = await supabase
        .from('users')
        .insert({
          username: 'admin',
          password: hashedPassword,
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin'
        });
      
      if (error) {
        console.error('Error creating admin user:', error);
      } else {
        console.log('Created default admin user (username: admin, password: admin)');
      }
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
}

// Run the setup
setupSupabase();
