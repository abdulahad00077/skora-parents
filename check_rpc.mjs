import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ivcgrtxelmgwfxnnjjga.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2Y2dydHhlbG1nd2Z4bm5qamdhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQyMjEwNiwiZXhwIjoyMDg4OTk4MTA2fQ.fS-QIlb92iWmZdj_kjSOk11s9vrViTklZFEV1JuaCjs';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.rpc('run_sql', { sql: "SELECT 1" });
  console.log('Error:', error ? error.message : 'Success');
}

check();
