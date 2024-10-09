const mongoose = require('mongoose');


const blackListedTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
})




blackListedTokenSchema.statics.cleanUpExpiredTokens = async function () {
    try {
        // Delete tokens that have expired
        await this.deleteMany({ expiresAt: { $lt: Date.now() } });
        console.log('Expired tokens have been cleaned up.');
    } catch (error) {
        console.error('Error cleaning up expired tokens:', error);
    }
};


const BlackListedToken = mongoose.model('BlackListedToken', blackListedTokenSchema)

module.exports = BlackListedToken