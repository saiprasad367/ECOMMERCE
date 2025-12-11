const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const verifyAdmin = require("../middleware/auth");
const adminProductController = require("../controllers/adminProductsController");

// ADD PRODUCT (max 10 images)
router.post(
  "/",
  verifyAdmin,
  upload.array("images", 10),
  adminProductController.addProduct
);

// UPDATE PRODUCT
router.put("/:id", verifyAdmin, adminProductController.updateProduct);

// DELETE PRODUCT
router.delete("/:id", verifyAdmin, adminProductController.deleteProduct);

module.exports = router;
