//const express =require("express")
import express from "express";
import User from "./models/user.model.js";
import connectToMongoDB from "./lib/db.js";
import {clrekMiddleware} from '@clerk/express'
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app=express();

const PORT=process.env.PORT;
const PORT=process.env.FRONTEND_URL;

app.use(express.json())
app.use(cors({origin:FRONTEND_URL,credentials:true}));
app.use(clrekMiddleware());

app.get("/health",(req,res)=>{
    res.status(200).json({ok:true});
});

app.listen(PORT,()=> {connectToMongoDB(); console.log("Server is listening 3000 ")});

