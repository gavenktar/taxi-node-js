import route from '../models/route.js'
import RouteSchema from "../models/route.js";
import UserModel from "../models/user.js";
import jwt from "jsonwebtoken";
import UserSchema from "../models/user.js";
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


export const newroute = async (req,res)=>{
        res.render('pages/newroute');
}
export const getRoutes = async (req, res)=>{
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
                    }
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
                    }
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
        res.render('pages/routes',{trips: data});
    }catch (e){
        console.log(e)
        res.status(500).json({message: "Не удалось получить поездки((",});
    }
}

export const getRoutesId= async (req, res)=>
{
    let id = req.params.id;
    try{
        const routes = await RouteSchema.findById(id);
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
        if (req.userId !== await RouteSchema.findById(id).passengerID) throw new Error();
        await RouteSchema.findByIdAndDelete({
            _id:id,
        },(err,doc)=>{
            if (err){
                console.log(e)
                res.status(500).json({message: "Не удалось удалить поездки((",});
            }
        })
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

    }
    catch (e){
        console.log(e);
    }
}