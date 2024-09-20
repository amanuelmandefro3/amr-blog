const { process_params } = require('express/lib/router')
const jwt = require('jsonwebtoken')
require('dotenv').config()

module.exports = function (req, res, next){
    const token = req.header('Authorization')
    if(!token){
        return res.status(401).json({msg:'No token, authorization denied'})
    }
    try{
        const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
        req.user = decoded.user;
        next()


    }catch(error){
        console.error(error.message)
        res.status(401).json({msg:'Token is not valid'})
    }

    
}