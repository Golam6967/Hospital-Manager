const Hospital = require('../models/Hospital');
const { geocodeHospital } = require('../utils/geocoder');

exports.getAllHospitals = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const [hospitals, total] = await Promise.all([
      Hospital.find().skip(skip).limit(limit).sort({ code: 1 }),
      Hospital.countDocuments(),
    ]);

    res.json({ success: true, page, limit, total, totalPages: Math.ceil(total / limit), data: hospitals });
  } catch (err) {
    next(err);
  }
};

exports.getHospitalById = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found', code: 'NOT_FOUND' });
    res.json({ success: true, data: hospital });
  } catch (err) {
    next(err);
  }
};

exports.filterHospitals = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.division) filter.division = req.query.division;
    if (req.query.district) filter.district = req.query.district;
    if (req.query.upazila) filter.upazila = req.query.upazila;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.agency) filter.agency = req.query.agency;
    if (req.query.private !== undefined) filter.private = req.query.private === 'true';
    if (req.query.name) filter.name = { $regex: req.query.name, $options: 'i' };
    if (req.query.email) filter.email = { $regex: req.query.email, $options: 'i' };

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const [hospitals, total] = await Promise.all([
      Hospital.find(filter).skip(skip).limit(limit).sort({ code: 1 }),
      Hospital.countDocuments(filter),
    ]);

    res.json({ success: true, page, limit, total, totalPages: Math.ceil(total / limit), appliedFilters: filter, data: hospitals });
  } catch (err) {
    next(err);
  }
};

exports.getDistinctValues = async (req, res, next) => {
  try {
    const validFields = ['division', 'district', 'upazila', 'type', 'agency'];
    if (!validFields.includes(req.params.field)) {
      return res.status(400).json({ success: false, message: `Invalid field. Allowed: ${validFields.join(', ')}`, code: 'VALIDATION_ERROR' });
    }
    const values = await Hospital.distinct(req.params.field);
    res.json({ success: true, field: req.params.field, count: values.length, data: values.sort() });
  } catch (err) {
    next(err);
  }
};

exports.getStatistics = async (req, res, next) => {
  try {
    const [total, privateCount, typeStats, divisionStats] = await Promise.all([
      Hospital.countDocuments(),
      Hospital.countDocuments({ private: true }),
      Hospital.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Hospital.aggregate([{ $group: { _id: '$division', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    ]);

    res.json({
      success: true,
      data: {
        totalHospitals: total,
        privateHospitals: privateCount,
        publicHospitals: total - privateCount,
        byType: typeStats,
        byDivision: divisionStats,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getEmergencyHospitals = async (req, res, next) => {
  try {
    const { problemType } = req.query;
    const hospitals = await Hospital.find()
      .sort({ score: -1, name: 1 })
      .limit(30)
      .select('name nameBangla type agency division district upazila score private email');

    res.json({ success: true, problemType: problemType || 'general', total: hospitals.length, data: hospitals });
  } catch (err) {
    next(err);
  }
};

exports.createHospital = async (req, res, next) => {
  try {
    if (req.body.private !== undefined) {
      req.body.private = req.body.private === 1 || req.body.private === true;
    }
    const hospital = new Hospital(req.body);
    await hospital.save();
    res.status(201).json({ success: true, data: hospital });
  } catch (err) {
    next(err);
  }
};

exports.updateHospital = async (req, res, next) => {
  try {
    if (req.body.private !== undefined) {
      req.body.private = req.body.private === 1 || req.body.private === true;
    }
    const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found', code: 'NOT_FOUND' });
    res.json({ success: true, data: hospital });
  } catch (err) {
    next(err);
  }
};

exports.deleteHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findByIdAndDelete(req.params.id);
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found', code: 'NOT_FOUND' });
    res.json({ success: true, message: 'Hospital deleted successfully', data: hospital });
  } catch (err) {
    next(err);
  }
};

exports.deleteByFilter = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.division) filter.division = req.query.division;
    if (req.query.district) filter.district = req.query.district;
    if (req.query.upazila) filter.upazila = req.query.upazila;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.agency) filter.agency = req.query.agency;
    if (req.query.private !== undefined) filter.private = req.query.private === 'true';

    if (Object.keys(filter).length === 0) {
      return res.status(400).json({ success: false, message: 'At least one filter criterion required', code: 'VALIDATION_ERROR' });
    }

    const result = await Hospital.deleteMany(filter);
    res.json({ success: true, message: `${result.deletedCount} hospital(s) deleted`, deletedCount: result.deletedCount });
  } catch (err) {
    next(err);
  }
};

exports.deleteAllHospitals = async (req, res, next) => {
  try {
    if (req.query.confirm !== 'yes-delete-all') {
      return res.status(400).json({ success: false, message: 'Confirmation required. Add ?confirm=yes-delete-all', code: 'CONFIRMATION_REQUIRED' });
    }
    const result = await Hospital.deleteMany({});
    res.json({ success: true, message: 'All hospitals deleted', deletedCount: result.deletedCount });
  } catch (err) {
    next(err);
  }
};

exports.geocodeHospitalById = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.json({ lat: null, lon: null, fallback: true });

    if (hospital.latitude != null && hospital.longitude != null) {
      return res.json({ lat: hospital.latitude, lon: hospital.longitude });
    }

    const result = await geocodeHospital(hospital);
    if (!result) return res.json({ lat: null, lon: null, fallback: true });

    hospital.latitude = result.lat;
    hospital.longitude = result.lon;
    await hospital.save();

    res.json({ lat: result.lat, lon: result.lon });
  } catch (err) {
    res.json({ lat: null, lon: null, fallback: true });
  }
};

exports.getDocumentation = (req, res) => {
  res.json({
    success: true,
    message: 'Hospital Manager API Documentation',
    endpoints: {
      GET: {
        '/api/hospitals': 'Get all hospitals with pagination',
        '/api/hospitals/:id': 'Get hospital by ID',
        '/api/hospitals/filter/advanced': 'Filter hospitals',
        '/api/hospitals/distinct/:field': 'Distinct values for a field',
        '/api/hospitals/stats': 'Statistics',
        '/api/hospitals/emergency': 'Emergency hospitals sorted by score',
      },
      POST: { '/api/hospitals': 'Create hospital', '/api/hospitals/:id/geocode': 'Geocode hospital' },
      PUT: { '/api/hospitals/:id': 'Update hospital' },
      DELETE: {
        '/api/hospitals/:id': 'Delete hospital',
        '/api/hospitals/delete/by-filter': 'Delete by filter',
        '/api/hospitals/delete-all': 'Delete all (requires ?confirm=yes-delete-all)',
      },
    },
  });
};
