const Blog = require('../models/Blog')

exports.recommendBlogsByTags = async(userId) =>{
    const userBlogs = await Blog.find({readers: userId})
    const tags =userBlogs.flatMap(blog=>blog.tags)
    
    const recommendedBlogs = await Blog.find({
        tags: {$in:tags},
        _id:{$nin:userBlogs.map(blog=>blog._id)}
    }).limit(10)

    return recommendedBlogs
}