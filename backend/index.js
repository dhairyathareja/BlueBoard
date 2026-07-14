// Import Packages
import "dotenv/config";

import mongoose from "mongoose"; 
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path"; 
import { fileURLToPath } from "url";




// Import Routes
import authRouter from "./src/routes/auth.route.js"; 
import employeeRouter from "./src/routes/employee.route.js";
import roleRouter from "./src/routes/role.route.js";
import awsRouter from "./src/routes/awsProfile.route.js";
import documentRouter from "./src/routes/document.route.js";

const app = express();

app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
}));

app.use(express.json());
app.use(bodyParser.json({ limit: "4kb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "4kb" }));
app.use(cookieParser());


// Routing APIs
app.use('/auth',authRouter);
app.use("/employee", employeeRouter);
app.use("/role", roleRouter);
app.use("/awsProfile", awsRouter);
app.use("/document", documentRouter);



const PORT = process.env.PORT || 4444;
mongoose.connect(process.env.DB_URI)
    .then(() => {
        app.listen(PORT,()=>{
            console.log(`Server Started at ${PORT}`);
        });        
    })
    .catch(err => console.log("❌ DB Error:", err));    

