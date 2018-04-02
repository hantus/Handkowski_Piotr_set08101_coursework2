var mongoose = require("mongoose");

var commentSechema = new mongoose.Schema({
  text: String,
  dateComented: {type: Date, default: Date.now()},
  author: {
    id:{type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
    username:String
  }
});

module.exports = mongoose.model("Comment", commentSechema);
