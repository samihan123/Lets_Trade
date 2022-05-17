const { range } = require("express/lib/request");
const { DateTime } = require("luxon");
const { timeout } = require("nodemon/lib/config");
const {v4: uuidv4 } = require('uuid');


//mongose imports
const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const storySchema = new Schema({
    item_name : {type: String, required: [true, 'title is required']},
    item_category:{type: String, required: [true, 'title is required']},
    manufactured_year:{type: Number, required: [true, 'title is required']},
    origin_country:{type: String, required: [true, 'title is required']},
    item_to_trade:{type: String, required: [true, 'title is required']},
    details:{type: String, required: [true, 'title is required'], 
                            minLength: [10,'the content should have at least 10 characters']},
    trader:{type: Schema.Types.ObjectId, ref: 'User'},
    status: {type: String},
    image: {type: String},
    watchBy: [{type:mongoose.ObjectId}],
    offersRecived : {type:mongoose.ObjectId},
    offeredItem: {type:mongoose.ObjectId}
},
{timestamps: true}
);

//collection name is items in database
module.exports = mongoose.model('items', storySchema )

/*
exports.find = function(){
    let category_dict = {}
    for(let i=0;i<category.length;i++){
        temp = trade_items.filter(trade => trade.item_category == category[i]);
        if(temp.length!=0){
            category_dict[category[i]] = temp
        }

    }
   
    return category_dict
}

exports.filter = function (category){
    let category_dict = {}
    for(let i=0;i<category.length;i++){
        temp = trade_items.filter(trade => trade.item_category == category[i]);
        if(temp.length!=0){
            category_dict[category[i]] = temp
        }

    }
    console.log(category_dict) 
    return category_dict

}
exports.findById = function(id){
    
    return trade_items.find(items=>items.item_id === id)
};


exports.save = function(item)
{
    item.item_id = uuidv4();
    item.createdAt = DateTime.now().toLocaleString(DateTime.DATETIME_SHORT);

    item.image = '/images/No-image-found.jpg'
    item.trader = 'Samihan'

    if(!category.includes(item.item_category)){
        category.push(item.item_category)
    }
    trade_items.push(item);
    
}


exports.updateById = function(id, newItem){
    let item = trade_items.find(item=>item.item_id === id)
    if(item){
   
        item.item_name = newItem.item_name
        item.item_category = newItem.item_category
        item.manufactured_year =  newItem.manufactured_year
        item.origin_country = newItem.origin_country
        item.item_to_trade =  newItem.item_to_trade
        item.details =  newItem.details
        //item.trader = newItem.trader
        //item.status = newItem.status
        //item.image = "/images/Coins/coin4.jpeg"
        
        if(!category.includes(newItem.item_category)){
            category.push(newItem.item_category)
        }
        return true
    }
    else{
        return false
    }
    
}


exports.deleteById = function(id){

    let index = trade_items.findIndex(item=>item.item_id === id)
 
    if(index!=-1){
        trade_items.splice(index,1)
        return true
    }
    else{
        return false;
    }
   
}*/