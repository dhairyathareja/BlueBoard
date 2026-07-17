import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/ErrorHandler.js";
import ErrorWrapper from "../utils/ErrorWrapper.js";
import User from "../model/users.model.js";


// export const verifyjwt=ErrorWrapper(async function (req,res,next){
//     try {
//         const incomingAccessToken=req.cookies.AccessToken;
//         const incomingRefreshToken=req.cookies.RefreshToken;
//         if(!incomingAccessToken || !incomingRefreshToken){
//             throw new ErrorHandler(401,`You are not Authorised to Access, Kindly Login First`);
//         }

//         let userInfo=jwt.verify(incomingAccessToken, process.env.ACCESS_TOKEN_KEY);
//         let user=await User.findOne({_id:userInfo.userId});
//         if(user.refreshToken !== incomingRefreshToken){
//             throw new ErrorHandler(401,`You are not Authorised to Access, Kindly Login First`);
//         }

//         req.user=user;
        
//         next();
//     } catch (error) {
//         throw new ErrorHandler(501,`Server Error While Logging, Contact Admin`);
//     }
// })

export const verifyjwt = ErrorWrapper(async (req, res, next) => {

    try {

        console.log("Cookies:", req.cookies);

        const incomingAccessToken = req.cookies.AccessToken;
        const incomingRefreshToken = req.cookies.RefreshToken;

        console.log("Access Token:", incomingAccessToken);
        console.log("Refresh Token:", incomingRefreshToken);

        if (!incomingAccessToken || !incomingRefreshToken) {
            throw new ErrorHandler(
                401,
                "Tokens Missing"
            );
        }

        const userInfo = jwt.verify(
            incomingAccessToken,
            process.env.ACCESS_TOKEN_KEY
        );

        console.log("Decoded Token:", userInfo);

        const user = await User.findById(userInfo.userId);

        console.log("DB User:", user);

        if (!user) {
            throw new ErrorHandler(
                401,
                "User Not Found"
            );
        }

        console.log("DB Refresh:", user.refreshToken);
        console.log("Cookie Refresh:", incomingRefreshToken);

        if (user.refreshToken !== incomingRefreshToken) {
            throw new ErrorHandler(
                401,
                "Refresh Token Mismatch"
            );
        }

        req.user = user;

        next();

    } catch (error) {

        console.log(error);

        throw error;

    }

});