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


export const getEmployeeDetails = ErrorWrapper(async(req, res, next)=>{
    
    const{id}=req.params;

    try {
        
        const emp = await User.findById(id).select('-password');
        
        res.status(200).json({
            success: true,
            message: `Employee ${emp.name} details fetched successfully`,
            empDetails:emp
        })

    } catch (error) {
        throw new ErrorHandler(501, `Can't Fetch Employee Details, Contact Admin.`);
    }

})


export const postUpdateEmployee = ErrorWrapper(async (req, res, next) => {

    try {

        const {employeeId, phone, department, designation, manager, role, status, onboardingStatus} = req.body;

        const requiredField = ["employeeId", "department", "designation", "status", "onboardingStatus"];

        const incomingField = Object.keys(req.body);

        const missingField = requiredField.filter(
            (field) => !incomingField.includes(field)
        );

        if (missingField.length > 0) {
            throw new ErrorHandler(401,`Please Enter the Missing Fields: ${missingField.join(", ")} to Update Employee`);
        }

        const employee = await User.findOne({ employeeId });

        if (!employee) {
            throw new ErrorHandler(404, "Employee not found");
        }

        const updateUser = await User.findByIdAndUpdate(employee._id, {
            phone,
            department,
            designation,
            manager,
            role,
            status,
            onboardingStatus,
            updatedAt: new Date()

        });
        
        res.status(200).json({
            success: true,
            message: `Employee ${employee.name} Updated Successfully`,
            updateData:updateUser
        });

    } catch (error) {
        throw new ErrorHandler(501, "Can't Update Employee. Please try later or Contact Admin");
    }

});


export const postUpdateStatus = ErrorWrapper(async (req, res, next) => {

    try {

        const {employeeId, status} = req.body;

        const requiredField = ["employeeId", "status"];

        const incomingField = Object.keys(req.body);

        const missingField = requiredField.filter(
            (field) => !incomingField.includes(field)
        );

        if (missingField.length > 0) {
            throw new ErrorHandler(401,`Please Enter the Missing Fields: ${missingField.join(", ")} to Update Employee`);
        }

        const employee = await User.findOne({ employeeId });

        if (!employee) {
            throw new ErrorHandler(404, "Employee not found");
        }

        const updatedUser = await User.findByIdAndUpdate(employee._id, 
            {$set:{status:status}},
            {new: true}
        );
        
        res.status(200).json({
            success: true,
            message: `Employee ${employee.name} Updated Successfully`,
            updateData:updatedUser
        });

    } catch (error) {
        throw new ErrorHandler(501, "Can't Update Employee. Please try later or Contact Admin");
    }

});