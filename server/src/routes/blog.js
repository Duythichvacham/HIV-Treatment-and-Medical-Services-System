const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, blogController.createBlog);
router.put("/:id", authMiddleware, blogController.updateBlog);
router.patch("/:id", authMiddleware, blogController.deleteBlog);
router.get("/:id", blogController.getBlogById);
router.get("/", blogController.getAllBlogs);

module.exports = router;
