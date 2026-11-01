import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    }, 
    senha: {
        type: String,
        required: true,
        minlength: 6
    },
    idade: {
        type: Number,
        required: false
    }
})


const User = mongoose.model("User", userSchema)
export default User;