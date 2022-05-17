const {body} = require('express-validator')
const {validationResult} = require('express-validator')

//validate id
exports.validateId = (req,res,next) => {
    let id = req.params.id;
    //an objectId is a 24-bit Hex string
    if(!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid story id');
        err.status = 400;
        return next(err);
    }
    else{
        return next();
    }
}

exports.validateSignUp = [body('firstName','First Name cannot be empty').notEmpty().trim().escape(),
body('lastName','last name cannot be empty').notEmpty().trim().escape(),
body('email','Email must be valid email address').isEmail().trim().escape().normalizeEmail(),
body('password','Password must be atleast 8 char and at most 64 char').isLength({min: 8,max: 64})];

exports.validateLogIn = [body('email','Email must be valid email address').isEmail().trim().escape().normalizeEmail(),
body('password','Password must be atleast 8 char and at most 64 char').isLength({min: 8,max: 64})];


exports.validateResult = (req,res,next) => {
    let errors = validationResult(req)
    if(!errors.isEmpty()){
        errors.array().forEach(error=>{
            req.flash('error',error.msg);
        });
        return res.redirect('back');
    }
    else{
        return next();
    }
}


exports.validateTrade = [

body('item_category','Category cannot be empty').notEmpty().trim().escape(),
body('item_name','Item name cannot be empty').notEmpty().trim().escape(),
body('manufactured_year','manufactured year cannot be empty').notEmpty().trim().escape(),
body('origin_country','origin_country  cannot be empty').notEmpty().trim().escape(),
body('details','details must have minimum length of 10 characters').isLength({min: 10}).trim().escape(),
body('item_to_trade','item_to_trade year cannot be empty').notEmpty().trim().escape()
];
