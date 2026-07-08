import User from "../model/users.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import ErrorWrapper from "../utils/ErrorWrapper.js";

export const getEmployeeList = ErrorWrapper(async (req, res, next) => {

    let {
        page = 1,
        limit = 10,
        department,
        status,
        search
    } = req.query;

    page = Number(page);
    limit = Number(limit);

    if (page <= 0 || limit <= 0) {
        throw new ErrorHandler(400, "Page and Limit must be greater than 0");
    }

    let filter = {
        isDeleted: false
    };

    if (department) {
        filter.department = department;
    }

    if (status) {
        filter.status = status;
    }

    if (search) {
        filter.$or = [
            {
                name: {
                    $regex: search,
                    $options: "i"
                }
            },
            {
                email: {
                    $regex: search,
                    $options: "i"
                }
            },
            {
                employeeId: {
                    $regex: search,
                    $options: "i"
                }
            }
        ];
    }

    try {

        const totalEmployee = await User.countDocuments(filter);

        const employeeList = await User.find(filter)
            .select("-password")
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({

            success: true,

            currentPage: page,

            totalPages: Math.ceil(totalEmployee / limit),

            totalEmployee,

            employeeList

        });

    } catch (error) {

        throw new ErrorHandler(
            500,
            error.message || "Unable to Fetch Employee List"
        );

    }

});