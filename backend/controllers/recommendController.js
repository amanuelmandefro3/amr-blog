const {recommendBlogsByTags} = require('../utils/recommendationUtils')

exports.recommendBlogs = async(req, res) => {
    try{
        const recommendations = await recommendBlogsByTags(req.user.id);

    }catch(error){
        console.error(error.message)
        res.status(500).send('Server error');
        
    }
}