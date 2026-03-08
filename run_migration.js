const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  'https://zobfmurtingbkyljpduf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvYmZtdXJ0aW5nYmt5bGpwZHVmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjY0NjEzOCwiZXhwIjoyMDg4MjIyMTM4fQ.hb-dIFb0Zia4vPhTSelofdPk6pk1HSPKdwWOHiWErH4'
);

async function runMigration() {
  try {
    const sqlContent = fs.readFileSync('supabase/migrations/002_creator_codes.sql', 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = sqlContent.split(';').map(s => s.trim()).filter(s => s);
    
    for (const statement of statements) {
      console.log('Executing:', statement.substring(0, 50) + '...');
      const { error } = await supabase.rpc('exec', { sql: statement });
      if (error) {
        console.error('Error:', error);
      } else {
        console.log('Success!');
      }
    }
  } catch (error) {
    console.error('Migration error:', error);
  }
}

runMigration();