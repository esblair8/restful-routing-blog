var express         = require("express"),
    mongoose        = require("mongoose"),
    bodyParser      = require("body-parser"),
    methodOverride  = require("method-override"),
    expressSanitizer = require("express-sanitizer"),
    app               = express();

// APP CONFIG
mongoose.connect("mongodb://localhost/restful_blog_app", {useMongoClient: true}); 
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

// MONGOOSE/MODEL CONFIG
var blogScema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

 var Blog = mongoose.model("Blog", blogScema);

// Blog.create({
//   title: "testBlog",
//   image: "https://d2lm6fxwu08ot6.cloudfront.net/img-thumbs/280h/8DPIVJPGMQ.jpg",
//   body: "hello from my bmx bike!"
// });

// RESTFUL ROUTES


//GET -  LANDING PAGE GET REDIRECT TO ALL BLOGS
app.get("/", function(req, res){
    res.redirect("/blogs");
});

//GET - ALL BLOGS / INDEX PAGE
app.get("/blogs", function(req, res){
    Blog.find({}, function(err, blogs){
        if(err){
            console.log(err);
        } else{
            res.render("index", {blogs:blogs});
        }
    });
});

//GET - NEW BLOG PAGE
app.get("/blogs/new", function(req, res){
    res.render("new");
});

//CREATE - POST - NEW BLOG TO DB
app.post("/blogs", function(req, res){
    //sanatise body to remove script tags
    req.body.blog.body = req.sanitize(req.body.blog.body);

    //CREATE BLOG
    Blog.create(req.body.blog, function(err, newBlog){
        if(err){
            res.render("new");
        } 
        else{
            //THEN REDIRECT TO INDEX
            res.redirect("/blogs");
        }
    });
});

//SHOW ROUTE - SHOW MORE INFO FOR ANY BLOG POST
app.get("/blogs/:id", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        } 
        else{
            res.render("show", {blog: foundBlog});
        }
    });
});

//EDIT ROUTE - GET EDIT PAGE
app.get("/blogs/:id/edit", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.render("edit", {blog: foundBlog});
        }
    });
});

//UPDATE ROUTE - MAKE CHANGES TO BLOG POST
app.put("/blogs/:id/", function(req, res){
    //sanatise body to remove script tags
    req.body.blog.body = req.sanitize(req.body.blog.body);

    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

//DELETE ROUTE - MAKE CHANGES TO BLOG POST
app.delete("/blogs/:id", function(req, res){
    //DESTROY BLOG
    Blog.findByIdAndRemove(req.params.id, req.body.blog, function(err){
        if(err){
            res.redirect("/blogs");
        }
        else{
            //REDIRECT TO HOMEPAGE
            res.redirect("/blogs");
        }
    });
});


var port = process.env.PORT || "3000"
// listen on cloud9 defined port and IP
app.listen(port, process.env.IP, function(){
    console.log("Blog app server up on port " + port);
});