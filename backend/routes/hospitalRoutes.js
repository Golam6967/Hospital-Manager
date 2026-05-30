const express = require("express");
const router = express.Router();
const {
  getAllHospitals,
  getHospitalById,
  filterHospitals,
  getDistinctValues,
  getStatistics,
  createHospital,
  updateHospital,
  deleteHospital,
  deleteByFilter,
  deleteAllHospitals,
  getDocumentation,
} = require("../controllers/hospitalController");

// ============= GET ROUTES =============

/**
 * GET API documentation
 */
router.get("/docs", getDocumentation);

/**
 * GET statistics about hospitals
 */
router.get("/stats", getStatistics);

/**
 * GET all hospitals with pagination
 */
router.get("/", getAllHospitals);

/**
 * GET hospital by ID
 */
router.get("/:id", getHospitalById);

/**
 * GET distinct values for a field
 */
router.get("/distinct/:field", getDistinctValues);

/**
 * FILTER hospitals by multiple criteria
 */
router.get("/filter/advanced", filterHospitals);

// ============= POST ROUTES =============

/**
 * CREATE a new hospital
 */
router.post("/", createHospital);

// ============= PUT ROUTES =============

/**
 * UPDATE hospital by ID
 */
router.put("/:id", updateHospital);

// ============= DELETE ROUTES =============

/**
 * DELETE hospital by ID
 */
router.delete("/:id", deleteHospital);

/**
 * DELETE hospitals by filter criteria
 */
router.delete("/delete/by-filter", deleteByFilter);

/**
 * DELETE all hospitals (USE WITH CAUTION)
 */
router.delete("/delete-all", deleteAllHospitals);

module.exports = router;
