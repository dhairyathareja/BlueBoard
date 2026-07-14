import express from "express";
import { getAWSProfileList, postDisableAWSAccess, postProvisionAWSAccess, postResetAWSPassword } from "../controller/awsProfile.controller.js";

const router = express.Router();


router.post("/provisionAccess", postProvisionAWSAccess);

router.get("/list", getAWSProfileList);

router.patch("/resetPassword", postResetAWSPassword);

router.patch("/disableAccess", postDisableAWSAccess);

export default router
