import express from 'express'
import checkAuth, {returnID} from "./utility/checkAuth.js";
import mongoose from 'mongoose'
import {register, login, me,registerdriver, personalprofile, patchUser} from "./Functions/UserFunc.js";
import {createRoute, getRoutes, getRoutesId, deleteRoute, takeRoute,newroute, driverList, adminRoute} from "./Functions/routes.js";
import path from 'path'
import { fileURLToPath } from 'url';
import UserSchema from "./models/user.js";
import cookieParser from 'cookie-parser';
import {profileroutes} from "./Functions/UserFunc.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cookieParser())
app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname,'public')));

app.get('/',async (req,res)=>{
    let data = {};
    try {
        let id = returnID(req.headers.authorization);
        const User = await UserSchema.findById(id);
        let result = User.toJSON();
        data ={
        number : result.number
        }
        res.render('pages/index',data)
    }catch(err){
        data = {
            number : "Иван"
        }
        res.render('pages/index',data);
    }

})


const port =process.env.PORT || 4444;
app.listen(port,(err)=>{
    if (err){
        return console.log(err);
    }
    else{
        console.log('localhost:'+port);
    }
});
app.post ('/regdriver',registerdriver);
app.post ('/login', login);
app.get('/profile/me',checkAuth, personalprofile);
app.get('/auth/me',checkAuth,me);
app.post('/registration',register);
app.post('/route',checkAuth,createRoute);
app.get('/driver/routes',checkAuth,driverList)
app.get ('/route/:id',getRoutesId);
app.get('/profile/routes',checkAuth, getRoutes);
app.delete('/route/:id',checkAuth,deleteRoute);
app.patch ('/route/:routeid',checkAuth,takeRoute);
app.get('/newroute', newroute);
app.get ('/admin/routes',checkAuth,adminRoute);
app.patch('/user',checkAuth,patchUser);
const dbadress = "mongodb://127.0.0.1:27017/taxi";
mongoose.connect(dbadress)
    .then(()=>{console.log("БД не упала")})
    .catch((err)=>{console.log("Дб упала((",err)})
