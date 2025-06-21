const bcrypt = require('bcryptjs');

const users = [
  { username: 'patient1' },
  { username: 'patient2' },
 
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