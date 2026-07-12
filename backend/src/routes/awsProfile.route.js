import express from "express";
import { postProvisionAWSAccess } from "../controller/awsProfile.controller.js";

const router = express.Router();


router.post(
    "/provisionAccess",
    postProvisionAWSAccess
);

// router.get("/list", getAWSProfileList);

// router.patch("/update", postUpdateAWSProfile);

// router.patch("/delete", postDeleteAWSProfile);

export default router