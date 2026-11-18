const express = require('express');
const foodController = require("../controllers/food.controller")
const authMiddleware = require("../middleware/auth.middleware")
const router = express.Router();
const multer = require('multer');

const upload = multer({
    storage: multer.memoryStorage(),
})


// POST /api/food/ [protected] --> api for foodpartners admin
router.post('/', authMiddleware.authFoodPartnerMiddleware, upload.single("video"), foodController.createFood);

// GET /api/food/ [protected]  --> api for users
router.get('/', authMiddleware.authUserMiddleware, foodController.getFoodItems);

// GET /api/food/partner/:id
router.get('/partner/:id', foodController.getFoodItemsByPartner);   // will return only the food items belonging to that partner

module.exports = router;