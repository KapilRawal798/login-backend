var express = require('express');
var router = express.Router();
const userModel = require("./users"); 
const passport = require("passport");
const postModel = require("./post");
const upload = require("./multer");

const localStrategy = require("passport-local")
passport.use(new localStrategy(userModel.authenticate()));



/* GET home page. */
router.get('/',function(req,res){
  res.send("hlo");
});

router.get("/login",function(req,res){
  res.render("login",{error: req.flash('error')});
});
router.get("/register",function(req,res){
  res.render("register");
});
router.get("/profile", isLoggedIn ,async function(req,res){
  const user =
   await userModel
   .findOne({username: req.session.passport.user})
   .populate("posts")// view data in database
  res.render("profile",{user});
});

router.get("/show/post", isLoggedIn ,async function(req,res){
  const user =
   await userModel
     .findOne({username: req.session.passport.user})
     .populate("posts")
      console.log("user");
  res.render("show", {user});
});

router.get("/feed", isLoggedIn ,async function(req,res,next){
  const user = await userModel.findOne({username: req.session.passport.user})
  const posts = await postModel.find()
     .populate("user")
    
  res.render("feed", {user,posts, nav: true});
});

router.get("/add", isLoggedIn ,async function(req,res){
  const user = await userModel.findOne({username: req.session.passport.user})
  res.render("add",{user});
});

router.post("/fileupload", isLoggedIn, upload.single("image"), async function(req,res,next){
const user = await userModel.findOne({username: req.session.passport.user});
  user.profileImage = req.file.filename;
  await user.save();
  res.redirect("profile");
});
router.post("/createpost", isLoggedIn, upload.single("postimage"), async function(req,res,next){
  const user = await userModel.findOne({username: req.session.passport.user});
   const post = await postModel.create({
    user: user._id,
    title: req.body.title,
    description: req.body.description,
    image: req.file.filename
   });

   user.posts.push(post._id);
   await user.save();
   res.redirect("/profile");
  })
router.post("/register",function(req,res,next){
  const data = new userModel({
     username:req.body.username,
     contact:req.body.contact,
     email:req.body.email,
     name: req.body.fullname,
  })
  userModel.register(data, req.body.password)
    .then(function(){
      passport.authenticate("local")(req,res,function(){
        res.redirect("/profile");
      })
    })
});

router.post("/login", passport.authenticate("local",{
  successRedirect: "/profile",
  failureRedirect: "/login",
  failureFlash:true,
}),function(req ,res,next){ 
});

router.get("/logout",function(req,res,next){
  req.logout(function(err){
    if(err) {return next(err);}
    res.redirect('/');
  });
})

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/");
}

module.exports = router;
