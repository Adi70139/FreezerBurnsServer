import mongoose from "mongoose";

export const  connectDB = async () =>{
    await mongoose.connect('mongodb+srv://aditya_leo:leopassword70139@cluster0.qyyzd8a.mongodb.net/food-del').then(()=>console.log("DB Connected"))
}

