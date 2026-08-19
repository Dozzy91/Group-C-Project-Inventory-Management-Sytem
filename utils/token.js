import jwt from "jsonwebtoken";
import "dotenv/config"

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_TTL_SECONDS = 60 * 60; // 1 hour

if (!JWT_SECRET) {
  // Fail loudly at boot rather than silently signing tokens with "undefined".
  throw new Error(
    "JWT_SECRET is not set. Add it to your .env file before starting the server.",
  );
}

function signAccessToken(user) {
  return jwt.sign(
    { id: user.id, userName: user.userName },
    JWT_SECRET,
    { expiresIn: TOKEN_TTL_SECONDS },
  );
}

function verifyAccessToken(token) {
  // Throws if invalid or expired - let the caller decide how to respond.
  return jwt.verify(token, JWT_SECRET);
}

const ACCESS_TOKEN_COOKIE = "accessToken";

// Centralised cookie options so login/logout can never drift apart -
// logout must clear the cookie with the exact same attributes it was set with.
const accessTokenCookieOptions = {
  httpOnly: true, // JS on the frontend never needs to read this directly
  secure: process.env.NODE_ENV === "production", // HTTPS only in prod, allows http on localhost in dev
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: TOKEN_TTL_SECONDS * 1000,
  path: "/",
};

export {
  signAccessToken,
  verifyAccessToken,
  ACCESS_TOKEN_COOKIE,
  accessTokenCookieOptions,
  TOKEN_TTL_SECONDS,
};
