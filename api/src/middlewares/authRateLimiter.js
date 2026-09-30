import rateLimit from 'express-rate-limit';

const authRateLimiter = rateLimit({
    windowMs : 15*60*1000,

    max: 10,

    message:{
        message:"Trop de tentatives. Veuillez réessayer plus tard."
    },

    standardHeaders: true,
    legacyHeaders: false
});

export default authRateLimiter;