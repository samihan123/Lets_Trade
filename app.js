// require module
const express = require('express');
const morgan = require('morgan');
const tradeRoutes = require('./routes/tradeRoutes');
const mainRoutes = require('./routes/mainRoutes');
const userRoutes = require('./routes/userRoutes');

const methodOverride = require('method-override');
const mongoose = require('mongoose');

const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');




//create application
const app = express();

//configure application
let port = 3000
let host = 'localhost'
app.set('view engine','ejs')

//connecting to mongodb
mongoose.connect('mongodb://localhost:27017/lets_trade',{useNewUrlParser: true, useUnifiedTopology: true})
.then(()=> {
    //start the server
    app.listen(port, host, ()=>{
    console.log('Server is running on port', port);
    });
})
.catch(err=>console.log(err.message));


//mount middlware
app.use(
    session({
        secret: "ajfeirf90aeu9eroejfoefj",
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({mongoUrl: 'mongodb://localhost:27017/lets_trade'}),
        cookie: {maxAge: 60*60*1000}
        })
);
app.use(flash());

app.use((req, res, next) => {
    //console.log(req.session);
    res.locals.user = req.session.user||null
    res.locals.errorMessages = req.flash('error');
    res.locals.successMessages = req.flash('success');
    next();
});

//mount middleware
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));

//set up routes
app.get('/',(req,res)=>{
    res.render('index')
})
app.get('/index',(req,res)=>{
    res.render('index')
})

app.use('/main',mainRoutes)
app.use('/trade',tradeRoutes)
app.use('/users',userRoutes)

//error handling
app.use((req,res,next)=>{
    let err = new Error('The server cannot locate '+req.url);
    err.status = 404;
    next(err);
})
app.use((err,req,res,next)=>{
    console.log(err.stack)
    if(!err.status)
    {
        err.status = 500;
        err.message = ("internal server error");
    }
    if(err.status==400){
        req.flash('error', err.message);
        res.redirect('back')
    }
    if(err.status==401){
        req.flash('error', err.message);
        //res.redirect('/users/login')
        res.redirect('back')
    }
    res.status(err.status)
    res.render('error',{error:err});
});
