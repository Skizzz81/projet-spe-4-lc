import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) =>{
    const token = req.cookies.accessToken;

    if(!token){
        return res.status(401).json({
            message: "Authentification requise"
        });
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        next();

    }catch {
        return res.status(401).json({
            message: "Token invalide ou expiré"
        });
    }
};

export default authMiddleware;
