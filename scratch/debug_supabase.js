const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugLogin() {
  console.log('Checking students table...');
  
  // 1. Try to fetch 1 student to see columns
  const { data: sampleData, error: sampleError } = await supabase
    .from('students')
    .select('*')
    .limit(1);
    
  if (sampleError) {
    console.error('Error fetching sample student:', sampleError);
  } else if (sampleData && sampleData.length > 0) {
    console.log('Columns in students table:', Object.keys(sampleData[0]));
    console.log('Sample parent_phone:', sampleData[0].parent_phone);
  } else {
    console.log('No students found (empty or RLS).');
  }

  // 1b. Try to fetch schools
  const { data: schoolsData, error: schoolsError } = await supabase
    .from('schools')
    .select('*')
    .limit(1);
  
  if (schoolsError) {
    console.error('Error fetching schools:', schoolsError);
  } else {
    console.log('Schools found:', schoolsData?.length);
    if (schoolsData && schoolsData.length > 0) {
        console.log('School keys:', Object.keys(schoolsData[0]));
    }
  }

  // 2. Try simple query without join
  const testPhone = '8826324063'; // Replace with a real one if I knew it, but let's just test the logic
  const { data: testData, error: testError } = await supabase
    .from('students')
    .select('*')
    .or(`parent_phone.eq.${testPhone}`);
    
  if (testError) {
    console.error('Error in simple query:', testError);
  } else {
    console.log('Simple query results count:', testData?.length);
  }
}

debugLogin();
