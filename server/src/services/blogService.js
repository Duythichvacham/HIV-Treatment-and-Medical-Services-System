const { sql, poolPromise } = require('../config/db');

// Tạo blog mới
async function createBlog({ title, content, authorId, published = 1 }) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('title', sql.NVarChar, title)
    .input('content', sql.NVarChar, content)
    .input('author_id', sql.Int, authorId)
    .input('published', sql.Int, published)
    .query(`
      INSERT INTO BlogPosts (title, content, author_id, created_at, published)
      OUTPUT INSERTED.*
      VALUES (@title, @content, @author_id, GETDATE(), @published)
    `);
  return result.recordset[0];
}

async function updateBlog(post_id, { title, content, published }) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('post_id', sql.Int, post_id)
    .input('title', sql.NVarChar, title)
    .input('content', sql.NVarChar, content)
    .input('published', sql.Int, published)
    .query(`
      UPDATE dbo.BlogPosts
      SET title = @title, content = @content, published = @published
      WHERE post_id = @post_id;
      SELECT * FROM dbo.BlogPosts WHERE post_id = @post_id;
    `);
  return result.recordset[0];
}

async function deleteBlog(post_id) {
  const pool = await poolPromise;
  await pool.request()
    .input('post_id', sql.Int, post_id)
    .query('UPDATE dbo.BlogPosts SET published = 0 WHERE post_id = @post_id');
}

async function getBlogById(post_id) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('post_id', sql.Int, post_id)
    .query('SELECT * FROM dbo.BlogPosts WHERE post_id = @post_id AND published = 1');
  return result.recordset[0];
}

async function getAllBlogs() {
  const pool = await poolPromise;
  const result = await pool.request()
    .query('SELECT * FROM dbo.BlogPosts WHERE published = 1 ORDER BY created_at DESC');
  return result.recordset;
}

module.exports = {
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogById,
  getAllBlogs
}