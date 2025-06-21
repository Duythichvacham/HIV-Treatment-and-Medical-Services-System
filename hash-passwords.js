const bcrypt = require('./server/node_modules/bcryptjs');

// Hash passwords for sample data
async function hashPasswords() {
  const passwords = [
    'hash_admin_password',
    'hash_doctor1_password', 
    'hash_doctor2_password',
    'hash_doctor3_password',
    'hash_lab1_password',
    'hash_lab2_password', 
    'hash_reg1_password',
    'hash_reg2_password',
    'hash_patient1_password',
    'hash_patient2_password',
    'hash_patient3_password',
    'hash_patient4_password',
    'hash_patient5_password'
  ];

  console.log('-- Hashed passwords for sample data:');
  for (let password of passwords) {
    const hashed = await bcrypt.hash(password, 10);
    console.log(`'${hashed}', -- ${password}`);
  }
}

hashPasswords();
