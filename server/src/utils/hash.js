const bcrypt = require('bcryptjs');

const users = [
  { username: 'patient01' },
  { username: 'patient02' },
  { username: 'patient03' },
  { username: 'patient04' }

 
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