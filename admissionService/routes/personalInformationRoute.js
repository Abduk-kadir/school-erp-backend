const express = require("express");
const router = express.Router();

const {
  createPersonalInformation,
  getPersonalInformationbyEmail,
  getAllPersonalInformation,
  login,
  updatePersonalInformation,
  deletePersonalInformation,
} = require("../controllers/personalInformationController"); 

// CREATE
router.post("/", createPersonalInformation);

// GET ALL personal information data by email
router.post("/all",getPersonalInformationbyEmail);

// login
router.post("/login", login);

router.get('/all',getAllPersonalInformation)

// UPDATE BY ID
//router.put("/:id", updatePersonalInformation);

// DELETE BY ID
//router.delete("/:id", deletePersonalInformation);

module.exports = router;
