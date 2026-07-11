import express from "express";

import {getRoleList,postAddRole, postDeleteRole, postUpdateRole} from "../controller/role.controller.js";

const router = express.Router();

router.post("/add",postAddRole);

router.get("/list",getRoleList);

router.patch("/update",postUpdateRole);

router.patch("/delete",postDeleteRole);

export default router;