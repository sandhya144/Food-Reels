const express = require ('express');
const {getFoodPartnerById} = require("../controllers/food-partner.controller")
const authMiddleware = require ("../middleware/auth.middleware")


const router = express.Router();

// /api/food-partner/:id

router.get("/:id", authMiddleware.authAnyMiddleware, getFoodPartnerById)


module.exports = router;