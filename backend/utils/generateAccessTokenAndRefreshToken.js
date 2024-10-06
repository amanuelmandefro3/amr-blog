const User = require("../models/User");

exports.generateAccessTokenAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken

        await user.save({validateBeforeSave: false})


        return {accessToken, refreshToken}
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
}