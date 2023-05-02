import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    surname: {
        type: String,
        required: true,
    },
    name : {
        type : String,
        required: true,
    },
    number : {
        type : String,
        required: true,
        unique : true,
    },
    email : {
        type : String,
        required : true,
        unique : true,
    },
    dateOfBirth : {
        type : Date,
        required : true,
    },
    password : {
        type : String,
        required : true,
    },
    sex : {
        type : String,
        enum : ['MAN','WOMAN'],
        required : true,
    },
    role: { type: String, enum: ['driver', 'admin','passenger'], required: true },
    carModel: { type: String },
    carNumber: { type: String },
    licensePlateNumber: { type: String },
},{
    timestamps: true,
});

export default mongoose.model('User',UserSchema);