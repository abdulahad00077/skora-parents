import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ivcgrtxelmgwfxnnjjga.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2Y2dydHhlbG1nd2Z4bm5qamdhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQyMjEwNiwiZXhwIjoyMDg4OTk4MTA2fQ.fS-QIlb92iWmZdj_kjSOk11s9vrViTklZFEV1JuaCjs';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('transport_allocations').select('*');
  if (error) {
    console.log('Error:', error.message);
  } else {
    console.log(`Found ${data.length} allocations`);
    if (data.length > 0) {
      console.log('Sample:', JSON.stringify(data[0], null, 2));
    }
  }
}

check();
