const https = require('https');

const supabaseUrl = 'https://zobfmurtingbkyljpduf.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvYmZtdXJ0aW5nYmt5bGpwZHVmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjY0NjEzOCwiZXhwIjoyMDg4MjIyMTM4fQ.hb-dIFb0Zia4vPhTSelofdPk6pk1HSPKdwWOHiWErH4';

console.log('Database migration needed:');
console.log('Please run this SQL in your Supabase SQL editor:');
console.log('');
console.log('ALTER TABLE products ADD COLUMN IF NOT EXISTS layout TEXT DEFAULT \'classic\' CHECK (layout IN (\'classic\', \'featured\'));');
console.log('');
console.log('Or use the Supabase dashboard to add the column manually.');
console.log('Database migration cannot be automated from this script.');