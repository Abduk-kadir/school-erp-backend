const { ElectiveBasket, class_master } = require('../models'); // adjust path if needed

// GET /api/elective-baskets - List all elective baskets
exports.getAllElectiveBaskets = async (req, res) => {
  console.log('inall section ')
  try {
    const baskets = await ElectiveBasket.findAll({
      include: [
        { model: class_master, as: 'class' }, // assuming association as 'class'
      ],
      
    });

    return res.status(200).json({
      success: true,
      count: baskets.length,
      data: baskets,
    });
  } catch (error) {
    console.error('Error fetching elective baskets:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/elective-baskets/class/:classId/semester/:semester
// Very useful for admission/registration: show all baskets + rules for a class + semester
exports.getBasketsByClassAndSemester = async (req, res) => {
  try {
    const { classId, semester } = req.params;

    const baskets = await ElectiveBasket.findAll({
      where: {
        classId: parseInt(classId),
        semester: parseInt(semester),
      },
      include: [
        { model: Class, as: 'class' },
      ],
      order: [['basket_name', 'ASC']],
    });

    return res.status(200).json({
      success: true,
      count: baskets.length,
      data: baskets,
    });
  } catch (error) {
    console.error('Error fetching baskets by class/semester:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/elective-baskets/:id
exports.getElectiveBasketById = async (req, res) => {
  try {
    const basket = await ElectiveBasket.findByPk(req.params.id, {
      include: [{ model: Class, as: 'class' }],
    });

    if (!basket) {
      return res.status(404).json({ success: false, message: 'Elective basket not found' });
    }

    return res.status(200).json({ success: true, data: basket });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/elective-baskets
exports.createElectiveBasket = async (req, res) => {
  try {
    const {
      classId,
      semester,
      basketName,
      studenttype,
      minChoices =null,
      maxChoices = null,
      exactChoices = null,
      isMandatory = false,
      description = null,
    } = req.body;

    if (!classId || !semester ) {
      return res.status(400).json({
        success: false,
        message: 'classId, semester',
      });
    }

    const newBasket = await ElectiveBasket.create({
      classId,
      semester,
      basketName,
      minChoices,
      maxChoices,
      exactChoices,
      studenttype,
      isMandatory,
      description,
    });

    

    return res.status(201).json({ success: true, data: newBasket });
  } catch (error) {
    console.error('Error creating elective basket:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'This basket name already exists for this class and semester',
      });
    }
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/elective-baskets/:id
exports.updateElectiveBasket = async (req, res) => {
  try {
    const basket = await ElectiveBasket.findByPk(req.params.id);
    if (!basket) {
      return res.status(404).json({ success: false, message: 'Elective basket not found' });
    }

    await basket.update(req.body);

    // Reload to include associations
    const updated = await ElectiveBasket.findByPk(basket.id, {
      include: [{ model: Class, as: 'class' }],
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error(error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Basket name already exists for this class and semester',
      });
    }
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/elective-baskets/:id
exports.deleteElectiveBasket = async (req, res) => {
  try {
    const basket = await ElectiveBasket.findByPk(req.params.id);
    if (!basket) {
      return res.status(404).json({ success: false, message: 'Elective basket not found' });
    }

    await basket.destroy();
    return res.status(200).json({ success: true, message: 'Elective basket deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};