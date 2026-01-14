const { EmployeeMaster } = require('../models'); // adjust path if needed

// Create a new employee
const createEmployee = async (req, res) => {
  try {
    const { name, father_name, husband_wife_name, sir_name, dob, mobile_number, rfid, gender } = req.body;

    // Basic validation
    if (!name || !dob || !mobile_number) {
      return res.status(400).json({ message: "Name, DOB, and Mobile Number are required",success:false });
    }

    const newEmployee = await EmployeeMaster.create({
      name,
      father_name,
      husband_wife_name,
      sir_name,
      dob,
      mobile_number,
      rfid,
      gender
    });

    res.status(201).json({ message: "Employee created", data: newEmployee,success:true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message ,success:false});
  }
};

// Get all employees
const getEmployees = async (req, res) => {
  try {
    const employees = await EmployeeMaster.findAll();
    res.status(200).json({ data: employees,success:true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message,success:false });
  }
};

// Get single employee by ID
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await EmployeeMaster.findByPk(id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.status(200).json({ data: employee });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message,success:false });
  }
};

// Update employee
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, father_name, husband_wife_name, sir_name, dob, mobile_number, rfid, gender } = req.body;

    const employee = await EmployeeMaster.findByPk(id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    await employee.update({
      name,
      father_name,
      husband_wife_name,
      sir_name,
      dob,
      mobile_number,
      rfid,
      gender
    });

    res.status(200).json({ message: "Employee updated", data: employee });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete employee
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await EmployeeMaster.findByPk(id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    await employee.destroy();
    res.status(200).json({ message: "Employee deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
};
