import rateLimit from 'express-rate-limit';

const registerRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,

    max: 3,

    message: {
        message: "Trop de créations de comptes. Veuillez réessayer plus tard."
    },

    standardHeaders: true,
    legacyHeaders: false
});

export default registerRateLimiter;