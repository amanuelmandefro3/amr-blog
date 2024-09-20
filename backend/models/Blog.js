const mongoose = require("mongoose");

// Schema for individual comments
const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the user who commented
  text: { type: String, required: true }, // The comment text
  createdAt: { type: Date, default: Date.now }
});

// Main Blog schema
const blockSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['text', 'image', 'code', 'embed', 'video'],
    required: true
  },
  data: {
    text: String,
    imageUrl: String,
    code: String,
    embedUrl: String,
    videoUrl: String
  },
  styles: {
    bold: { type: Boolean, default: false },
    italic: { type: Boolean, default: false },
    quote: { type: Boolean, default: false },
    link: { type: String, default: '' },
    textSize: { type: String, enum: ['small', 'normal', 'large'], default: 'normal' }
  }
});

const blogSchema = new mongoose.Schema({
  title: { type: String, required: [true, "Title is required"] },
  content: [blockSchema], // Array of content blocks
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  tags: [String],
  createdAt: { type: Date, default: Date.now },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array to store users who liked the post
  shares: { type: Number, default: 0 }, // Counter for shares
  comments: [commentSchema] // Array of comment sub-documents
});

module.exports = mongoose.model("Blog", blogSchema);
