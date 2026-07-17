const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ivcgrtxelmgwfxnnjjga.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2Y2dydHhlbG1nd2Z4bm5qamdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjIxMDYsImV4cCI6MjA4ODk5ODEwNn0.dMATNVcpcJMjHOGs7bA04Y6JzvZP1pf15XZHs0vPc44';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchUser() {
  const { data: students, error } = await supabase
    .from('students')
    .select('name, parent_phone, date_of_birth')
    .limit(1);

  if (error) {
    console.error(error);
    return;
  }

  if (students && students.length > 0) {
    const student = students[0];
    const firstName = student.name.split(' ')[0].toLowerCase().substring(0, 4);
    const birthYear = new Date(student.date_of_birth).getFullYear();
    const expectedPassword = `${firstName}${birthYear}`.toLowerCase();

    console.log(`\n--- Test Credentials ---`);
    console.log(`Student Name: ${student.name}`);
    console.log(`Phone Number: ${student.parent_phone}`);
    console.log(`Password: ${expectedPassword}`);
    console.log(`------------------------\n`);
  } else {
    console.log("No students found in the database.");
  }
}

fetchUser();
