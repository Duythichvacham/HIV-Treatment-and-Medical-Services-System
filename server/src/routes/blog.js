const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const authenticateToken = require('../middlewares/authMiddleware');

router.post('/', authenticateToken, blogController.createBlog);
router.put('/:id', authenticateToken, blogController.updateBlog);
router.patch('/:id', authenticateToken, blogController.deleteBlog);
router.get('/:id', blogController.getBlogById);
router.get('/', blogController.getAllBlogs);

module.exports = router;