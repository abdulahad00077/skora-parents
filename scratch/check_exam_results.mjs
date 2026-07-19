import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ivcgrtxelmgwfxnnjjga.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2Y2dydHhlbG1nd2Z4bm5qamdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjIxMDYsImV4cCI6MjA4ODk5ODEwNn0.dMATNVcpcJMjHOGs7bA04Y6JzvZP1pf15XZHs0vPc44'
);

async function run() {
  const { data, error } = await supabase.from('exam_results').select('*').limit(1);
  console.log(JSON.stringify(data, null, 2));
}

run();
