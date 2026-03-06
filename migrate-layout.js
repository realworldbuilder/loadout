const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zobfmurtingbkyljpduf.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvYmZtdXJ0aW5nYmt5bGpwZHVmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjY0NjEzOCwiZXhwIjoyMDg4MjIyMTM4fQ.hb-dIFb0Zia4vPhTSelofdPk6pk1HSPKdwWOHiWErH4';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function addLayoutColumn() {
  console.log('Adding layout column to products table...');
  
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `ALTER TABLE products ADD COLUMN IF NOT EXISTS layout TEXT DEFAULT 'classic' CHECK (layout IN ('classic', 'featured'));`
  });

  if (error) {
    console.error('Error adding layout column:', error);
  } else {
    console.log('Successfully added layout column!');
  }
}

addLayoutColumn();