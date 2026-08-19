import bcrypt from "bcryptjs";
import { readFromDatabase } from "../utils/fileOperations.js";
import {
  signAccessToken,
  ACCESS_TOKEN_COOKIE,
  accessTokenCookieOptions,
} from "../utils/token.js";

const pathToUsersDb = new URL("../data/users.json", import.meta.url);

const login = async (req, res) => {
  const { userName, password } = req.body || {};

  if (!userName || !password) {
    res.status(400).send({
      statusCode: 400,
      message: "Shop owner name and password are required",
    });
    return;
  }

  try {
    const users = readFromDatabase(pathToUsersDb);

    const user = users.find(
      (u) => u.userName.toLowerCase() === userName.toLowerCase(),
    );

    // Same generic message whether the user doesn't exist or the password
    // is wrong - don't leak which one it was.
    if (!user) {
      res.status(400).send({
        statusCode: 400,
        message: "Incorrect shop owner name or password",
      });
      return;
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      res.status(400).send({
        statusCode: 400,
        message: "Incorrect shop owner name or password",
      });
      return;
    }

    const accessToken = signAccessToken(user);

    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, accessTokenCookieOptions);

    const { password: _password, ...safeUser } = user;

    res.send({
      statusCode: 200,
      message: "Logged in successfully",
      data: safeUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      statusCode: 500,
      message: "Failed to log in",
    });
  }
};

const logout = (req, res) => {
  // Clear with the exact same options (minus maxAge) it was set with,
  // otherwise some browsers will silently keep the old cookie around.
  res.clearCookie(ACCESS_TOKEN_COOKIE, {
    httpOnly: accessTokenCookieOptions.httpOnly,
    secure: accessTokenCookieOptions.secure,
    sameSite: accessTokenCookieOptions.sameSite,
    path: accessTokenCookieOptions.path,
  });

  res.send({
    statusCode: 200,
    message: "Logged out successfully",
  });
};

export { login, logout };
