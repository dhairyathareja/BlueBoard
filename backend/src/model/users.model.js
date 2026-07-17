import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const { Schema } = mongoose;

const userSchema = new Schema({

    employeeId: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },

    name: {
        type: String,
        required: true,
        trim: true,
    },

    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },

    password: {
        type: String,
        required: true,
        trim: true,
    },

    refreshToken: {
        type: String,
        default: null,
    },

    phone: {
        type: Number,
    },

    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
        default: null
    },

    awsProfile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AwsProfile",
        default: null
    },

    department: {
        type: String,
        trim: true,
    },

    designation: {
        type: String,
        required: true,
        trim: true,
    },

    joiningDate: {
        type: Date,
        default: Date.now
    },

    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    status: {
        type: String,
        required: true,
        default: "Pending",
        trim: true
    },

    onboardingStatus: {
        type: String,
        required: true,
        default: "Pending",
        trim: true
    },

    createdBy: {
        type: String,
        required: true,
        trim: true,
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date,
        default: null
    },

    updatedBy: {
        type: String,
        trim: true,
        default: null
    },

    lastLogin: {
        type: Date,
        default: null
    },

    isFirstLogin: {
        type: Boolean,
        default: true
    },

    isDeleted: {
        type: Boolean,
        default: false
    }

});


// Frequently filtered fields
userSchema.index({ department: 1 });

userSchema.index({ manager: 1 });

userSchema.index({ role: 1 });

userSchema.index({ status: 1 });

userSchema.index({ onboardingStatus: 1 });

// Dashboard sorting
userSchema.index({ createdAt: -1 });

// Compound indexes (HR Queries)
userSchema.index({
    department: 1,
    status: 1
});

userSchema.index({
    manager: 1,
    status: 1
});

// Global Search
userSchema.index({
    employeeId: "text",
    name: "text",
    email: "text"
});


// ===================== MIDDLEWARE =====================

userSchema.pre("save", async function () {

    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);

});


// ===================== METHODS =====================

userSchema.methods.isPasswordCorrect = async function (enteredPassword) {

    return await bcrypt.compare(enteredPassword, this.password);

};

userSchema.methods.generateRefreshToken = async function () {

    return jwt.sign(
        {
            userId: this._id
        },
        process.env.REFRESH_TOKEN_KEY,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );

};

userSchema.methods.generateAccessToken = async function () {

    return jwt.sign(
        {
            userId: this._id,
            email: this.email,
            name: this.name
        },
        process.env.ACCESS_TOKEN_KEY,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );

};

const User = mongoose.model("User", userSchema);

export default User;