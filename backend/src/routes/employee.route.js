import express from "express";

import { getEmployeeList } from "../Controller/employee.controller.js";

const router = express.Router();

router.get(
    "/list",
    getEmployeeList
);

export default router;