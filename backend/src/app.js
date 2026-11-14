// create server
const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes')
const foodRoutes = require('./routes/food.routes')


const app = express();
app.use(cookieParser());  // middleware
app.use(express.json()); //middleware



app.get("/", (req,res) =>{
    res.send("hello World");
})

app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);  // add food items to our db


module.exports = app;