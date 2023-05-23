import mongoose, {mongo} from "mongoose";


const coefficient = new mongoose.Schema({
    timeCF: {
        type : Number,
        required: true,
    },
    cmCF:{
        type : Number,
        required: true
    },
    date:{
        type: Date,
        required: true
    }
})

export default mongoose.model('Сoefficient',coefficient)