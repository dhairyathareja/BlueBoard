import express from "express";

import { getEmployeeDetails, getEmployeeList, postUpdateEmployee, postUpdateStatus } from "../Controller/employee.controller.js";

const router = express.Router();

router.get("/list",getEmployeeList);
router.get("/details/:id",getEmployeeDetails);

router.post("/update",postUpdateEmployee);
router.post("/update/status",postUpdateStatus);

export default router;