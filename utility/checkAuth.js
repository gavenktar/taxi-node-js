import jwt from 'jsonwebtoken'

export default (req,res,next)=>{
    const token = (req.headers.authorization || '').replace(/Bearer\s?/,'')
    if (token){
        try {
            const decoded = jwt.verify(token,'aboba');
            req.userId = decoded._id;
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