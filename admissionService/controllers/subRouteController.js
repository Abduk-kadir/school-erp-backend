const { SubRoute, Route } = require('../models'); // adjust path if needed

// GET /api/subroutes
const getAllSubRoutes = async (req, res) => {
  try {
    const subroutes = await SubRoute.findAll({
      include: [
        {
          model: Route,
          as: 'Route',           // ← must match the alias you defined
          attributes: ['id', 'route_name'],
        },
      ],
      order: [['sub_route_name', 'ASC']],
    });

    return res.json({
      success: true,
      data: subroutes,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch sub-routes',
      error: error.message,
    });
  }
};

// GET /api/subroutes/:id
const getSubRouteById = async (req, res) => {
  try {
    const { id } = req.params;

    const subroute = await SubRoute.findByPk(id, {
      include: [
        {
          model: Route,
          as: 'Route',
          attributes: ['id', 'route_name'],
        },
      ],
    });

    if (!subroute) {
      return res.status(404).json({
        success: false,
        message: 'Sub-route not found',
      });
    }

    return res.json({
      success: true,
      data: subroute,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// POST /api/subroutes
const createSubRoute = async (req, res) => {
  try {
    const { route_id, sub_route_name } = req.body;
    // Optional: check if parent route exists
    const parentRoute = await Route.findByPk(route_id);
    if (!parentRoute) {
      return res.status(404).json({
        success: false,
        message: `Parent route with id ${route_id} does not exist`,
      });
    }
    const subroute = await SubRoute.create({
      route_id: Number(route_id),
      sub_route_name: sub_route_name.trim(),
    });

    // reload with parent relation
    await subroute.reload({
      include: [{ model: Route, as: 'Route', attributes: ['id', 'route_name'] }],
    });

    return res.status(201).json({
      success: true,
      data: subroute,
      message: 'Sub-route created',
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Failed to create sub-route',
      error: error.message,
    });
  }
};

// PATCH /api/subroutes/:id
const updateSubRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const { route_id, sub_route_name } = req.body;

    const subroute = await SubRoute.findByPk(id);

    if (!subroute) {
      return res.status(404).json({
        success: false,
        message: 'Sub-route not found',
      });
    }

    const updates = {};

    if (route_id !== undefined) {
      if (!Number.isInteger(Number(route_id))) {
        return res.status(400).json({ success: false, message: 'route_id must be integer' });
      }
      const parent = await Route.findByPk(route_id);
      if (!parent) {
        return res.status(404).json({ success: false, message: 'Parent route not found' });
      }
      updates.route_id = Number(route_id);
    }

    if (sub_route_name !== undefined) {
      if (typeof sub_route_name !== 'string' || sub_route_name.trim() === '') {
        return res.status(400).json({ success: false, message: 'sub_route_name must be non-empty string' });
      }
      updates.sub_route_name = sub_route_name.trim();
    }

    if (Object.keys(updates).length === 0) {
      return res.json({ success: true, data: subroute, message: 'No changes provided' });
    }

    await subroute.update(updates);

    await subroute.reload({
      include: [{ model: Route, as: 'Route', attributes: ['id', 'route_name'] }],
    });

    return res.json({
      success: true,
      data: subroute,
      message: 'Sub-route updated',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update sub-route',
      error: error.message,
    });
  }
};

// DELETE /api/subroutes/:id
const deleteSubRoute = async (req, res) => {
  try {
    const { id } = req.params;

    const subroute = await SubRoute.findByPk(id);

    if (!subroute) {
      return res.status(404).json({
        success: false,
        message: 'Sub-route not found',
      });
    }

    await subroute.destroy();

    return res.json({
      success: true,
      message: 'Sub-route deleted successfully',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete sub-route',
      error: error.message,
    });
  }
};

module.exports = {
  getAllSubRoutes,
  getSubRouteById,
  createSubRoute,
  updateSubRoute,
  deleteSubRoute,
};