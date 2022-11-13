const express = require('express');
const PORT = 2004;
const mongoose = require('mongoose');
const app= express();
const bodyParser=require("body-parser")
const db = 'mongodb+srv://shecodes:shecodes@cluster1.ztvafph.mongodb.net/node-block?retryWrites=true&w=majority';
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")
const session = require("express-session")
const findOrCreate = require('mongoose-findorcreate')
app.use(bodyParser.urlencoded({extended:true}))

app.use(express.static("public"))
app.set("view engine", "ejs")

mongoose.connect(db)
.then((res)=> console.log('Connected to DB'))
.catch((eror)=> console.log(eror));


const userSchema = mongoose.Schema({
    email:String,
    password: String,
    nickname:String,
    role: {
        type: String,
        default: 'User'
      }

})

userSchema.plugin(passportLocalMongoose)
userSchema.plugin(findOrCreate)
const User = mongoose.model("User", userSchema)

passport.use(User.createStrategy());


 passport.serializeUser(User.serializeUser());
 passport.deserializeUser(User.deserializeUser());

//express session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
  }))

  // passport
app.use(session({ secret: 'anything'}))  
app.use(passport.initialize())
app.use(passport.session())

app.get('/',((req, res)=>{
      res.render('index',{req:req})
     }))


app.get('/index',((req, res)=>{
    res.render('index',{req:req})
       }))


 app.get('/signIn',((req, res) => {
       res.render('signIn',{req:req})
    }))

 app.get("/signUp",((req, res) => {

        res.render("signUp",{req:req})
    
    }))
app.get('/account',((req, res) => {
     res.render('account',{req:req})
}))

app.get('/about',((req, res) => {
res.render('about',{req:req}
)
}))

app.get('/child',((req, res) => {
    res.render('child',{req:req})
}))

app.get('/parents',((req, res) => {
    res.render('parents',{req:req})
}))

app.route("/signIn")
  .get(function(req, res) {

    res.render("signIn")
  })
  .post(function(req, res) {

    const user = new User({
        username: req.body.username,
        password: req.body.password
    })
     req.login(user, function(err) {
      if (err) {
        console.log(err);
        res.redirect("/signIn")
      } else {
        passport.authenticate("local")(req, res, function() {
          res.redirect("/")
        })
      }
    })
  })
  //________________________________________

  app.route("/signUp")
.get(function(req, res){
      res.render("signUp")
  })

  
.post(function(req, res) {
  User.register({
    username: req.body.username,
   email: req.body.email
  }, req.body.password, function(err, user) {
    if (err) {
      console.log(err)
      res.redirect("/signUp")
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/")
      })
    }
  })
})


app.get('/header',((req, res) => {
    let user = req.body
    res.render('header',{req:req,user:user} )
}))

app.get('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });

app.get('/chat',((req, res) => {
    let user = req.body
    res.render('chat',{req:req,user:user} )
}));

const messageSchema = new mongoose.Schema({
    teg:String,
    messages:String,
    avtor:String
  
  })
  const Messages = mongoose.model('Com',messageSchema)//модель на основе схемы

  app.get('/chat', async function(req, res) {
    if(req.isAuthenticated()){
      let user= req.user.username
      let messages= await Messages.find({})
      res.render("chat", {user:user,req:req, messages: messages})
    }else{
      res.redirect("/")
    }
  })
app.post('/addmessage/:_id',(async(req,res)=>{
    let id=req.params._id
    let user=req.user.username
    const com = new Messages ({
      teg:id,
      messages:req.body.messages,
      avtor:user
    })
    com.save()
    res.redirect("chat")
  }))








app.listen (PORT,(error)=>{
    error ? console.log(eror):console.log('listening port  '+PORT);
});