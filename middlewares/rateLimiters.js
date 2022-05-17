const rateLimit =   require("express-rate-limit");

exports.logInLimiter = rateLimit({
    windowMS: 60*1000, //1 minute time windows
    max: 5,
    //message: 'too many log in requests. Try again later',
    handler: (req,res, next) => {
        let err = new Error('too many log in requests. Try again later');
        err.status = 429;
        return next(err);
    }
});