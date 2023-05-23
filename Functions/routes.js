import route from '../models/route.js'
import RouteSchema from "../models/route.js";
import UserModel from "../models/user.js";
import jwt from "jsonwebtoken";
import UserSchema from "../models/user.js";
import UnratedSchema from "../models/unrated.js";
import ArchiveSchema from "../models/archive.js";
import Route from "../models/route.js";
import schedule from 'node-schedule'
import unrated from "../models/unrated.js";
import archive from "../models/archive.js";
import CfSchema from "../models/cf.js"
import mongoose from 'mongoose';

export const updateArchiveRoutes = async (req,res)=>{
    const { from, to, time } = req.body;
    const conditions = {};
    const User = await UserSchema.findById(req.userId);
    if (User.role === "passenger"){
        conditions.passengerID = new mongoose.Types.ObjectId(req.userId);
    }else{
        if (User.role === "driver") conditions.driverID = undefined;
    }
    if (from) {
        conditions.from = { $regex: from, $options: 'i' };
    }
    if (to) {
        conditions.to = { $regex: to, $options: 'i' };
    }
    if (time){
        conditions.time = {$gte : time};
    }
    const roads = await ArchiveSchema.find(conditions).populate('passengerID').populate('driverID');
    let data = [];
    let i =0;
    for (let elem of roads){
        if (elem.driverID !== null && elem.driverID !== undefined) {
            data[i] = {
                from: elem.from,
                to: elem.to,
                time: elem.time,
                distance: elem.distance,
                price: elem.price,
                passengerID: {
                    name: elem.passengerID.name,
                    surname: elem.passengerID.surname
                },
                driverID: {
                    name: elem.driverID.name || "Не",
                    surname: elem.driverID.surname || "задан",
                    carModel : elem.driverID.carModel || "-",
                    carNumber : elem.driverID.carNumber || ""
                },
                id: elem._id,
                status : elem.status
            }
        }else{
            data[i] = {
                from: elem.from,
                to: elem.to,
                time: elem.time,
                distance: elem.distance,
                price: elem.price,
                passengerID: {
                    name: elem.passengerID.name,
                    surname: elem.passengerID.surname

                },
                driverID: {
                    name: "Не",
                    surname: "Задан",
                    carModel : "-",
                    carNumber : ""
                },
                id: elem._id,
                status : elem.status
            }
        }

        i+=1
    }
    res.json(data);
}



export const updateRoutes = async (req,res)=>{
    const { from, to, time } = req.body;
    const conditions = {};
    const User = await UserSchema.findById(req.userId);
    if (User.role === "passenger"){
        conditions.passengerID = new mongoose.Types.ObjectId(req.userId);
    }else{
        if (User.role === "driver") conditions.driverID = undefined;
    }
    if (from) {
        conditions.from = { $regex: from, $options: 'i' };
    }
    if (to) {
        conditions.to = { $regex: to, $options: 'i' };
    }
    if (time){
        conditions.time = {$gte : time};
    }
    const roads = await RouteSchema.find(conditions).populate('passengerID').populate('driverID');
    let data = [];
    let i =0;
    for (let elem of roads){
        if (elem.driverID !== null && elem.driverID !== undefined) {
            data[i] = {
                from: elem.from,
                to: elem.to,
                time: elem.time,
                distance: elem.distance,
                price: elem.price,
                passengerID: {
                    name: elem.passengerID.name,
                    surname: elem.passengerID.surname
                },
                driverID: {
                    name: elem.driverID.name || "Не",
                    surname: elem.driverID.surname || "задан",
                    carModel : elem.driverID.carModel || "-",
                    carNumber : elem.driverID.carNumber || ""
                },
                id: elem._id
            }
        }else{
            data[i] = {
                from: elem.from,
                to: elem.to,
                time: elem.time,
                distance: elem.distance,
                price: elem.price,
                passengerID: {
                    name: elem.passengerID.name,
                    surname: elem.passengerID.surname

                },
                driverID: {
                    name: "Не",
                    surname: "Задан",
                    carModel : "-",
                    carNumber : ""
                },
                id: elem._id
            }
        }

        i+=1
    }
       res.json(data);
}
export const changeCF = async (req,res)=>{
    const user = await UserSchema.findById(req.userId);
    if (user.role !== "admin"){
        res.render('index.ejs')
        return
    }
    let coeff = await CfSchema.findOne();
    let cf =[]
     cf = await CfSchema.find();
    if (coeff === null){
        coeff = {
            timeCF:0.3,
            cmCF : 0.1
        }
        cf = []
    }
    res.render('pages/change.ejs',{role: user.role, timeCF : coeff.timeCF, cmCF : coeff.cmCF, cfArray:cf});
}
export const moveRoutes = async (req,res)=>{
    let date = new Date();
    const routes = await RouteSchema.find().populate('passengerID').populate('driverID').exec();
    for (let elem of routes){
        if (elem["time"] < date){
            if (elem["driverID"]!==undefined && elem["driverID"]!==null){
                const doc = new UnratedSchema({
                    from : elem.from,
                    to : elem.to,
                    passengerID : elem.passengerID,
                    driverID: undefined,
                    time : elem.time,
                    distance : elem.distance,
                    price : elem.price,
                })
                await RouteSchema.findByIdAndDelete({_id:elem.id});
                await doc.save();
            }else{
                const docx = new ArchiveSchema({
                    from : elem.from,
                    to : elem.to,
                    passengerID : elem.passengerID,
                    driverID: undefined,
                    time : elem.time,
                    distance : elem.distance,
                    price : elem.price,
                    status: "Не выполнена",
                    flag : false
                })
                await RouteSchema.findByIdAndDelete({_id:elem.id});
                await docx.save();
            }
        }
    }
}
export const createRoute = async (req, res) =>{
    try{
        const doc = new route({
            from : req.body.from,
            to : req.body.to,
            passengerID : req.userId,
            driverID: undefined,
            time : req.body.time,
            distance : req.body.distance,
            price : req.body.price,
            comment: (req.body.comment || '')
        })
        const newRoute = await doc.save()
        res.json(newRoute);
        res.status(200);
    }catch (e){
        console.log(e)
        res.status(500).json({message: "Не удалось создать поездку((",});
    }
}

export const driverList = async (req,res)=>{
    try{
        const routes = await RouteSchema.find({driverID : undefined}).populate('passengerID').populate('driverID').exec();
        let data = [];
        let i =0;
        for (let elem of routes){
            if (elem.driverID !== undefined) {
                if (elem.driverID === req.userId) continue;
                data[i] = {
                    from: elem.from,
                    to: elem.to,
                    time: elem.time,
                    distance: elem.distance,
                    price: elem.price,
                    passengerID: {
                        name: elem.passengerID.name,
                        surname: elem.passengerID.surname
                    },
                    driverID: {
                        name: elem.driverID.name || "Не",
                        surname: elem.driverID.surname || "задан",
                        carModel : elem.driverID.carModel || "-",
                        carNumber : elem.driverID.carNumber || ""
                    },
                    id: elem._id
                }
            }else{
                data[i] = {
                    from: elem.from,
                    to: elem.to,
                    time: elem.time,
                    distance: elem.distance,
                    price: elem.price,
                    passengerID: {
                        name: elem.passengerID.name,
                        surname: elem.passengerID.surname
                    },
                    driverID: {
                        name: "Не",
                        surname: "Задан",
                        carModel :  "-",
                        carNumber :  ""
                    },
                    id: elem._id
                }
            }

            i+=1
        }
        for (let i=0; i<routes.length;i++){
            if (routes[i].driverID === undefined && routes[i].driverID === null){
                routes[i].driverID = {
                    name : "Не",
                    surname : "Задан"
                }
            }
        }
        const user = await UserSchema.findById(req.userId);
        res.render('pages/driverroutes',{trips: data,role: user.role});
    }catch (e){
        console.log(e)
        res.status(500).json({message: "Не удалось получить поездки((",});
    }
}

export const newroute = async (req,res)=>{
        res.render('pages/newroute');
}
export const getRoutes = async (req, res)=>{
    try{
        const user = await UserSchema.findById(req.userId);
        let routes
        if (user.role !== "admin") {
            routes = await RouteSchema.find({
                $or : [
                    {passengerID : req.userId
                    },
                    {driverID : req.userId}
                ]
            }).populate('driverID').populate('passengerID').exec();

        }else{
            routes = await ArchiveSchema.find().populate('driverID').populate('passengerID').exec();
        }
        let data = [];
        let i =0;
        for (let elem of routes){
            if (elem.driverID !== undefined && elem.driverID !== null) {
                data[i] = {
                    from: elem.from,
                    to: elem.to,
                    time: elem.time,
                    distance: elem.distance,
                    price: elem.price,
                    passengerID: {
                        name: elem.passengerID.name,
                        surname: elem.passengerID.surname
                    },
                    driverID: {
                        name: elem.driverID.name || "Не",
                        surname: elem.driverID.surname || "задан",
                        carModel : elem.driverID.carModel || "-",
                        carNumber : elem.driverID.carNumber || ""
                    },
                    id: elem._id
                }
            }else{
                data[i] = {
                    from: elem.from,
                    to: elem.to,
                    time: elem.time,
                    distance: elem.distance,
                    price: elem.price,
                    passengerID: {
                        name: elem.passengerID.name,
                        surname: elem.passengerID.surname

                    },
                    driverID: {
                        name: "Не",
                        surname: "Задан",
                        carModel : "-",
                        carNumber : ""
                    },
                    id: elem._id
                }
            }

            i+=1
        }
        for (let i=0; i<routes.length;i++){
            if (routes[i].driverID === undefined){
                routes[i].driverID = {
                    name : "Не",
                    surname : "Задан"
                }
            }
        }
        res.render('pages/routes',{trips: data,role: user.role});
    }catch (e){
        console.log(e)
        res.status(500).json({message: "Не удалось получить поездки((",});
    }
}

export const getRoutesId= async (req, res)=>
{
    let id = req.params.id;
    try{
        const routes = await RouteSchema.findById(id).populate('passengerID').populate('driverID');
        res.json(routes);
    }catch (e){
        console.log(e)
        res.status(500).json({message: "Не удалось получить поездки((",});
    }
}

export const deleteRoute= async (req, res)=>
{
    let id = req.params.id;
    try{
        let passid = await RouteSchema.findById(id).populate('passengerID');
        let end = passid.passengerID._id.toJSON();
        if (req.userId !== end  && await UserSchema.findById(req.userId).role!=="admin") throw new Error();
        await RouteSchema.findByIdAndDelete({
            _id:id,
        });
        res.status(200);
    }catch (e){
        console.log(e)
        res.status(500).json({message: "Не удалось удалить поездки((",});
    }
}

export const takeRoute  = async (req,res)=>{
    try {
        const User = await UserModel.findById(req.userId);
        if (User.role !== 'driver') {
            throw new Error("К сожалению вы не водитель(");
        }
        let id = req.userId;
        let routeid = req.params.routeid;
        let Route = await RouteSchema.findById(routeid);
        if (Route.driverID === undefined) {
            const result = await RouteSchema.updateOne({
                    _id: routeid
                },
                {
                    $set: {driverID: id}
                },
                {returnDocument: "after"}
        )
            console.log("deb");
        }
        res.status(200);
    }
    catch (e){
        res.status(500);
        console.log(e);
    }
}

export const adminRoute = async (req, res)=>{
    try{
        const routes = await RouteSchema.find().populate('passengerID').populate('driverID').exec();
        let data = [];
        let i =0;
        for (let elem of routes){
            if (elem.driverID !== undefined) {
                data[i] = {
                    from: elem.from,
                    to: elem.to,
                    time: elem.time,
                    distance: elem.distance,
                    price: elem.price,
                    passengerID: {
                        name: elem.passengerID.name,
                        surname: elem.passengerID.surname
                    },
                    driverID: {
                        name: elem.driverID.name || "Не",
                        surname: elem.driverID.surname || "задан"
                    },
                    id: elem._id
                }
            }else{
                data[i] = {
                    from: elem.from,
                    to: elem.to,
                    time: elem.time,
                    distance: elem.distance,
                    price: elem.price,
                    passengerID: {
                        name: elem.passengerID.name,
                        surname: elem.passengerID.surname
                    },
                    driverID: {
                        name: "Не",
                        surname: "Задан"
                    },
                    id: elem._id
                }
            }

            i+=1
        }
        for (let i=0; i<routes.length;i++){
            if (routes[i].driverID === undefined){
                routes[i].driverID = {
                    name : "Не",
                    surname : "Задан"
                }
            }
        }
        const user = await UserSchema.findById(req.userId);
        res.render('pages/routes',{trips: data,role: user.role});
    }catch (e){
        console.log(e)
        res.status(500).json({message: "Не удалось получить поездки((",});
    }
}



export const  confirmRoute = async (req, res)=>{
    let status;
    let message;
    const route = await UnratedSchema.findById(req.params.id);
    if (req.body.status === true){
        status = true;
        message= "Успешно";
    }else{
        status = false;
        message = "Отклонено пользователем";
    }
    try{
    const docx = new ArchiveSchema({
        from : route.from,
        to : route.to,
        passengerID : route.passengerID,
        driverID: route.driverID,
        time : route.time,
        distance : route.distance,
        price : route.price,
        status: message,
        flag : status
    })
    await docx.save();
    res.status(200);
    await UnratedSchema.findOneAndDelete({_id:req.params.id});
        }catch (error){
        console.log(error);
        res.status(500);
    }
}

export const giveStats = async (req,res)=>{
    const user = await UserSchema.findById(req.userId);
    let sum  =0 ;

    let active = [];
    let success = [];
    let archive = [];
    let failed = [];
    let unrated = [];
    let revenue;
    let lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth()-1);
    if (user.role === "passenger"){
        active = await RouteSchema.find({passengerID : req.userId});
        failed = await ArchiveSchema.find({flag : false, passengerID : req.userId});
        archive = await ArchiveSchema.find ({flag : true, passengerID : req.userId});
    }
    if (user.role === "driver"){
        active = await RouteSchema.find({driverID : req.userId});
        failed = await ArchiveSchema.find({flag : false, driverID : req.userId});
        archive = await ArchiveSchema.find ({flag : true, driverID : req.userId});
        revenue = await ArchiveSchema.aggregate([
            {
                $match: {
                    time: {$gte: lastMonth, $lt: new Date()},
                    driverID : req.userId
                }
            },
            {
                $group: {
                    _id: {$dateToString: {format: "%Y-%m-%d", date: "$time"}},
                    totalValue: {$sum: "$price"}
                }
            }
        ]);
    }
    if (user.role === "admin" ) {
        active = await RouteSchema.find();
        failed = await ArchiveSchema.find({flag: false});
        archive = await ArchiveSchema.find ({flag : true});

        success = await  ArchiveSchema.aggregate([
            {
                $match: {
                    flag : true,
                }
            },
            {
                $group: {
                    _id: {$dateToString: {format: "%Y-%m-%d", date: "$time"}},
                    totalValue: {$sum: 1}
                }
            }
        ]);
        revenue = await ArchiveSchema.aggregate([
            {
                $match: {
                    time: {$gte: lastMonth, $lt: new Date()},
                    flag:true
                }
            },
            {
                $group: {
                    _id: {$dateToString: {format: "%Y-%m-%d", date: "$time"}},
                    totalValue: {$sum: "$price"}
                }
            }
        ]);
        success.forEach(function(obj) {
            // Получение значения поля и добавление его к сумме
            sum += obj.totalValue;
        });
    }


    try{
    if (user.role !== "passenger") {
        for (let date = lastMonth; date <= new Date(); date.setDate(date.getDate() + 1)) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;
            if (revenue.some(item => item.date === formattedDate)) {
                continue;
            } else {
                revenue.push(
                    {
                        _id: formattedDate,
                        totalValue: 0
                    }
                );
            }
        }
        revenue.sort((a, b) => new Date(a._id) - new Date(b._id));

    }
    }catch(error){}
    success.sort((a, b) => new Date(a._id) - new Date(b._id));


    res.render('pages/stats',{active: active,failed: failed, success : success, role: user.role, revenue: revenue, archive: archive, succ : sum });

};

export const pageConfirmRoute = async (req, res)=>{
    let routes;
    const user = await UserSchema.findById(req.userId);
    if (user.role !== "admin") {
        routes = await UnratedSchema.find({passengerID: req.userId}).populate('passengerID').populate('driverID').exec();
    }else{
        routes =await UnratedSchema.find().populate('passengerID').populate('driverID').exec();
    }
    let data = [];
    let i =0;
    try{
    for (let elem of routes){
        if (elem.driverID !== undefined) {
            data[i] = {
                from: elem.from,
                to: elem.to,
                time: elem.time,
                distance: elem.distance,
                price: elem.price,
                passengerID: {
                    name: elem.passengerID.name,
                    surname: elem.passengerID.surname
                },
                driverID: {
                    name: elem.driverID.name || "Не",
                    surname: elem.driverID.surname || "задан",
                    carModel : elem.driverID.carModel || "-",
                    carNumber : elem.driverID.carNumber || ""
                },
                id: elem._id
            }
        }else{
            data[i] = {
                from: elem.from,
                to: elem.to,
                time: elem.time,
                distance: elem.distance,
                price: elem.price,
                passengerID: {
                    name: elem.passengerID.name,
                    surname: elem.passengerID.surname

                },
                driverID: {
                    name: elem.driverID.name || "Не",
                    surname: elem.driverID.surname || "задан",
                    carModel : elem.driverID.carModel || "-",
                    carNumber : elem.driverID.carNumber || ""
                },
                id: elem._id
            }
        }

        i+=1
    }

    res.render('pages/rate',{trips: data,role: user.role});
}catch (e){
    console.log(e)
    res.status(500).json({message: "Не удалось получить поездки((",});
}
}
const task = schedule.scheduleJob('*/15 * * * *',moveRoutes);

export const archivePage = async (req,res)=>{
    let routes;
    const user = await UserSchema.findById(req.userId);
    if (user.role!== "admin"){
    routes = await ArchiveSchema.find({
        $or : [
            {passengerID : req.userId
            },
            {driverID : req.userId}
        ]
    }).populate('driverID').populate('passengerID').exec();
        }else{
        routes = await ArchiveSchema.find().populate('driverID').populate('passengerID').exec();
    }
    let data = [];
    let i=0;
    for (let elem of routes){
        if (elem.driverID !== undefined) {
            data[i] = {
                from: elem.from,
                to: elem.to,
                time: elem.time,
                distance: elem.distance,
                price: elem.price,
                passengerID: {
                    name: elem.passengerID.name,
                    surname: elem.passengerID.surname
                },
                driverID: {
                    name: elem.driverID.name || "Не",
                    surname: elem.driverID.surname || "задан",
                    carModel : elem.driverID.carModel || "-",
                    carNumber : elem.driverID.carNumber || ""
                },
                id: elem._id,
                status:elem.status
            }
        }else{
            data[i] = {
                from: elem.from,
                to: elem.to,
                time: elem.time,
                distance: elem.distance,
                price: elem.price,
                passengerID: {
                    name: elem.passengerID.name,
                    surname: elem.passengerID.surname

                },
                driverID: {
                    name: "Не",
                    surname: "Задан",
                    carModel : "-",
                    carNumber : ""
                },
                status:elem.status,
                id: elem._id
            }
        }

        i+=1
    }
    res.render('pages/archive',{trips: data,role: user.role});
}

export const createCF =async (req, res)=>{
    const User = await UserSchema.findById(req.userId);
    if (User.role !== "admin") return;
    try {
        const doc = new CfSchema({
            date: new Date(),
            timeCF: req.body.timeCF,
            cmCF: req.body.cmCF
        })
        await doc.save();
        res.status(200);
    }catch (error){
        console.log(error);
        res.status(500);
    }
}