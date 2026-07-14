import {
    CreateUserCommand,
    CreateLoginProfileCommand,
    AddUserToGroupCommand,
    RemoveUserFromGroupCommand,
    DeleteLoginProfileCommand,
    DeleteUserCommand,
    UpdateLoginProfileCommand
} from "@aws-sdk/client-iam";

import iamClient from "../config/aws.config.js";
import generatePassword from "../utils/generatePassword.js";

import User from "../model/users.model.js";

import ErrorWrapper from "../utils/ErrorWrapper.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { AwsProfile } from "../model/awsProfile.model.js";

export const postProvisionAWSAccess = ErrorWrapper(async (req, res, next) => {

    const { employeeId } = req.body;

    const requiredField = [
        "employeeId"
    ];

    const incomingField = Object.keys(req.body);

    const missingField = requiredField.filter(
        field => !incomingField.includes(field)
    );

    if (missingField.length > 0) {

        throw new ErrorHandler(
            401,
            `Please Enter the Missing Fields: ${missingField.join(", ")}`
        );

    }

    try {

        const employee = await User.findOne({

            employeeId,

            isDeleted: false

        })
        .populate("role", "roleName awsGroupName")
        .select("-password");

        if (!employee) {

            throw new ErrorHandler(
                404,
                "Employee not found"
            );

        }

        if (!employee.role) {

            throw new ErrorHandler(
                401,
                "Assign Employee Role before provisioning AWS Access"
            );

        }

        const existingProfile = await AwsProfile.exists({

            employee: employee._id,

            isDeleted: false

        });

        if (existingProfile) {

            throw new ErrorHandler(
                401,
                "AWS Access already provisioned"
            );

        }

        const iamGroup = employee.role.awsGroupName;

        const iamUserName = `bb-${employee.employeeId.toLowerCase()}`;

        const temporaryPassword = generatePassword();

        const consoleUrl =
            `https://${process.env.AWS_ACCOUNT_ID}.signin.aws.amazon.com/console`;

                // Create IAM User

        const createUserCommand = new CreateUserCommand({

            UserName: iamUserName

        });

        await iamClient.send(createUserCommand);

        // Create Login Profile (Temporary Password)

        const createLoginProfileCommand = new CreateLoginProfileCommand({

            UserName: iamUserName,

            Password: temporaryPassword,

            PasswordResetRequired: true

        });

        await iamClient.send(createLoginProfileCommand);

        // Add User to IAM Group

        const addUserToGroupCommand = new AddUserToGroupCommand({

            GroupName: iamGroup,

            UserName: iamUserName

        });

        await iamClient.send(addUserToGroupCommand);

                // Save AWS Profile in MongoDB

        try {

            const awsProfile = await AwsProfile.create({

                employee: employee._id,

                awsAccountId: process.env.AWS_ACCOUNT_ID,

                iamUserName,

                iamGroup,

                region: process.env.AWS_REGION,

                consoleUrl,

                status: "Active"

            });

            employee.awsProfile = awsProfile._id;

            await employee.save();

        } catch (dbError) {

            // Rollback if MongoDB save fails

            try {

                await iamClient.send(
                    new RemoveUserFromGroupCommand({

                        GroupName: iamGroup,

                        UserName: iamUserName

                    })
                );

                await iamClient.send(
                    new DeleteLoginProfileCommand({

                        UserName: iamUserName

                    })
                );

                await iamClient.send(
                    new DeleteUserCommand({

                        UserName: iamUserName

                    })
                );

            } catch (rollbackError) {

                console.log("Rollback Failed :", rollbackError);

            }

            throw new ErrorHandler(
                500,
                "AWS User Created but MongoDB Save Failed"
            );

        }

        res.status(200).json({

            success: true,

            message: "AWS Access Provisioned Successfully",

            credentials: {

                iamUserName,

                temporaryPassword,

                consoleUrl,

                iamGroup,

                region: process.env.AWS_REGION

            }

        });

        } catch (error) {

            console.log(error);

            if (error instanceof ErrorHandler) {
                throw error;
            }

            if (error.name === "EntityAlreadyExistsException") {

                throw new ErrorHandler(
                    401,
                    "IAM User already exists."
                );

            }

            if (error.name === "NoSuchEntityException") {

                throw new ErrorHandler(
                    404,
                    "IAM Group not found."
                );

            }

            throw new ErrorHandler(
                500,
                "AWS Provisioning Failed."
            );

    }

});


export const getAWSProfileList = ErrorWrapper(async (req, res, next) => {

    let {
        page = 1,
        limit = 10,
        region,
        status,
        search
    } = req.query;

    page = Number(page);
    limit = Number(limit);

    let filter = {
        isDeleted: false
    };

    if (region) {

        filter.region = region;

    }

    if (status) {

        filter.status = status;

    }

    if (search) {

        filter.iamUserName = {
            $regex: search,
            $options: "i"
        };

    }

    try {

        const [totalProfiles, awsProfiles] = await Promise.all([

            AwsProfile.countDocuments(filter),

            AwsProfile.find(filter)
                .populate(
                    "employee",
                    "employeeId name email department designation"
                )
                .sort({
                    createdAt: -1
                })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean()

        ]);

        res.status(200).json({

            success: true,

            currentPage: page,

            totalPages: Math.ceil(totalProfiles / limit),

            totalProfiles,

            awsProfiles

        });

    } catch (error) {

        throw new ErrorHandler(
            501,
            "Can't Fetch AWS Profiles. Please try again later."
        );

    }

});


export const postResetAWSPassword = ErrorWrapper(async (req, res, next) => {

    const { awsProfileId } = req.body;

    const requiredField = [
        "awsProfileId"
    ];

    const incomingField = Object.keys(req.body);

    const missingField = requiredField.filter(
        field => !incomingField.includes(field)
    );

    if (missingField.length > 0) {

        throw new ErrorHandler(
            401,
            `Please Enter the Missing Fields: ${missingField.join(", ")}`
        );

    }

    try {

        const awsProfile = await AwsProfile.findOne({

            _id: awsProfileId,

            isDeleted: false

        });

        if (!awsProfile) {

            throw new ErrorHandler(
                404,
                "AWS Profile not found"
            );

        }

        const temporaryPassword = generatePassword();

        await iamClient.send(

            new UpdateLoginProfileCommand({

                UserName: awsProfile.iamUserName,

                Password: temporaryPassword,

                PasswordResetRequired: true

            })

        );

        res.status(200).json({

            success: true,

            message: "Password Reset Successfully",

            credentials: {

                iamUserName: awsProfile.iamUserName,

                temporaryPassword

            }

        });

    } catch (error) {
        
        if (error instanceof ErrorHandler) {

            throw error;

        }

        throw new ErrorHandler(

            501,

            "Can't Reset AWS Password"

        );

    }

});


export const postDisableAWSAccess = ErrorWrapper(async (req, res, next) => {

    const { awsProfileId } = req.body;

    const requiredField = [
        "awsProfileId"
    ];

    const incomingField = Object.keys(req.body);

    const missingField = requiredField.filter(
        field => !incomingField.includes(field)
    );

    if (missingField.length > 0) {

        throw new ErrorHandler(
            401,
            `Please Enter the Missing Fields: ${missingField.join(", ")}`
        );

    }

    try {

        const awsProfile = await AwsProfile.findOne({

            _id: awsProfileId,

            isDeleted: false

        });

        if (!awsProfile) {

            throw new ErrorHandler(
                404,
                "AWS Profile not found"
            );

        }

        await iamClient.send(

            new RemoveUserFromGroupCommand({

                GroupName: awsProfile.iamGroup,

                UserName: awsProfile.iamUserName

            })

        );

        await AwsProfile.findByIdAndUpdate(

            awsProfileId,

            {

                status: "Disabled"

            }

        );

        res.status(200).json({

            success: true,

            message: "AWS Access Disabled Successfully"

        });

    } catch (error) {

        if (error instanceof ErrorHandler) {

            throw error;

        }

        throw new ErrorHandler(

            501,

            "Can't Disable AWS Access"

        );

    }

});