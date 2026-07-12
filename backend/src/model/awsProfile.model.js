import mongoose from "mongoose";

const awsProfileSchema = new mongoose.Schema({

    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
        index: true
    },

    awsAccountId: {
        type: String,
        required: true,
        trim: true,
        index: true
    },

    iamUserName: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        index: true
    },

    iamGroup: {
        type: String,
        required: true,
        trim: true
    },

    region: {
        type: String,
        required: true,
        trim: true
    },

    consoleUrl: {
        type: String,
        required: true,
        trim: true
    },

    status: {
        type: String,
        default: "Active",
        trim: true
    },

    isDeleted: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});

awsProfileSchema.index({
    status: 1,
    createdAt: -1
});

export const AwsProfile = mongoose.model(
    "AwsProfile",
    awsProfileSchema
);