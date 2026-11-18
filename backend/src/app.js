// create server
const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes')
const foodRoutes = require('./routes/food.routes')
const foodPartnerRoutes = require('./routes/food-partner.routes')
const cors = require('cors');


const app = express();
app.use(cookieParser());  // middleware
app.use(express.json()); //middleware

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",  // frontend url
    credentials: true
}));

app.get("/", (req,res) =>{
    res.send("hello World");
})

app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);  // add food items to our db
app.use('/api/food-partner', foodPartnerRoutes);


module.exports = app;