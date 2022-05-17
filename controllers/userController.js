const model = require('../models/user');
const trade = require('../models/trade');
exports.new = (req, res)=>{
    return res.render('./user/new');
    
};

exports.create = (req, res, next)=>{

    //res.send('Created a new trade');
    let user = new model(req.body);//create a new trade document
    user.save()//insert the document to the database
    .then(user=>{
        req.flash('success','You have successfully created the user')
        res.redirect('/users/login')
    } )
    .catch(err=>{
        if(err.name === 'ValidationError' ) {
            req.flash('error', err.message);  
            return res.redirect('/users/new');
        }

        if(err.code === 11000) {
            req.flash('error', 'Email has been used');  
            return res.redirect('/users/new');
        }
        
        next(err);
    });
     
};

exports.getUserLogin = (req, res, next) => {
       return res.render('./user/login');
}

exports.login = (req, res, next)=>{
        let email = req.body.email;
    let password = req.body.password;
    model.findOne({ email: email })
    .then(user => {
        if (!user) {
            console.log('wrong email address');
            req.flash('error', 'wrong email address');  
            res.redirect('/users/login');
            } else {
            user.comparePassword(password)
            .then(result=>{
                if(result) {
                    req.session.user = user._id;
                    req.flash('success', 'You have successfully logged in');
                    res.redirect('/users/profile');
            } else {
                req.flash('error', 'wrong password');      
                res.redirect('/users/login');
            }
            });     
        }     
    })
    .catch(err => next(err));
};

exports.profile = (req, res, next)=>{
    let id = req.session.user;
    Promise.all([model.findById(id), trade.find({trader: id}) ] )
    .then(results=>{
        const [user, trades] = results
        //res.render('./user/profile', {user,trades})
        watchList = []
        user.watch.forEach(itemsId => {
            watchList.push(trade.findById(itemsId))
        });
        Promise.all(watchList)
        .then(watchItems =>{
            offerList = []
            console.log(">>>>>>>>>>>offer given   ")
            console.log(user.offerGiven)
            user.offerGiven.forEach(itemsId => {
                if(itemsId!=null){
                    offerList.push(trade.findById(itemsId))
                }
                
            });
            Promise.all(offerList)
            .then(offerList =>{
                console.log(">>>>>>>>>>>offer given   ")
                console.log(offerList)
                res.render('./user/profile', {user,trades,watchItems,offerList})
            })
            .catch(err=>next(err))
            
        })
    })
    .catch(err=>next(err));
};

exports.addToWatch = (req,res,next) => {
    let id = req.params.id;
    let user = req.session.user;
    
    model.findByIdAndUpdate(user,{"$addToSet":{"watch":id}})
    .then(result =>{
        if(result){
            trade.findByIdAndUpdate(id,{"$addToSet":{"watchBy":user}})
            .then(result2 => {
                if(result2){

                    req.flash('success', 'Successfully added item in watch list.');
                    res.redirect('/users/profile');
                }
                else{
                    let err = new Error('Cannot find a item with id '+id)
                    err.status = 404
                    next(err)
                }

            })
            .catch(err=>(next(err)))

            
        }
        else{
            let err = new Error('Cannot find a item with id '+id)
            err.status = 404
            next(err)
        }
    })
    .catch(err=>next(err));
}

exports.removeFromWatch = (req,res,next) => {
    let id = req.params.id;
    let user = req.session.user;
    model.findByIdAndUpdate(user,{"$pull":{"watch":id}})
    .then(result =>{
        if(result)
        {

            trade.findByIdAndUpdate(id,{"$pull":{"watchBy":user}})
            .then(result2 => {
                if(result2){

                    req.flash('success', 'Successfully renoved item from watch list.');
                    res.redirect('/users/profile');
                }
                else{
                    let err = new Error('Cannot find a item with id '+id)
                    err.status = 404
                    next(err)
                }

            })
            .catch(err=>(next(err)))

        }
        else{
            let err = new Error('Cannot find a user with id '+user)
            err.status = 404
            next(err)
        }
    })
    .catch(err=>next(err))
}
exports.logout = (req, res, next)=>{
    req.session.destroy(err=>{
        if(err) 
           return next(err);
       else{
            
            res.redirect('/'); 
       }
             
    });
   
 };



