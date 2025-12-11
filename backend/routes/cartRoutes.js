const express = require("express");
const router = express.Router();
const { attachUserOptional } = require("../middleware/userAuth");
const cartController = require("../controllers/cartController");

// All routes work for logged-in users or guests
router.get("/", attachUserOptional, cartController.getCart);
router.post("/items", attachUserOptional, cartController.addItem);
router.put("/items/:itemId", attachUserOptional, cartController.updateItem);
router.delete("/items/:itemId", attachUserOptional, cartController.removeItem);

module.exports = router;
