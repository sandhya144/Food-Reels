const userModel = require("../models/user.model");
const foodPartnerModel = require("../models/foodpartner.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const cookieOptions = {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 1000,
};

function createToken(id, role) {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "1h" });
}

function setSessionCookie(res, id, role) {
    res.cookie("token", createToken(id, role), cookieOptions);
}

function getAccount(role, account) {
    return role === "user"
        ? { _id: account._id, email: account.email, name: account.fullName, role }
        : { _id: account._id, email: account.email, name: account.name, role };
}

async function registerUser(req, res) {
    const { fullName, email, password } = req.body;

    const isUserAlreadyExists = await userModel.findOne({ email });
    if (isUserAlreadyExists) {
        return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.create({ fullName, email, password: hashedPassword });

    setSessionCookie(res, user._id.toString(), "user");
    const account = getAccount("user", user);

    return res.status(201).json({
        message: "User Registered Successfully",
        role: "user",
        account,
        user: { _id: account._id, email: account.email, fullName: account.name },
    });
}

async function loginUser(req, res) {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    setSessionCookie(res, user._id.toString(), "user");
    return res.status(200).json({
        message: "User logged in successfully",
        role: "user",
        account: getAccount("user", user),
        user: { _id: user._id, email: user.email, fullName: user.fullName },
    });
}

async function registerFoodPartner(req, res) {
    const { bussinessname, name, email, password, phone } = req.body;
    const isAccountAlreadyExists = await foodPartnerModel.findOne({ email });

    if (isAccountAlreadyExists) {
        return res.status(400).json({ message: "Food partner account already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const foodPartner = await foodPartnerModel.create({ bussinessname, name, email, phone, password: hashedPassword });

    setSessionCookie(res, foodPartner._id.toString(), "foodPartner");
    const account = getAccount("foodPartner", foodPartner);

    return res.status(201).json({
        message: "Food partner registered successfully",
        role: "foodPartner",
        foodPartner:{
            _id: foodPartner._id,
            email: foodPartner.email,
            name: foodPartner.name,
            phone: foodPartner.phone,
            bussinessname: foodPartner.bussinessname,
        }
    });
}

async function loginFoodPartner(req, res) {
    const { email, password } = req.body;
    const foodPartner = await foodPartnerModel.findOne({ email });

    if (!foodPartner || !(await bcrypt.compare(password, foodPartner.password))) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    setSessionCookie(res, foodPartner._id.toString(), "foodPartner");
    const account = getAccount("foodPartner", foodPartner);

    return res.status(200).json({
        message: "Food partner logged in successfully",
        role: "foodPartner",
        account,
        foodPartner: account,
    });
}

async function getCurrentAccount(req, res) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: "Please login first" });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }

    const models = {
        user: userModel,
        foodPartner: foodPartnerModel,
    };
    const model = models[decoded.role];

    if (!model) {
        return res.status(401).json({ message: "Please login again" });
    }

    const accountRecord = await model.findById(decoded.id);
    if (!accountRecord) {
        return res.status(401).json({ message: "Account not found" });
    }

    return res.status(200).json({
        role: decoded.role,
        account: getAccount(decoded.role, accountRecord),
    });
}

function logout(req, res) {
    res.clearCookie("token", {
        httpOnly: cookieOptions.httpOnly,
        sameSite: cookieOptions.sameSite,
        secure: cookieOptions.secure,
    });
    return res.status(200).json({ message: "Logged out successfully" });
}

module.exports = {
    registerUser,
    loginUser,
    registerFoodPartner,
    loginFoodPartner,
    getCurrentAccount,
    logout,
};
