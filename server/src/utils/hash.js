const bcrypt = require('bcryptjs');

const password = '@1'; // Thay bằng mật khẩu bạn muốn hash

bcrypt.hash(password, 10).then(hash => {
  console.log('Hash:', hash);
});