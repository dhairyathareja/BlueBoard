import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
    {
        roleName: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            index: true,
        },

        // AWS IAM Group Name
        awsGroupName: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },

        description: {
            type: String,
            trim: true,
            default: "",
        },

        permissions: {
            type: [String],
            default: [],
        },

        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Optimized for listing active roles
roleSchema.index({
    isDeleted: 1,
    createdAt: -1,
});

export const Role = mongoose.model("Role", roleSchema);