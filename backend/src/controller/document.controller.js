import ErrorWrapper from "../utils/ErrorWrapper.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { Document } from "../model/document.model.js";
import User from "../model/users.model.js";
import uploadToS3 from '../utils/s3Upload.js'
import { DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3Client from "../config/s3.config.js";
import DOCUMENT_TYPES from "../utils/documentTypes.js";


export const postUploadDocument = ErrorWrapper(async(req,res,next)=>{

    const {employeeId,documentType,uploadedBy}=req.body;

    const requiredField=[
        "employeeId",
        "documentType",
        "uploadedBy"
    ];

    const incomingField=Object.keys(req.body);

    const missingField=requiredField.filter(
        field=>!incomingField.includes(field)
    );

    if(missingField.length>0){

        throw new ErrorHandler(
            401,
            `Please Enter the Missing Fields: ${missingField.join(", ")}`
        );

    }

    if(!req.file){

        throw new ErrorHandler(
            401,
            "Please Upload a Document"
        );

    }

    if (!DOCUMENT_TYPES.includes(documentType)) {
        throw new ErrorHandler(
            401,
            "Invalid Document Type"
        );
    }

    try{

        const employee=await User.findOne({

            employeeId,

            isDeleted:false

        });

        if(!employee){

            throw new ErrorHandler(
                404,
                "Employee not found"
            );

        }

        const s3Key=`${employee.employeeId}/${Date.now()}-${req.file.originalname}`;

        const fileUrl=await uploadToS3(
            req.file,
            s3Key
        );

        await Document.create({

            employee:employee._id,

            documentType,

            fileName:req.file.originalname,

            s3Key,

            fileUrl,

            fileSize:req.file.size,

            uploadedBy

        });

        res.status(201).json({

            success:true,

            message:"Document Uploaded Successfully",

            fileUrl

        });

    }
    catch(error){

        
        if(error instanceof ErrorHandler){

            throw error;

        }

        throw new ErrorHandler(
            501,
            "Can't Upload Document"
        );

    }

}); 


export const getDocumentList = ErrorWrapper(async (req, res, next) => {

    let {
        page = 1,
        limit = 10,
        documentType,
        search
    } = req.query;

    page = Number(page);
    limit = Number(limit);

    let filter = {
        isDeleted: false
    };

    if (documentType) {

        filter.documentType = documentType;

    }

    try {

        const [totalDocuments, documentList] = await Promise.all([

            Document.countDocuments(filter),

            Document.find(filter)
                .populate(
                    "employee",
                    "employeeId name department designation"
                )
                .populate(
                    "uploadedBy",
                    "employeeId name"
                )
                .sort({
                    createdAt: -1
                })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean()

        ]);

        let filteredDocuments = documentList;

        if (search) {

            filteredDocuments = documentList.filter(doc =>
                doc.employee?.name
                    ?.toLowerCase()
                    .includes(search.toLowerCase()) ||

                doc.employee?.employeeId
                    ?.toLowerCase()
                    .includes(search.toLowerCase())

            );

        }

        res.status(200).json({

            success: true,

            currentPage: page,

            totalPages: Math.ceil(totalDocuments / limit),

            totalDocuments,

            documentList: filteredDocuments

        });

    } catch (error) {

        throw new ErrorHandler(
            501,
            "Can't Fetch Documents"
        );

    }

});


export const getEmployeeDocuments = ErrorWrapper(async (req, res, next) => {

    const { employeeId } = req.params;
    
    try {

        const employee = await User.findOne({

            employeeId,

            isDeleted: false

        });

        if (!employee) {

            throw new ErrorHandler(
                404,
                "Employee not found"
            );

        }

        const documents = await Document.find({

            employee: employee._id,

            isDeleted: false

        })
        .sort({
            createdAt: -1
        })
        .lean();

        res.status(200).json({

            success: true,

            totalDocuments: documents.length,

            documents

        });

    } catch (error) {

        if (error instanceof ErrorHandler) {

            throw error;

        }

        throw new ErrorHandler(
            501,
            "Can't Fetch Employee Documents"
        );

    }

});


export const postUpdateDocument = ErrorWrapper(async(req,res,next)=>{

    const {documentId}=req.body;

    const requiredField=[
        "documentId"
    ];

    const incomingField=Object.keys(req.body);

    const missingField=requiredField.filter(
        field=>!incomingField.includes(field)
    );

    if(missingField.length>0){

        throw new ErrorHandler(
            401,
            `Please Enter the Missing Fields: ${missingField.join(", ")}`
        );

    }

    if(!req.file){

        throw new ErrorHandler(
            401,
            "Please Upload a Document"
        );

    }

    if (!DOCUMENT_TYPES.includes(documentType)) {
        throw new ErrorHandler(
            401,
            "Invalid Document Type"
        );
    }

    try{

        const document=await Document.findOne({

            _id:documentId,

            isDeleted:false

        });

        if(!document){

            throw new ErrorHandler(
                404,
                "Document not found"
            );

        }

        await s3Client.send(

            new DeleteObjectCommand({

                Bucket:process.env.AWS_BUCKET_NAME,

                Key:document.s3Key

            })

        );

        const s3Key=`${document.employee}/${Date.now()}-${req.file.originalname}`;

        const fileUrl=await uploadToS3(
            req.file,
            s3Key
        );

        document.fileName=req.file.originalname;
        document.fileSize=req.file.size;
        document.s3Key=s3Key;
        document.fileUrl=fileUrl;

        await document.save();

        res.status(200).json({

            success:true,

            message:"Document Updated Successfully",

            fileUrl

        });

    }

    catch(error){

        if(error instanceof ErrorHandler){

            throw error;

        }

        throw new ErrorHandler(
            501,
            "Can't Update Document"
        );

    }

});


export const postDeleteDocument = ErrorWrapper(async(req,res,next)=>{

    const {documentId}=req.body;

    const requiredField=[
        "documentId"
    ];

    const incomingField=Object.keys(req.body);

    const missingField=requiredField.filter(
        field=>!incomingField.includes(field)
    );

    if(missingField.length>0){

        throw new ErrorHandler(
            401,
            `Please Enter the Missing Fields: ${missingField.join(", ")}`
        );

    }

    try{

        const document=await Document.findOne({

            _id:documentId,

            isDeleted:false

        });

        if(!document){

            throw new ErrorHandler(
                404,
                "Document not found"
            );

        }

        await s3Client.send(

            new DeleteObjectCommand({

                Bucket:process.env.AWS_BUCKET_NAME,

                Key:document.s3Key

            })

        );

        document.isDeleted=true;

        await document.save();

        res.status(200).json({

            success:true,

            message:"Document Deleted Successfully"

        });

    }

    catch(error){

        if(error instanceof ErrorHandler){

            throw error;

        }

        throw new ErrorHandler(
            501,
            "Can't Delete Document"
        );

    }

});


export const getDownloadDocument = ErrorWrapper(async (req, res) => {

    const { documentId } = req.params;

    const document = await Document.findOne({
        _id: documentId,
        isDeleted: false
    });

    if (!document) {
        throw new ErrorHandler(404,"Document not found");
    }

    
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: document.s3Key
    });

    const downloadUrl = await getSignedUrl(
        s3Client,
        command,
        {
            expiresIn: 300
        }
    );

    res.status(200).json({
        success: true,
        downloadUrl
    });

});