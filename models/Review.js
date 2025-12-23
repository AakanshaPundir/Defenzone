const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    name: String,
    email: String,
    rating: Number,
    message: String,
}, { timestamps: true });

module.exports = mongoose.model("Review", reviewSchema);
