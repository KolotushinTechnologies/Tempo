const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  if (req.method === "OPTIONS") {
    next();
  }

  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(403).json({
        status: "error",
        message: "Пользователь не авторизован!",
      });
    }

    const decodedData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decodedData;
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({
      statusCode: 401,
      stringStatus: "Unauthorized",
      message: "Пользователь не авторизован!",
    });
  }
}

module.exports = authMiddleware;
