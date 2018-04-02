var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment = require("./models/comment");
var data = [
  {
  name: "Cloud's Rest",
  image: "https://pixabay.com/get/eb32b9072ef3063ed1584d05fb1d4e97e07ee3d21cac104497f2c37aaee8bdbf_340.jpg",
  description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
  },
  {
  name: "Salmon Creek",
  image: "https://pixabay.com/get/ea36b70928f21c22d2524518b7444795ea76e5d004b0144397f2c270a2e5b2_340.jpg",
  description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
  },
  {
  name: "Cool Place",
  image: "https://pixabay.com/get/eb35b70b2df6033ed1584d05fb1d4e97e07ee3d21cac104497f2c37aaee8bdbf_340.jpg",
  description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
  },
];


function seedDB(){
  Campground.remove({}, function(err){
    // if(err){
    //   console.log(err);
    // }
    // else {
    //   console.log("removed campgrounds!");
    //   data.forEach(function(seed){
    //     Campground.create(seed, function(err, campground){
          // if(err){
      //       console.log(err);
      //     }else {
      //       console.log("added a campground");
      //       //create a comment
      //       Comment.create({
      //         text: "This place is great, but I wish there was internet",
      //         author: "Homer"
      //       }, function(err, comment){
      //         if(err){
      //           console.log(err);
      //         }else {
      //           campground.comments.push(comment);
      //           campground.save();
      //           console.log("Created new comment");
      //         }
      //
      //       });
      //     }
      //   });
      // });
    // }
  });

}


module.exports = seedDB;
