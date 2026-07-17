import { supabase } from './services/supabase';

async function run() {
  const { data, error } = await supabase.from('schools').select('*').limit(1);
  console.log('Data:', data);
  if (error) console.error('Error:', error);
}

run();
