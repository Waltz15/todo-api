const authService = require("../services/auth.service");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const logActivity = require("../utils/logActivity");

const register = catchAsync(async (req, res, next) => {
    //Tangkap secret_key juga dari req.body
    const { name, email, password, secret_key } = req.body;

    if (!name || !email || !password) {
        return next(new AppError("Name, email, and password are required", 400));
    }

    //Tentukan role berdasarkan secret_key dari .env
    let assignedRole = "user";
    if (secret_key && secret_key === process.env.ADMIN_SECRET_KEY) {
        assignedRole = "admin";
    }

    //Lempar role ke service register
    const { user, token } = await authService.register({ 
        name, 
        email, 
        password, 
        role: assignedRole 
    });

    await logActivity({
        action: "REGISTER",
        resource: "Auth",
        userId: user._id,
        resourceId: user._id,
        details: `User baru terdaftar: ${user.email}`,
    });

    res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
            user: { id: user._id, name: user.name, email: user.email, role: user.role},
            token,
        },
    });
});

const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError("Email and Password are required", 400));
    }

    const { user, token } = await authService.login({ email, password });

    await logActivity({
        action: "LOGIN",
        resource: "Auth",
        userId: user._id,
        resourceId: user._id,
        details: `User login: ${user.email}`,
    });

    res.status(200).json ({
        success: true,
        message: "Login Successful",
        data: {
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
            token,
        },
    });
});

module.exports = { register, login };