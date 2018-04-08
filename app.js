// APP VARIABLES
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


//SETTING CONNECTIONS
mongoose.connect("mongodb://user:user123@ds137019.mlab.com:37019/blogapp");

// APP SETTINGS
app.set('port', (process.env.PORT || 5000));
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

// SETING VARIABLES THAT CAN BE USES IN ALL ROUTES
app.use(function(req, res, next){
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  res.locals.currentUser = req.user;
  next();
});

// LANDING PAGE ROUTE
app.get("/", function(req, res, next){
  res.render("landing");
});

// INDEX SHOWS ALL POSTS
app.get("/posts", function(req, res){
  Post.find({}, function(err, posts){
    if(err){
      console.log(err);
    }else {
      res.render("posts/index" , {posts : posts});
    }
  });
});

// SHOWS ALL POSTS OF LOGGED IN USER
app.get("/userPage", function(req, res){
  Post.find({}, function(err, posts){
    if(err){
      console.log(err);
    }else {
      res.render("posts/user", {posts: posts});
    }
  });
});


// NEW - SHOWS A FORM TO CREATE A NEW POST
app.get("/posts/new", isLoggedIn, function(req, res){
  res.render("posts/new");
});


// CREATE- ADDS A NEW POST
app.post("/posts", isLoggedIn, function(req, res){
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
      req.flas("success", "Your post has been added!");
      res.redirect("/posts" );
    }
  });
});

// SHOW - SHOWS MORE INFOR ABOUT A POST
app.get("/posts/:id", function(req, res){
  var id = req.params.id;
  Post.findById(id).populate("comments").exec(function(err, foundPost){
    if(err){
      console.log(err);
    }else{
      Post.find({}, function(err, posts){
        if(err){
          console.log(err);
        }else{
          res.render("posts/show", {post : foundPost, posts: posts});
        }
      });
    }
  });
});

//==================================
// COMMENTS ROUTES
//==================================

// SHOWS A FORM TO CREATE A NEW COMMENT
app.get("/posts/:id/comments/new", isLoggedIn, function(req, res){
  Post.findById(req.params.id, function(err, post){
    if(err){
      console.log(err);
    }else {
      res.render("comments/new", {post: post})
    }
  });
});

// ADDS A NEW COMMENT
app.post("/posts/:id/comments", isLoggedIn, function(req, res){
  Post.findById(req.params.id, function(err, post){
    if(err){
      console.log(err);
      res.redirect("/posts");
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
          req.flash("success", "Your comment has been added!")
          res.redirect("/posts/"+ post._id);
        }
      });
    }
  });
});

// AUTHORISATION ROUTES

// SHOWS A FORM TO REGISTER A NEW USER
app.get("/register", function(req, res){
  res.render("register");
});

// REGISTERS A NEW USER
app.post("/register", function(req, res){
  User.register(new User({username: req.body.username}),req.body.password, function(err, user){
    if(err){
      req.flash("error", err.message);
      return res.redirect("register");
    }
    passport.authenticate("local")(req, res, function(){
      req.flash("success", "Congratulations "+ req.user.username +", you have successfully registered on Bloggeroo!");
      res.redirect("/posts");
    });
  });
});

// SHOWS A FORM TO LOGIN
app.get("/login", function(req, res){
  res.render("login");
});

// LOGS IN A USER
app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    req.flash("success", "Welcome back "+ req.user.username);
    res.redirect('/posts');
  });

// LOGS OUT A USER
app.get("/logout", function(req, res){
  var name = "";
  if(req.user){
    name = req.user.username;
  }
  req.logout();
  req.flash("success", "Goodbye "+ name);
  res.redirect("/posts");
});

// EDIT POST ROUTES

//GETS A FORM TO EDIT A POST
app.get("/posts/:id/edit", checkPostOwnership, function(req, res){
  Post.findById(req.params.id, function(err, foundPost){
    res.render("posts/edit", {post: foundPost});
    });
});

// EDITS THE POST
app.put("/posts/:id", checkPostOwnership, function(req, res){
  Post.findByIdAndUpdate(req.params.id, req.body.post, function(err, updatedPost){
    if(err){
      res.redirect("/posts");
    }else{
      req.flash("success", "Your post has been updated!")
      res.redirect("/posts/" + updatedPost._id)
    }
  });
});


// DESTROY POST ROUTE


// DELETS A POST
app.delete("/posts/:id", checkPostOwnership, function(req, res){
  Post.findByIdAndRemove(req.params.id, function(err){
    if(err){
      res.redirect("/posts");
    }else{
      req.flash("success" , "Your post has been deleted!")
      res.redirect("/posts");
    }
  });
});


// EDIT COMMENTS Routes

// SHOWS A FORM TO EDIT A COMMENT
app.get("/posts/:id/comments/:comment_id/edit", checkCommentOwnership, function (req, res){
  Comment.findById(req.params.comment_id, function(err, foundComment){
    if(err){
      console.log(err);
      res.redirect("back");
    }else{
        res.render("comments/edit", {post_id: req.params.id, comment: foundComment})
    }
  });
});


//EDITS THE COMMENT
app.put("/posts/:id/comments/:comment_id", checkCommentOwnership, function(req, res){
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
    if(err){
      res.redirect("back");
    }else{
      req.flash("success", "Your commend has been updated!")
      res.redirect("/posts/"+req.params.id);
    }
  });
});

//COMMENT DESTROY ROUTE

// DELETES A COMMENT
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


// DEFAULT ROUTE FOR ALL OTHER CASES
app.get("*", function(req, res){
  res.render("unspecified");
});


// MIDDLEWARE - CHECKS IF USER IS LOGGED IN
function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  req.flash("error", "Please Login First!");
  res.redirect("/login");
}

// MIDDLEWARE - CHECKS IF LOGGED IN USER OWNS THE POST
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

// MIDDLEWARE - CHECKS IF LOGGED IN USER OWNS THE COMMENT
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


// PORT SET UP
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
