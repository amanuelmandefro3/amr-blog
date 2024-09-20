const express = require('express');
const router = express.Router()
const {recommendBlogs}  = require('../controllers/recommendController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, recommendBlogs)

module.exports = router