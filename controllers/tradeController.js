const { promise } = require('bcrypt/promises');
const { query } = require('express')
const { db } = require('../models/trade')
const model = require('../models/trade')
const users = require('../models/user');

//render trade page form
exports.newTrade=(req,res) => {
    res.render('./trade-pages/newTrade')
}

//open trade page
exports.trade=(req,res) => {

    res.render('./trade-pages/trade')
}

//open trading page, display according to category
exports.trades=(req,res,next) => {


    var category_dict = {};
    model.distinct('item_category')
    .then((category)=>{
        model.find()
        .then((trade_items)=>{
            for(let i=0;i<category.length;i++){
                temp = trade_items.filter(trade => trade.item_category == category[i]);
                if(temp.length!=0){
                    category_dict[category[i]] = temp
                }
        
            }
            
            res.render('./trade-pages/trades',{category_dict})

        })
        .catch(err=>next(err))
    })
    .catch(err=>next(err));
   
}

exports.filter = (req,res,next) => {
    let category =req.body
    let category_dict = model.filter(category);
    res.render('./trade-pages/trades',{category_dict})
}

//POST /stories create a new item
exports.create = (req,res,next)=>{
    let item = new model(req.body);
    console.log(item.image==undefined)
    if(item.image==undefined || item.image.trim()==""){
        item.image = '/images/No-image-found.jpg'
    }  
    item.status = 'Available'
    item.trader = req.session.user;
    item.save()
    .then((item)=>{
        //res.redirect('/trade/trades');
        req.flash('success', 'You have successfully created new trade');
        res.redirect('/trade/'+item._id);
        //res.render("./trade-pages/trade",{item})
    })
    .catch(err=>{
        if(err.name === 'ValidationError')
        {
            err.status = 400
            
        }
        next(err);
    });
   };


exports.show = (req,res,next)=>{
    let id = req.params.id;
    //model.findById(id).populate('trader','firstName lastName')
    model.findById(id)
    .then(item =>{
        console.log(item.trader)
    })
    model.findById(id).populate('trader','firstName lastName')
    .then(item=>{
        if(item){
            
            res.render("./trade-pages/trade",{item})
            
        }
        else{
            let err = new Error('Cannot find a item with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>next(err))
};


//GET /trade/:id/edit: send html form for editting an existing story
exports.edit = (req,res,next,)=>{
    
    let id = req.params.id
    model.findById(id)
    .then(item=>{
        if(item){
            
            res.render('./trade-pages/editTrade',{item})
        }
        else{
            let err = new Error('Cannot find a item with id '+id)
            err.status = 404
            next(err)
        }
    })
    
}


//PUT /trade/:id update the item identified by id
exports.update = (req,res,next)=>{

    let item = req.body  
    let id = req.params.id
    if(item.image==undefined || item.image.trim()==""){
        item.image = '/images/No-image-found.jpg'
    }  

    model.findByIdAndUpdate(id,item, {useFindAndModify: false, runValidators: true})
    .then(item=>{
        if(item){
            req.flash('success', 'You have successfully made changes in trade');
            res.redirect('/trade/'+id);
        }
        else{
            let err = new Error('Cannot find a item with id '+id)
            err.status = 404
            next(err)
        }
    })
    .catch(err=>{
        if(err.name === 'ValidationError'){
            err.status = 400;
        }    
        next(err)
    })
}


//delete /trade/:id , delete the item identified by id
exports.delete = (req,res,next,)=>{
    let id = req.params.id 
    model.findById(id)
    .then(item =>{
        Promise.all([model.findByIdAndUpdate(item.offeredItem,{"status":'Available'}) ,
                    users.findByIdAndUpdate(item.offersRecived,{"$pull":{"offerGiven":id}})]) 
        .then(results =>{
            if(results){
                watchUserList = item.watchBy
                for(let i=0;i<watchUserList.length;i++){
                    Promise.all([users.findByIdAndUpdate(watchUserList[i],{"$pull":{"watch":id}})])
                    
                }
                model.findByIdAndDelete(id,{useFindAndModify: false})
                .then(item=>{
                    if(item){
                        req.flash('success', 'You have successfully deleted trade');
                        res.redirect('/trade/trades')
                    }
                    else{
                        let err = new Error('Cannot find a item with id '+id)
                        err.status = 404
                        next(err)
                    }
                })
                .catch(err=>next(err));
                
            }
            else{
                let err = new Error('Cannot find a user with id '+id)
                err.status = 404
                next(err)   
            }
        })
    })
    .catch(err=>next(err))



   
 }
 
 //go to give offering page
exports.giveoffer = (req,res,next) => {
    let id =req.params.id;
    let user = req.session.user;
    
    model.findById(id)
    .then(item => {
        if(item.status!='Available'){
            req.flash('error', 'Item is lock, not availble for trade as of now,');
            return res.redirect('back')
        }

        Promise.all([users.findById(user), model.find({trader: user}) ] )
        .then(results=>{
            const [user, trades] = results
            
            res.render('./user/giveOffer', {user:user,trades:trades,totradeId:id})
        })
        .catch(err=>next(err));
    })


}

 //trading
 exports.tradeoffer = (req,res,next) => {
    //id of item of user that he will use to trade 
    let id =req.params.id
    //user id
    let user = req.session.user;
    let item = req.body;
    
    //id of item to be trade 
    ToTradeId = item.totradeId
    model.findById(id)
    .then( item =>{
        if(item.status!='Available'){
            req.flash('error', 'Item is lock, not availble for trade as of now');
            res.redirect('/trade/trades')
        }
        else {

       
    Promise.all([users.findByIdAndUpdate(user,{"$push":{"offerGiven":ToTradeId}})
                , model.findByIdAndUpdate(ToTradeId,{"offersRecived":user,"offeredItem":id,"status":'Lock-For-Offer'  })
                , model.findByIdAndUpdate(id, {"status":'Lock-By-Owner'})])
    .then((results) => {
        if(results){
            req.flash('success', 'You have successfully given the offer for the trade');
            res.redirect('/users/profile')
        }
        else{
            let err = new Error('Cannot find a user with id '+id)
            err.status = 404
            next(err)
        }

    })
    .catch(err=>next(err))
    }
    })
    .catch(err=>(next(err)))
 }

exports.managetrade = (req,res,next) =>{
    let id =req.params.id
    model.findById(id)
    .then(item => {
        model.findById(item.offeredItem) 
        .then(item2 => {
            res.render('./user/manageTrade.ejs',{item,item2})    
        })
        
    })
}

exports.accepttrade = (req,res,next) =>{
    let id =req.params.id
    model.findById(id)
    .then(item => {
        if(item){
           offerRecFromId =  item.offersRecived
           users.findByIdAndUpdate(offerRecFromId,{"$pull":{"offerGiven":id}})
           .then(results =>{
                if(results){
                    Promise.all([model.findByIdAndDelete(id,{useFindAndModify: false})
                                ,model.findByIdAndDelete(item.offeredItem,{useFindAndModify: false})])
                    .then(results2 => {
                        if(results2){
                            req.flash('success', 'You have successfully accepted the offer for the trade');
                            res.redirect('/users/profile')
                        }
                        else{
                            let err = new Error('Cannot find a user with id '+id)
                            err.status = 404
                            next(err)
                        }
                    })
                    .catch(err=>next(err))
                }
                else{
                    let err = new Error('Cannot find a user with id '+id)
                    err.status = 404
                    next(err)
                }
           })
           .catch(err=>next(err))

        }
        else{
            let err = new Error('Cannot find a user with id '+id)
            err.status = 404
            next(err)
        }
    })
    .catch(err=>next(err))
}

exports.rejecttrade = (req,res,next) => {
    let id =req.params.id
    model.findById(id)
    .then(item => { 
        if(item){
            offerRecFromId =  item.offersRecived
            offeredItemId = item.offeredItem
            users.findByIdAndUpdate(offerRecFromId,{"$pull":{"offerGiven":id}})
            .then(results =>{ 
                    
                    Promise.all([model.findByIdAndUpdate(offeredItemId,{"status":'Available'}),
                                model.findByIdAndUpdate(id,{"offersRecived":undefined,"status":'Available'})])
                    .then(results2 => {
                        if(results2)
                        {
                            
                            req.flash('success', 'You have successfully cancel the offer for the trade');
                            res.redirect('/users/profile');
                        }
                        else{
                            let err = new Error('Cannot find a user with id '+id)
                            err.status = 404
                            next(err)

                        }
                        
                    })
                    .catch(err=>next(err))
            })
            .catch(err=>next(err));
        }
        else{
            let err = new Error('Cannot find a user with id '+id)
            err.status = 404
            next(err)
        }
    })
    .catch(err=>next(err))
}

 exports.cancelOffer = (req,res,next) => {
       //id of item to be trade 
       let id =req.params.id
       //user id
       let user = req.session.user;



       Promise.all([users.findByIdAndUpdate(user,{"$pull":{"offerGiven":id}})
       , model.findByIdAndUpdate(id,{"offersRecived":undefined,"offeredItem":undefined,"status":'Available'})])
       .then((results) => {
        if(results){
            //"offeredItem":undefined
            const [users,item] = results
            console.log(item.offeredItem)
            ItemOffered = item.offeredItem
            model.findByIdAndUpdate(ItemOffered,{"status":'Available'})
            .then(results =>{
                req.flash('success', 'You have successfully cancel the offer for the trade');
                res.redirect('/users/profile')
            })
       
        }
        else{
            let err = new Error('Cannot find a user with id '+id)
            err.status = 404
            next(err)
        }
       })
       .catch(err=>next(err))
 }


 