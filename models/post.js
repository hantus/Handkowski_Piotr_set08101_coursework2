var mongoose = require("mongoose");

// DATA STRUCTURE FOR POSTS
var postSechema = new mongoose.Schema({
  name: String,
  image: String,
  content: String,
  datePosted: {type: Date, default: Date.now()},
  author: {
    id:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username:String
  },
  comments: [
    {type: mongoose.Schema.Types.ObjectId, ref: "Comment"}
  ]
});

module.exports = mongoose.model("Post", postSechema);
