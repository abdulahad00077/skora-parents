import fs from 'fs';

const spec = JSON.parse(fs.readFileSync('spec.json', 'utf8'));

const definitions = spec.definitions || spec.components?.schemas || {};
const tables = Object.keys(definitions);

console.log('--- ALL TABLES ---');
console.log(tables.join(', '));

const transportTables = tables.filter(t => t.includes('transport') || t.includes('route') || t.includes('bus') || t.includes('driver'));
console.log('\n--- TRANSPORT TABLES ---');
for (const t of transportTables) {
  const props = definitions[t].properties || {};
  console.log(t + ' columns: ' + Object.keys(props).join(', '));
}

// Check if students has route_id in spec
if (definitions['students']) {
  console.log('\n--- STUDENTS COLUMNS ---');
  console.log(Object.keys(definitions['students'].properties || {}).join(', '));
}
