const mongoose = require('mongoose');

function connectDB () {
    return mongoose.connect(process.env.MONGODB_URI)
    .then(() =>{
        console.log("MongoDB connected successfully");
    })
    .catch((err) =>{
        console.error("MongoDB connection failed:", err.message);
        throw err;
    })
}

module.exports = connectDB;