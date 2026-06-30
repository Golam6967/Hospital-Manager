const Hospital = require("../models/Hospital");
const { geocodeHospital } = require("../utils/geocoder");

/**
 * GET all hospitals with pagination
 * Query params: page (default 1), limit (default 50)
 * Example: /api/hospitals?page=1&limit=100
 */
exports.getAllHospitals = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const hospitals = await Hospital.find()
      .skip(skip)
      .limit(limit)
      .sort({ code: 1 });

    const total = await Hospital.countDocuments();

    res.json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: hospitals,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET hospital by ID
 * Example: /api/hospitals/6123abc456def
 */
exports.getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res
        .status(404)
        .json({ success: false, error: "Hospital not found" });
    }
    res.json({ success: true, data: hospital });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * FILTER hospitals by multiple criteria
 * Query params can be: division, district, upazila, type, agency, private, name, email
 * Example: /api/hospitals/filter/advanced?division=Dhaka&type=Government&private=false
 */
exports.filterHospitals = async (req, res) => {
  try {
    const filter = {};

    // Build filter object from query params
    if (req.query.division) filter.division = req.query.division;
    if (req.query.district) filter.district = req.query.district;
    if (req.query.upazila) filter.upazila = req.query.upazila;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.agency) filter.agency = req.query.agency;
    if (req.query.private !== undefined) {
      filter.private = req.query.private === "true";
    }

    // Search by name (case-insensitive)
    if (req.query.name) {
      filter.name = { $regex: req.query.name, $options: "i" };
    }

    // Email search
    if (req.query.email) {
      filter.email = { $regex: req.query.email, $options: "i" };
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const hospitals = await Hospital.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ code: 1 });

    const total = await Hospital.countDocuments(filter);

    res.json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      appliedFilters: filter,
      data: hospitals,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET distinct values for a field (useful for dropdown filters)
 * Example: /api/hospitals/distinct/division
 */
exports.getDistinctValues = async (req, res) => {
  try {
    const validFields = ["division", "district", "upazila", "type", "agency"];
    if (!validFields.includes(req.params.field)) {
      return res.status(400).json({
        success: false,
        error: `Invalid field. Allowed fields: ${validFields.join(", ")}`,
      });
    }

    const values = await Hospital.distinct(req.params.field);
    res.json({
      success: true,
      field: req.params.field,
      count: values.length,
      data: values.sort(),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET statistics about hospitals
 * Example: /api/hospitals/stats
 */
exports.getStatistics = async (req, res) => {
  try {
    const total = await Hospital.countDocuments();
    const privateCount = await Hospital.countDocuments({ private: true });
    const publicCount = total - privateCount;

    const typeStats = await Hospital.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const divisionStats = await Hospital.aggregate([
      { $group: { _id: "$division", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        totalHospitals: total,
        privateHospitals: privateCount,
        publicHospitals: publicCount,
        byType: typeStats,
        byDivision: divisionStats,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * CREATE a new hospital
 * POST body: hospital data
 */
exports.createHospital = async (req, res) => {
  try {
    // Convert private to boolean if it's 0/1
    if (req.body.private !== undefined) {
      req.body.private = req.body.private === 1 || req.body.private === true;
    }

    const hospital = new Hospital(req.body);
    await hospital.save();
    res.status(201).json({ success: true, data: hospital });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * UPDATE hospital by ID
 * PUT body: fields to update
 */
exports.updateHospital = async (req, res) => {
  try {
    // Convert private to boolean if it's 0/1
    if (req.body.private !== undefined) {
      req.body.private = req.body.private === 1 || req.body.private === true;
    }

    const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!hospital) {
      return res
        .status(404)
        .json({ success: false, error: "Hospital not found" });
    }

    res.json({ success: true, data: hospital });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * DELETE hospital by ID
 */
exports.deleteHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndDelete(req.params.id);

    if (!hospital) {
      return res
        .status(404)
        .json({ success: false, error: "Hospital not found" });
    }

    res.json({
      success: true,
      message: "Hospital deleted successfully",
      data: hospital,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * DELETE hospitals by filter criteria
 * Query params: division, district, upazila, type, agency, private
 * Example: DELETE /api/hospitals/delete/by-filter?division=Dhaka&private=true
 */
exports.deleteByFilter = async (req, res) => {
  try {
    const filter = {};

    if (req.query.division) filter.division = req.query.division;
    if (req.query.district) filter.district = req.query.district;
    if (req.query.upazila) filter.upazila = req.query.upazila;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.agency) filter.agency = req.query.agency;
    if (req.query.private !== undefined) {
      filter.private = req.query.private === "true";
    }

    if (Object.keys(filter).length === 0) {
      return res.status(400).json({
        success: false,
        error: "Please provide at least one filter criterion",
      });
    }

    const result = await Hospital.deleteMany(filter);

    res.json({
      success: true,
      message: `${result.deletedCount} hospital(s) deleted`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * DELETE all hospitals (USE WITH CAUTION)
 */
exports.deleteAllHospitals = async (req, res) => {
  try {
    // Require confirmation
    if (req.query.confirm !== "yes-delete-all") {
      return res.status(400).json({
        success: false,
        error:
          "Confirmation required. Add query parameter: ?confirm=yes-delete-all",
      });
    }

    const result = await Hospital.deleteMany({});

    res.json({
      success: true,
      message: "All hospitals deleted",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET hospitals for emergency search, sorted by score descending
 * Query params: problemType (optional), description (optional)
 * Example: /api/hospitals/emergency?problemType=neurological
 */
exports.getEmergencyHospitals = async (req, res) => {
  try {
    const { problemType } = req.query;
    const select = 'name nameBangla type agency division district upazila score private email specialties emergencyCriteria latitude longitude';

    let hospitals = [];
    let useTypeScore = false;

    if (problemType && problemType !== 'general') {
      const criteriaField = `emergencyCriteria.${problemType}`;

      // Try new per-specialty criteria first
      hospitals = await Hospital.find({ [criteriaField]: { $gt: 0 } })
        .sort({ [criteriaField]: -1, name: 1 })
        .limit(30)
        .select(select)
        .lean();

      if (hospitals.length > 0) {
        useTypeScore = true;
      } else {
        // Fall back to legacy specialties array
        hospitals = await Hospital.find({ specialties: problemType })
          .sort({ score: -1, name: 1 })
          .limit(30)
          .select(select)
          .lean();
      }
    }

    if (hospitals.length === 0) {
      hospitals = await Hospital.find()
        .sort({ score: -1, name: 1 })
        .limit(30)
        .select(select)
        .lean();
    }

    // Attach the relevant score so the frontend can display it
    if (useTypeScore && problemType) {
      hospitals = hospitals.map(h => ({
        ...h,
        score: (h.emergencyCriteria instanceof Map
          ? h.emergencyCriteria.get(problemType)
          : h.emergencyCriteria?.[problemType]) ?? h.score ?? 50,
      }));
    }

    res.json({
      success: true,
      problemType: problemType || 'general',
      total: hospitals.length,
      data: hospitals,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST geocode a hospital by ID using Nominatim (address-based, not name-based)
 * Saves the result to the hospital document and returns the updated record.
 * Example: POST /api/hospitals/6123abc456def/geocode
 */
exports.geocodeHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ lat: null, lon: null, fallback: true });
    }

    // Return cached coords immediately — never re-geocode
    if (hospital.latitude != null && hospital.longitude != null) {
      return res.json({ lat: hospital.latitude, lon: hospital.longitude });
    }

    const result = await geocodeHospital(hospital);
    if (!result) {
      return res.json({ lat: null, lon: null, fallback: true });
    }

    hospital.latitude = result.lat;
    hospital.longitude = result.lon;
    await hospital.save();

    res.json({ lat: result.lat, lon: result.lon });
  } catch (error) {
    res.json({ lat: null, lon: null, fallback: true });
  }
};

/**
 * GET API documentation
 */
exports.getDocumentation = (req, res) => {
  res.json({
    success: true,
    message: "Hospital Manager API Documentation",
    endpoints: {
      GET: {
        "/api/hospitals":
          "Get all hospitals with pagination (query: page, limit)",
        "/api/hospitals/:id": "Get hospital by ID",
        "/api/hospitals/filter/advanced":
          "Filter hospitals by criteria (query: division, district, upazila, type, agency, private, name, email)",
        "/api/hospitals/distinct/:field":
          "Get distinct values for a field (division, district, upazila, type, agency)",
        "/api/stats": "Get hospital statistics",
      },
      POST: {
        "/api/hospitals": "Create new hospital",
      },
      PUT: {
        "/api/hospitals/:id": "Update hospital by ID",
      },
      DELETE: {
        "/api/hospitals/:id": "Delete hospital by ID",
        "/api/hospitals/delete/by-filter":
          "Delete hospitals by filter criteria (query: division, district, upazila, type, agency, private)",
        "/api/hospitals/delete-all":
          "Delete all hospitals (requires ?confirm=yes-delete-all)",
      },
    },
  });
};
