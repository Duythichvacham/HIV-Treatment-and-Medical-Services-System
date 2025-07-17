const blogService = require('../services/blogService');

// Tạo blog mới
exports.createBlog = async (req, res) => {
  try {
    const authorId = req.user.userId; // Lấy từ token
    const { title, content, published = 1 } = req.body;
    const blog = await blogService.createBlog({ title, content, authorId, published });
    res.status(201).json(blog);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const { title, content, published } = req.body;
    const blog = await blogService.updateBlog(req.params.id, { title, content, published });
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    await blogService.deleteBlog(req.params.id);
    res.json({ message: 'Blog deleted (soft)' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getBlogById = async (req, res) => {
  try {
    const blog = await blogService.getBlogById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await blogService.getAllBlogs();
    res.json(blogs);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};