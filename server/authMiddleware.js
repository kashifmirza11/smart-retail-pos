const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  const token =
    authorizationHeader && authorizationHeader.startsWith("Bearer ")
      ? authorizationHeader.split(" ")[1]
      : null;

  if (!token) {
    return res.status(401).json({
      message: "Authentication token is required.",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
    if (error) {
      return res.status(403).json({
        message: "Invalid or expired token.",
      });
    }

    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
