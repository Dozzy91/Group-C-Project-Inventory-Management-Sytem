import path from "path";
import { readFromDatabase } from "../utils/fileOperations.js";

const pathToUsersDb = new URL("../data/users.json", import.meta.url);

const authMiddleware = (req, res, next) => {
  const { id, password } = req.params;

  if (!id || !password) {
    res.send({
      statusCode: 404,
      message: "Credentials Missing",
    });

    return;
  }

  try {
    const users = readFromDatabase(pathToUsersDb);

    const user = users.find(
      (user) => user.id === Number(id) && user.password === password,
    );

    if (!user) {
      res.send({
        statusCode: 400,
        message: "Invaid credentials",
      });
      return;
    }

    // if successful hand over authority to the next process
    next();
  } catch (error) {
    console.log(error);
    res.send({
      statusCode: 500,
      message: "Failed to authorize user",
    });
  }
};

export default authMiddleware;
