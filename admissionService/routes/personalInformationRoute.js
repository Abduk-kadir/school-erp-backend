const express = require("express");
const router = express.Router();

const {
  createPersonalInformation,
  getPersonalInformationbyEmail,
  getAllPersonalInformation,
  getAllColumns,
  login,
  updatePersonalInformation,
  bulkUpdatePersonalInformation,
  getPersonalInformationbyRegNO
} = require("../controllers/personalInformationController"); 

// CREATE
router.post("/", createPersonalInformation);

// GET ALL personal information data by email
router.post("/all",getPersonalInformationbyEmail);

// login
router.post("/login", login);

router.get('/all',getAllPersonalInformation)
router.get('/columns', getAllColumns)
router.get('/reg_no/:reg_no',getPersonalInformationbyRegNO)


router.put("/reg_no/:reg_no", updatePersonalInformation);
router.put("/bulk-update", bulkUpdatePersonalInformation);

// DELETE BY ID
//router.delete("/:id", deletePersonalInformation);

module.exports = router;
