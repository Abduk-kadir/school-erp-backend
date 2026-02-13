const { Route } = require('../models'); // adjust path if needed

/**
 * Get all routes
 * GET /api/routes
 */
const getAllRoutes = async (req, res) => {
  try {
    const routes = await Route.findAll({
      order: [['route_name', 'ASC']],
    });

    return res.status(200).json({
      success: true,
      data: routes,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching routes',
      error: error.message,
    });
  }
};

/**
 * Get single route by ID
 * GET /api/routes/:id
 */
const getRouteById = async (req, res) => {
  try {
    const { id } = req.params;

    const route = await Route.findByPk(id);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: route,
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

/**
 * Create new route
 * POST /api/routes
 * Body: { "route_name": "Mumbai - Pune Expressway" }
 */
const createRoute = async (req, res) => {
  try {
    const { route_name } = req.body;

    if (!route_name || typeof route_name !== 'string' || route_name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'route_name is required and must be a non-empty string',
      });
    }

    const newRoute = await Route.create({
      route_name: route_name.trim(),
    });

    return res.status(201).json({
      success: true,
      data: newRoute,
      message: 'Route created successfully',
    });
  } catch (error) {
    console.error(error);

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Route name already exists',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create route',
      error: error.message,
    });
  }
};

/**
 * Update route
 * PATCH /api/routes/:id
 */
const updateRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const { route_name } = req.body;

    const route = await Route.findByPk(id);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found',
      });
    }

    if (route_name) {
      route.route_name = route_name.trim();
    }

    await route.save();

    return res.status(200).json({
      success: true,
      data: route,
      message: 'Route updated successfully',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update route',
      error: error.message,
    });
  }
};

/**
 * Delete route
 * DELETE /api/routes/:id
 */
const deleteRoute = async (req, res) => {
  try {
    const { id } = req.params;

    const route = await Route.findByPk(id);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found',
      });
    }

    await route.destroy();

    return res.status(200).json({
      success: true,
      message: 'Route deleted successfully',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete route',
      error: error.message,
    });
  }
};

module.exports = {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
};