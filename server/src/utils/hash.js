const bcrypt = require('bcryptjs');

const users = [
  { username: 'patient1' },
  { username: 'patient2' },
  { username: 'labstaff1' },
  { username: 'regstaff1' },
  { username: 'doctor1' },
  { username: 'manager1' },
];

const saltRounds = 10;

async function hashPasswords() {
  for (let user of users) {
    
    const password = user.username;

    try {
      const hash = await bcrypt.hash(password, saltRounds);
      console.log(`${user.username}: ${hash}`);
    } catch (err) {
      console.error(`Lỗi với ${user.username}:`, err);
    }
  }
}

hashPasswords();