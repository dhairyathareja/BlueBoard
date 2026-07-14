import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({

    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    documentType: {
        type: String,
        required: true,
        trim: true
    },

    fileName: {
        type: String,
        required: true,
        trim: true
    },

    s3Key: {
        type: String,
        required: true,
        unique: true
    },

    fileUrl: {
        type: String,
        required: true
    },

    fileSize: {
        type: Number,
        required: true
    },

    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    status: {
        type: String,
        default: "Uploaded"
    },

    isDeleted: {
        type: Boolean,
        default: false
    }

},{
    timestamps:true
});

documentSchema.index(
    {
        employee: 1,
        documentType: 1,
        isDeleted: 1
    },
    {
        unique: true,
        partialFilterExpression: {
            isDeleted: false
        }
    }
);

export const Document = mongoose.model(
    "Document",
    documentSchema
);