const foodPartnerModel = require("../models/foodpartner.model")
const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken");

// middlewares for admin
async function authFoodPartnerMiddleware(req,res,next) {

    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({
            message: "Please login first"
        })
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
        return res.status(401).json({
            message: "Invalid token"
        })
    }

    if (decoded.role !== "foodPartner") {
        return res.status(403).json({
            message: "Food partner access required"
        })
    }

    const foodPartner = await foodPartnerModel.findById(decoded.id);
    if (!foodPartner) {
        return res.status(404).json({
            message: "Food partner not found"
        });
    }

    req.foodPartner = foodPartner
    next()
}

//middlewares for users
async function authUserMiddleware(req,res,next){
    const token = req.cookies.token;

    if(!token){
        return res.status(401).json({
            message:"Please login first"
        })
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
        return res.status(401).json({
            message: "Invalid token"
        })
    }

    if (decoded.role !== "user") {
        return res.status(403).json({
            message: "User access required"
        })
    }

    const user = await userModel.findById(decoded.id);
    if (!user) {
        return res.status(401).json({
            message: "User not found"
        })
    }

    req.user = user;
    next();
}

// user and foodpartner can access with token 
async function authAnyMiddleware(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            message: "Please login first"
        });
    }

    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return res.status(401).json({
            message: "Invalid token"
        });
    }

    if (decoded.role === "user") {
        const user = await userModel.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                message: "User not found"
            });
        }

        req.user = user;

    } else if (decoded.role === "foodPartner") {
        const foodPartner = await foodPartnerModel.findById(decoded.id);

        if (!foodPartner) {
            return res.status(404).json({
                message: "Food partner not found"
            });
        }

        req.foodPartner = foodPartner;

    } else {
        return res.status(403).json({
            message: "Access denied"
        });
    }

    next();
}


module.exports = {
    authFoodPartnerMiddleware,
    authUserMiddleware,
    authAnyMiddleware
}
