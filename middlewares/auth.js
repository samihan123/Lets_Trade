const Trade = require('../models/trade')
//check if user is guest
exports.isGuest = (req,res,next) => {
    if(!req.session.user)
        return next();
    else{
        req.flash('error','you are login already')
        return res.redirect('/users/profile')
    }
};

//check if user is auth
exports.isLoggedIn =  (req,res,next) => {
    if(req.session.user)
        return next();
    else{
        req.flash('error','you need to login first')
        return res.redirect('/users/login')
    }
};


//check if user is auth of the story
exports.isAuthor = (req,res,next) => {
    let id = req.params.id;
    Trade.findById(id)
    .then(trade=>{
        if(trade){
            console.log("trade author >>>>>>>>>>>>>>>>>>>>")
            console.log(trade.trader)
            console.log("session user >>>>>>>>>>>>>>>")
            console.log(req.session.user)
            if(trade.trader == req.session.user){
                return next();
            }
            else{
                let err = new Error('Unathorised to access the resources')
                err.status = 401;
                return next(err)
            }

        }
        else{

            err = new Error('Cannot find a story with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=> {
        return next(err)
    })
};

exports.isNotAuthor = (req,res,next) => {
    let id = req.params.id;
    Trade.findById(id)
    .then(trade=>{
        
        if(trade){
            if(trade.trader != req.session.user){
                return next();
            }
            else{
                let err = new Error('You cant trade/watchlist your own item')
                err.status = 401;
                return next(err)
            }

        }
        else{

            err = new Error('Cannot find a story with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=> {
        return next(err)
    })
};