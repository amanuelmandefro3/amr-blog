/**
 * @swagger
 * tags:
 *   name: Blogs
 *   description: API for managing blogs
 */

const express = require('express');
const router = express.Router();
const BlogController = require('../controllers/blogController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /blogs/create:
 *   post:
 *     summary: Create a new blog
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Blog'
 *     responses:
 *       201:
 *         description: Blog created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/create', authMiddleware, BlogController.createBlog);

/**
 * @swagger
 * /blogs/recommend:
 *   get:
 *     summary: Recommend blogs based on likes and reads
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recommended blogs
 *       401:
 *         description: Unauthorized
 */
router.get('/recommend', authMiddleware, BlogController.recommendBlogs);

/**
 * @swagger
 * /blogs/search:
 *   get:
 *     summary: Search blogs
 *     tags: [Blogs]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search query string
 *     responses:
 *       200:
 *         description: List of blogs matching the query
 */
router.get('/search', BlogController.searchBlogs);

/**
 * @swagger
 * /blogs:
 *   get:
 *     summary: Get all blogs
 *     tags: [Blogs]
 *     responses:
 *       200:
 *         description: List of all blogs
 */
router.get('/', BlogController.getAllBlogs);

/**
 * @swagger
 * /blogs/{id}:
 *   get:
 *     summary: Get a specific blog by ID
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Blog data
 *       404:
 *         description: Blog not found
 */
router.get('/:id', BlogController.getBlogById);

/**
 * @swagger
 * /blogs/{id}:
 *   put:
 *     summary: Edit a specific blog by ID
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Blog'
 *     responses:
 *       200:
 *         description: Blog updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Blog not found
 */
router.put('/:id', authMiddleware, BlogController.editBlog);

/**
 * @swagger
 * /blogs/{id}:
 *   delete:
 *     summary: Delete a specific blog by ID
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Blog deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Blog not found
 */
router.delete('/:id', authMiddleware, BlogController.deleteBlog);

/**
 * @swagger
 * /blogs/{id}/like:
 *   post:
 *     summary: Like a blog
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Blog liked successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/like', authMiddleware, BlogController.likeBlog);

/**
 * @swagger
 * /blogs/{id}/comments:
 *   post:
 *     summary: Add a comment to a blog
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *                 example: "Great post!"
 *     responses:
 *       200:
 *         description: Comment added successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/comments', authMiddleware, BlogController.addComment);

/**
 * @swagger
 * /blogs/{id}/comments:
 *   get:
 *     summary: Get all comments for a specific blog
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: List of comments
 */
router.get('/:id/comments', BlogController.getComments);

/**
 * @swagger
 * /blogs/{id}/comments/{commentId}:
 *   delete:
 *     summary: Delete a comment on a blog
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Comment not found
 */
router.delete('/:id/comments/:commentId', authMiddleware, BlogController.deleteComment);

/**
 * @swagger
 * /blogs/{id}/comments/{commentId}:
 *   put:
 *     summary: Edit a comment on a blog
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *                 example: "Updated comment"
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Comment not found
 */
router.put('/:id/comments/:commentId', authMiddleware, BlogController.editComment);

module.exports = router;
