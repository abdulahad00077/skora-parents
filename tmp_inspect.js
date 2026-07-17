require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .limit(1);
    
  if (error) {
    if (error.code === '42P01') {
      console.log('messages table completely missing?');
    }
    console.log('Error fetching metadata (expected columns issue?):', error);
    
    // Fallback: check information schema using postgres rpc if possible, 
    // but just checking the error message is easier.
  }
  if (data && data.length > 0) {
    console.log('Keys in messages:', Object.keys(data[0]));
  } else if (data) {
    console.log('Table empty, but exists. Checking what happens when selecting a bogus column.');
    const { error: e2 } = await supabase.from('messages').select('this_does_not_exist').limit(1);
    console.log('Error from bogus select:', e2);
  }
}

checkSchema().catch(console.error);
