import { writeToDatabase, readFromDatabase } from "../utils/fileOperations.js";
import path from "path";

const pathToUsersDb = new URL("../data/users.json", import.meta.url);

function userIdGenerator(userArray) {
  const userId =
    userArray.length !== 0 ? userArray[userArray.length - 1].id : 0;

  return userId + 1;
}

const createUser = (req, res) => {
  if (!req.body) {
    res.send({
      statusCode: 400,
      message: "No data found",
    });

    return;
  }
  const data = req.body;

  if (!data.userName || !data.password || !data.storeName) {
    res.send({
      statusCode: 400,
      message: "Some fields missing. Please fill all fields",
    });

    return;
  }

  // read the db/file to check if a student exists
  const usersDB = readFromDatabase(pathToUsersDb);
  console.log("djndfd", usersDB);

  //check if student exists
  const storeExist = usersDB.find((user) => user.storeName === data.storeName);

  if (storeExist) {
    res.send({
      statusCode: 400,
      message: "This store name is already taken.",
    });

    return;
  }

  const generatedId = userIdGenerator(usersDB);

  const userObject = {
    userName: data.userName,
    password: data.password,
    storeName: data.storeName,
    id: generatedId,
  };

  // else add student to db
  usersDB.push(userObject);

  try {
    writeToDatabase(usersDB, pathToUsersDb);
    res.send({
      statusCode: 201,
      message: "User Created successfully",
    });
  } catch (err) {
    console.log(err);
    res.send({
      statusCode: 500,
      message: "Failed to create user",
    });
  }
};

export { createUser };
