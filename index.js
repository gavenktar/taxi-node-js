import express from 'express'
import checkAuth, {returnID} from "./utility/checkAuth.js";
import mongoose from 'mongoose'
import {register,deleteUser,moderateUsers, login, me,registerdriver, personalprofile, patchUser} from "./Functions/UserFunc.js";
import {
    updateRoutes,
    createRoute,
    getRoutes,
    getRoutesId,
    deleteRoute,
    takeRoute,
    newroute,
    driverList,
    adminRoute,
    confirmRoute,
    pageConfirmRoute,
    archivePage,
    giveStats,
    updateArchiveRoutes,
    changeCF, createCF
} from "./Functions/routes.js";
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
app.delete('/user/:id',checkAuth,deleteUser);
app.patch ('/route/:routeid',checkAuth,takeRoute);
app.get('/newroute', newroute);
app.get ('/admin/routes',checkAuth,adminRoute);
app.patch('/user',checkAuth,patchUser);
app.post('/confirmroute/:id',confirmRoute);
app.get ('/profile/rate',checkAuth,pageConfirmRoute);
app.get ('/profile/archive',checkAuth,archivePage);
app.get ('/about',(req, res)=>{res.render('pages/about')})
app.get ('/contacts',(req, res)=>{res.render('pages/contacts')})
app.get('/terms', (req,res) => {res.render('pages/terms')})
app.get('/privacy', (req,res) => {res.render('pages/privacy')})
app.get('/profile/stats',checkAuth,giveStats);
app.get ('/profile/change',checkAuth, changeCF);
app.post('/profile/changecf',checkAuth,createCF);
app.post ('/updateRoutes',checkAuth,updateRoutes);
app.post('/updateArchiveRoutes',checkAuth,updateArchiveRoutes);
app.get('/profile/moderate',checkAuth,moderateUsers);
const dbadress = "mongodb://127.0.0.1:27017/taxi";
mongoose.connect(dbadress)
    .then(()=>{console.log("БД не упала")})
    .catch((err)=>{console.log("Дб упала((",err)})
