import { verifyAccessToken, ACCESS_TOKEN_COOKIE } from "../utils/token.js";

// Verifies the signed access token sent via httpOnly cookie and attaches
// the decoded user ({ id, userName }) to req.user for downstream handlers.
const authMiddleware = (req, res, next) => {
  const token = req.cookies?.[ACCESS_TOKEN_COOKIE];

  if (!token) {
    res.status(401).send({
      statusCode: 401,
      message: "Not authenticated. Please log in.",
    });
    return;
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = { id: decoded.id, userName: decoded.userName };
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      res.status(401).send({
        statusCode: 401,
        message: "Session expired. Please log in again.",
      });
      return;
    }

    res.status(401).send({
      statusCode: 401,
      message: "Invalid session. Please log in again.",
    });
  }
};

export default authMiddleware;
