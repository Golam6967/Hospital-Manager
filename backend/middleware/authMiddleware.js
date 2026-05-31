const jwt = require("jsonwebtoken");

// Verify Access Token Middleware
const verifyAccessToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No access token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access token expired",
        code: "TOKEN_EXPIRED",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid access token",
    });
  }
};

// Verify Refresh Token Middleware
const verifyRefreshToken = (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "No refresh token provided",
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    req.refreshToken = refreshToken;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Refresh token expired. Please login again.",
        code: "REFRESH_TOKEN_EXPIRED",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid refresh token",
    });
  }
};

// Role-based Authorization Middleware
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(401).json({
        success: false,
        message: "User role not found in token",
      });
    }

    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${allowedRoles.join(", ")}`,
      });
    }

    next();
  };
};

// Permission-based Authorization Middleware
const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    // This would typically check against a permissions field in the user document
    // For now, we'll implement basic role-based checks
    const permissionMap = {
      admin: ["manage_users", "manage_hospitals", "manage_all"],
      manager: ["manage_staff", "view_reports"],
      doctor: ["view_patients", "update_records"],
      staff: ["view_data"],
      user: ["view_own_data"],
    };

    const userPermissions = permissionMap[req.userRole] || [];

    if (!userPermissions.includes(requiredPermission)) {
      return res.status(403).json({
        success: false,
        message: `Permission denied. Required permission: ${requiredPermission}`,
      });
    }

    next();
  };
};

module.exports = {
  verifyAccessToken,
  verifyRefreshToken,
  authorize,
  checkPermission,
};
