import jwt from 'jsonwebtoken'
import cookieParser from "cookie-parser";

export default (req,res,next)=>{
    const token = (req.cookies.jwt || '');
    if (token){
        try {
            req.userId = returnID(token);
        }catch (e){
            return res.status(403).json({
                message: 'Нет доступа',
            });
        }
        next();
    }else{
        return res.status(403).json({
        message: 'Нет доступа',
        });
    }
}

export const returnID = (token)=>{
    const cleartoken = (token || '').replace(/Bearer\s?/,'')
    const decoded = jwt.verify(cleartoken, 'aboba');
    return decoded._id;
}