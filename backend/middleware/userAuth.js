const jwt = require("jsonwebtoken");

exports.attachUserOptional = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1].trim();
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // logged-in user
    } catch (err) {
      console.log("JWT verify failed:", err.message);
      req.user = null; // treat as guest
    }
  } else {
    req.user = null; // guest
  }

  next();
};
