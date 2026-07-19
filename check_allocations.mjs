import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ivcgrtxelmgwfxnnjjga.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2Y2dydHhlbG1nd2Z4bm5qamdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjIxMDYsImV4cCI6MjA4ODk5ODEwNn0.dMATNVcpcJMjHOGs7bA04Y6JzvZP1pf15XZHs0vPc44';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('transport_allocations').select('*');
  if (error) {
    console.log('Error:', error.message);
  } else {
    console.log('Allocations:', JSON.stringify(data, null, 2));
  }
}

check();
