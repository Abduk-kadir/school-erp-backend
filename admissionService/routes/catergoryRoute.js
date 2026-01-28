const express = require("express");
const router = express.Router();

const {createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  getCategoryById
} = require("../controllers/categoryController");

// CRUD Routes
router.post("/", createCategory);
router.get("/", getAllCategories);
router.get("/:id",getCategoryById );
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

module.exports = router;
