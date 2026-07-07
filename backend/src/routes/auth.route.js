import express from "express";
import { getProfileInfo,postLogout } from "../controller/Auth.controller.js";
import { addEmployee } from "../controller/Auth.controller.js";
import { loginEmployee } from "../controller/Auth.controller.js";

const router = express.Router();


router.post('/addEmployee',addEmployee);
router.post('/login',loginEmployee);
router.post('/logout',postLogout);

router.get('/profileInfo/:userId',getProfileInfo);


export default router;