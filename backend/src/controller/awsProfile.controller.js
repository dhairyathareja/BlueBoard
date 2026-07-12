import {
    CreateUserCommand,
    CreateLoginProfileCommand,
    AddUserToGroupCommand,
    RemoveUserFromGroupCommand,
    DeleteLoginProfileCommand,
    DeleteUserCommand
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
