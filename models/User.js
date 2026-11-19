import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    }, 
    senha: {
        type: String,
        required: true,
        minlength: 8
    },
    idade: {
        type: Number,
        required: false
    }
})


const User = mongoose.model("User", userSchema)
export default User;