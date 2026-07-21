import express from "express";
import upload from"../middleware/upload.middleware.js"
import { getDocumentList, getDownloadDocument, getEmployeeDocuments, postDeleteDocument, postUpdateDocument, postUploadDocument } from "../controller/document.controller.js";

const router=express.Router();

router.post("/upload",upload.single("document"),postUploadDocument);

router.get("/list",getDocumentList);
router.get("/employee/:employeeId",getEmployeeDocuments);
router.get("/download/:documentId", getDownloadDocument);

router.patch("/update",upload.single("document"),postUpdateDocument);

router.delete("/delete",postDeleteDocument);


export default router;
