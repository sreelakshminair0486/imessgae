//const express =require("express")
import express from "express";
import User from "./models/user.model.js";
import connectToMongoDB from "./lib/db.js";
import {clerkMiddleware} from '@clerk/express'
import fs from "fs";
import path from "path";
import job from "./lib/cron.js";
import clerkWebhook from "./webhooks/clerk.webhook.js";
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

import cors from "cors";
import dotenv from "dotenv";
dotenv.config();


const PORT=process.env.PORT;
const FRONTEND_URL=process.env.FRONTEND_URL;
const publicDir = path.join(process.cwd(), "public");

app.use("/api/webhooks/clerk", express.raw({ type: "application/json" }), clerkWebhook);

app.use(express.json())
app.use(cors({origin:FRONTEND_URL,credentials:true}));
app.use(clerkMiddleware());



app.get("/health",(req,res)=>{
    res.status(200).json({ok:true});
});

app.use("api/auth",authRoutes);
app.use("api/messages",messageRoutes);


if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));

  app.get("/{*any}", (req, res, next) => {
    res.sendFile(path.join(publicDir, "index.html"), (err) => next(err));
  });
}

server.listen(PORT,()=> {
  connectToMongoDB(); 
  console.log("Server is up and running  on port ",PORT);

  if (process.env.NODE_ENV === "production") job.start();
});


