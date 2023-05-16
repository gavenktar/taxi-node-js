import mongoose, {mongo} from "mongoose";


const archiveSchema = new mongoose.Schema({
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
    status : {
        type : String
    },
    flag:{
        type : Boolean
    }
})

export default mongoose.model('Archive',archiveSchema)