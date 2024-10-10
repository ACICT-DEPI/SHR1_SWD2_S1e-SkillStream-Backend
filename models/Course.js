const mongoose = require("mongoose");


const courseSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required : [true, 'name is a required field'],
        maxlength: 32
    },
    description: {
        type: String,
        trim: true,
        required : [true, 'description is a required field'],
        maxlength: 200
    },
    level: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced"],
        required : [true, 'level is a required field'],
    },
    duration: {
        type: Number,
        required : [true, 'duration is a required field'],
        maxlength: 8
    },
    image: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    price: {
        type: Number,
        required : [true, 'price is a required field'],
        maxlength: 8,
        default: 0
    },
    categories: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Category",
        required : [true, 'category is a required field'],
    },
    instructors: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
        required : [true, 'instructor is a required field'],
    },
    likes: {
        type: Number,
        default: 0
    },

    content: {
        type: String,
        required : [true, 'content is a required field'],
    }
})



module.exports = mongoose.model('Course', courseSchema)