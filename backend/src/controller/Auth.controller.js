import User from "../model/users.model.js";
import ErrorWrapper from "../utils/ErrorWrapper.js";
import ErrorHandler from "../utils/ErrorHandler.js";



const generateAccessAndRefreshToken=async(userId)=>{
    try {
        
        let user= await User.findOne({
            _id:userId
        })
        const accessToken=await user.generateAccessToken();
        const refreshToken= await user.generateRefreshToken();
        
        return {refreshToken,accessToken}

    } catch (error) {
        throw new ErrorHandler(501,`Error While Generating Refresh And Access Token`);
    }
}



export const addEmployee = ErrorWrapper(async (req, res, next) => {

    const {name, email,
        password,
        phone,
        department,
        designation,
        createdBy
    } = req.body;

    const requiredField = [
        "name",
        "email",
        "password",
        "department",
        "designation",
        "createdBy"
    ];

    const incomingField = Object.keys(req.body);
    const missingField = requiredField.filter(
        (field) => !incomingField.includes(field)
    );

    if (missingField.length > 0) {
        throw new ErrorHandler(
            401,
            `Please Enter the Missing Fields: ${missingField.join(", ")}`
        );
    }

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regex.test(email)) {
        throw new ErrorHandler(401, "Please Enter a Valid Email");
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new ErrorHandler(401, `Email: ${email} already exists`);
    }

    // Generate Employee ID (EMP-2026-001)
    const year = new Date().getFullYear();

    const lastEmployee = await User.findOne({})
        .sort({ createdAt: -1 })
        .select("employeeId");

    let employeeId = `EMP-${year}-001`;

    if (lastEmployee && lastEmployee.employeeId) {

        const lastNumber = parseInt(
            lastEmployee.employeeId.split("-")[2]
        );

        employeeId = `EMP-${year}-${String(lastNumber + 1).padStart(3, "0")}`;
    }

    try {

        const user = await User.create({

            employeeId,

            name,

            email,

            password,

            phone,

            department,

            designation,

            createdBy,

            joiningDate: new Date(),

            createdAt: new Date(),

            status: "Pending",

            onboardingStatus: "Pending"

        });

        const newUser = await User.findById(user._id).select("-password");

        res.status(201).json({

            success: true,

            message: `Employee ${newUser.name} Added Successfully`,

            employee: newUser

        });

    } catch (error) {

        throw new ErrorHandler(
            501,
            "Can't Add Employee. Please try again later."
        );

    }

});

export const loginEmployee=ErrorWrapper(async(req,res,next)=>{
    const {email,password} = req.body;
    if(!email){
        throw new ErrorHandler(401,`Please Enter Email`);
    }

    if(!password){
        throw new ErrorHandler(400,`Please Provide Password For Login`);
    }

    let user=await User.findOne({email: email})
    if(!user){
        throw new ErrorHandler(400,`Email does not exist`);
    }
    
    const checkPassword=await user.isPasswordCorrect(password)


    if(!checkPassword){
        throw new ErrorHandler(400,`Entered Password is not correct`);
    }

    const {accessToken,refreshToken}= await generateAccessAndRefreshToken(user._id);
    user.refreshToken=refreshToken
    await user.save({validateBeforeSave: false});

    res.status(200)
        .cookie("RefreshToken",refreshToken)
        .cookie("AccessToken",accessToken)
        .json({
            success:true,
            message:`User ${user.name} login Successfully`,
        })
})



export const postLogout=ErrorWrapper(async(req,res,next)=>{
    try{
        const {userId}=req.body;
        let user=await User.findOne({_id:userId});
        if(!user){
            throw new ErrorHandler(401,`User Does not Exist`);
        }
        user.refreshToken="";
        await user.save();       

        res.status(200)
        .cookie("RefreshToken","")
        .cookie("AccessToken","")
        .json({
                success:true,
                message:`User ${user.name} logout Successfully`,
        })
    }
    catch (error) {
        throw new ErrorHandler(501,error);
    }
    
})


export const getProfileInfo=ErrorWrapper(async (req,res,next) => {

    const{userId}=req.params;
    
    const user = await User.findById(userId)
    .populate("role")
    .populate("awsProfile")
    .select("-password -refreshToken");
    
    if(!user){
        throw new ErrorHandler(401,`User Does not Exist`);
    }
    res.status(200).json({
        message:"User Profile Fetched Successfully",
        user
    })

})