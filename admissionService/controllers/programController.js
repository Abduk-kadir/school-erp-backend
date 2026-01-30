const { Program } = require('../models'); // adjust path if needed

// GET /programs - List all programs (with optional include)
exports.getAllPrograms = async (req, res) => {
  try {
    const programs = await Program.findAll({
      include: req.query.include ? [{ all: true }] : [], // optional deep include
    });
    return res.status(200).json({
      success: true,
      count: programs.length,
      data: programs,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /programs/:id
exports.getProgramById = async (req, res) => {
  try {
    const program = await Program.findByPk(req.params.id, {
      include: [{ all: true, nested: true }], // optional: load related data
    });

    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }

    return res.status(200).json({ success: true, data: program });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /programs
exports.createProgram = async (req, res) => {
  try {
    const { program_name, description } = req.body;

   

    const newProgram = await Program.create({
      program_name,
      description: description || null,
    });

    return res.status(201).json({ success: true, data: newProgram });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /programs/:id
exports.updateProgram = async (req, res) => {
  try {
    const program = await Program.findByPk(req.params.id);
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }

    await program.update(req.body);

    return res.status(200).json({ success: true, data: program });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /programs/:id
exports.deleteProgram = async (req, res) => {
  try {
    const program = await Program.findByPk(req.params.id);
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }

    await program.destroy();
    return res.status(200).json({ success: true, message: 'Program deleted' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};