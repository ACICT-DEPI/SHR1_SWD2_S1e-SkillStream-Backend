const mongoose = require("mongoose");


const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required : [true, 'name is a required field'],
        maxlength: 32
    },
    courses: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Course",
        default: []
    }
})


module.exports = mongoose.model('Category', categorySchema)