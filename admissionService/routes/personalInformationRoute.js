const express = require("express");
const router = express.Router();

const {
  createPersonalInformation,
  getPersonalInformation,
  getPersonalInformationById,
  updatePersonalInformation,
  deletePersonalInformation,
} = require("../controllers/personalInformationController"); 

// CREATE
router.post("/", createPersonalInformation);

// GET ALL
router.get("/", getPersonalInformation);

// GET BY ID
router.get("/:id", getPersonalInformationById);

// UPDATE BY ID
router.put("/:id", updatePersonalInformation);

// DELETE BY ID
router.delete("/:id", deletePersonalInformation);

module.exports = router;
