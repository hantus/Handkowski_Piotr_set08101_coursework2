var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var Post = require("./models/post");
var User = require("./models/user");
var Comment = require("./models/comment");
var passport = require("passport");
var localStrategy = require("passport-local");
var methodOverride = require("method-override");
var flash = require("connect-flash");

app.set('port', (process.env.PORT || 5000));


mongoose.connect("mongodb://localhost/blogging_app");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

// PASSPORT CONFIGURATION

app.use(require("express-session")({
  secret: "This is my blogging application. Enjoy using it!",
  resave:false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// app.use(function(req, res, next){
//   res.locals.currentUser = req.user;
//   res.locals.message = req.flash("error");
// });


app.get("/", function(req, res){
  res.render("landing", {currentUser: req.user});

});

// INDEX show all posts
app.get("/posts", function(req, res){
  Post.find({}, function(err, posts){
    if(err){
      console.log(err);
    }else {
      res.render("posts/index" , {posts : posts, currentUser: req.user});
    }
  });

});

// shows all posts of the currentUser
app.get("/userPage", function(req, res){
  Post.find({}, function(err, posts){
    if(err){
      console.log(err);
    }else {
      res.render("posts/user", {posts: posts, currentUser: req.user});
    }
  });
});


// NEW show form to create new post
app.get("/posts/new", isLoggedIn, function(req, res){
  res.render("posts/new", {currentUser: req.user});
});


// CREATE add new post
app.post("/posts", isLoggedIn, function(req, res){

  //get data from form and add to campgrounds array
  var name = req.body.name;
  var image = req.body.image;
  var content = req.body.content;
  var author = {
    id: req.user._id,
    username: req.user.username
  }

  Post.create({name:name, image: image, content: content, author: author}, function(err, post){
    if(err){
      console.log(err);
    }else{
      res.redirect("/posts" );
    }
  });
  // redirect back to posts page

});

// SHOW - shows more info about the post
app.get("/posts/:id", function(req, res){
  // find post with provided id
  var id = req.params.id;
  Post.findById(id).populate("comments").exec(function(err, foundPost){
    if(err){
      console.log(err);
    }else{
      Post.find({}, function(err, posts){
        if(err){
          console.log(err);
        }else{
          res.render("posts/show", {post : foundPost, posts: posts, currentUser: req.user});
        }
      });

    }
  });

});

//==================================
// COMMENTS ROUTES
//==================================


app.get("/posts/:id/comments/new", isLoggedIn, function(req, res){
  Post.findById(req.params.id, function(err, post){
    if(err){
      console.log(err);
    }else {
      res.render("comments/new", {post: post, currentUser: req.user})
    }
  });
});

app.post("/posts/:id/comments", isLoggedIn, function(req, res){
  Post.findById(req.params.id, function(err, post){
    if(err){
      console.log(err);
      res.redirect("/posts", {currentUser: req.user});
    }else {
      Comment.create(req.body.comment, function(err, comment){
        if(err){
          console.log(err);
        }else {
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          comment.save();
          post.comments.push(comment);
          post.save();
          res.redirect("/posts/"+ post._id);
        }
      });
    }
  });
});

// AUTHORISATION Routes

app.get("/register", function(req, res){
  res.render("register", {currentUser: req.user});
});


app.post("/register", function(req, res){
  User.register(new User({username: req.body.username}),req.body.password, function(err, user){
    if(err){
      console.log(err);
      return res.render("register", {currentUser: req.user});
    }
    passport.authenticate("local")(req, res, function(){
      res.redirect("/posts");
    });
  });
});

app.get("/login", function(req, res){
  res.render("login", {currentUser: req.user});
});

app.post("/login",passport.authenticate("local",{
  successRedirect: "/posts",
  failureRedirect: "/login"
}), function(req, res){

});

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/posts");
});

// EDIT POST ROUTES
app.get("/posts/:id/edit", checkPostOwnership, function(req, res){
  Post.findById(req.params.id, function(err, foundPost){
    res.render("posts/edit", {post: foundPost, currentUser: req.user});
    });
});

app.put("/posts/:id", checkPostOwnership, function(req, res){
  Post.findByIdAndUpdate(req.params.id, req.body.post, function(err, updatedPost){
    if(err){
      res.redirect("/posts");
    }else{
      res.redirect("/posts/" + updatedPost._id)
    }
  });
});


// DESTROY POST ROUTE

app.delete("/posts/:id", checkPostOwnership, function(req, res){
  Post.findByIdAndRemove(req.params.id, function(err){
    if(err){
      res.redirect("/posts");
    }else{
      res.redirect("/posts");
    }
  });
});


// EDIT COMMENTS Routes

app.get("/posts/:id/comments/:comment_id/edit", checkCommentOwnership, function (req, res){
  Comment.findById(req.params.comment_id, function(err, foundComment){
    if(err){
      console.log(err);
      res.redirect("back");
    }else{
        res.render("comments/edit", {post_id: req.params.id, comment: foundComment, currentUser: req.user})
    }
  });
});

app.put("/posts/:id/comments/:comment_id", checkCommentOwnership, function(req, res){
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
    if(err){
      res.redirect("back");
    }else{

      res.redirect("/posts/"+req.params.id);
    }
  });
});

//COMMENT DESTROY ROUTE
app.delete("/posts/:id/comments/:comment_id", function(req, res){
  Comment.findByIdAndRemove(req.params.comment_id, function(err){
    if(err){
      console.log("not deleted");
      res.redirect("/posts/"+ req.params.id);
    }else{
      console.log(" deleted");
      res.redirect("/posts/"+ req.params.id);
    }
  });
});



function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }

  res.redirect("/login");
}

function checkPostOwnership(req, res, next){
  if(req.isAuthenticated()){
    Post.findById(req.params.id, function(err, foundPost){
      if(err){
        console.log(err);
        res.redirect("back");
      }else {
        if((foundPost.author.id).equals(req.user.id)){
           next();
        }else{
          res.redirect("back");
        }
      }
    });
  }else{
    res.redirect("back");
  }
}


function checkCommentOwnership(req, res, next){
  if(req.isAuthenticated()){
    Comment.findById(req.params.comment_id, function(err, foundComment){
      if(err){
        console.log(err);
        res.redirect("back");
      }else {
        if((foundComment.author.id).equals(req.user.id)){
           next();
        }else{
          res.redirect("back");
        }
      }
    });
  }else{
    res.redirect("back");
  }
}

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

// app.listen(3000, function(){
//   console.log("Blog server has started");
// });
