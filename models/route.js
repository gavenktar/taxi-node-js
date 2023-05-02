import mongoose, {mongo} from "mongoose";


const RouteSchema = new mongoose.Schema({
    from: {
        type: String,
        required: true,
    },
    to: {
        type : String,
        required: true,
    },
    passengerID:{
        type: mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required: true,
    },
    driverID:{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required: true,
    },
    time:{
        type : Date,
        required: true,
    },
    distance : {
        type: Number,
        required: true,
    },
    price : {
        type : Number,
        required : true,
    },
    comment : {
        type : String
    }
})

export default mongoose.model('Route',RouteSchema)