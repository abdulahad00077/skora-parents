require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data, error } = await supabase
    .from('homework_submissions')
    .select('*')
    .limit(1);
    
  if (error) {
    console.log('Error fetching metadata:', error);
  }
  if (data && data.length > 0) {
    console.log('Keys in homework_submissions:', Object.keys(data[0]));
    console.log('Row:', data[0]);
  } else if (data) {
    console.log('Table empty.');
  }
}

checkSchema().catch(console.error);
