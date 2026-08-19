import bcrypt from "bcryptjs";
import { writeToDatabase, readFromDatabase } from "../utils/fileOperations.js";
import { ACCESS_TOKEN_COOKIE, accessTokenCookieOptions } from "../utils/token.js";
import path from "path";

const SALT_ROUNDS = 10;

const pathToUsersDb = new URL("../data/users.json", import.meta.url);
const pathToInventoryDb = new URL("../data/inventory.json", import.meta.url);

function userIdGenerator(userArray) {
  const userId =
    userArray.length !== 0 ? userArray[userArray.length - 1].id : 0;

  return userId + 1;
}

const createUser = async (req, res) => {
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

  const usersDB = readFromDatabase(pathToUsersDb);

  // const nameTaken = usersDB.find(
  //   (user) => user.userName.toLowerCase() === data.userName.toLowerCase(),
  // );

  // if (nameTaken) {
  //   res.send({
  //     statusCode: 400,
  //     message: "This shop owner name is already taken.",
  //   });

  //   return;
  // }

  const generatedId = userIdGenerator(usersDB);

  try {
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    const userObject = {
      id: generatedId,
      userName: data.userName,
      password: hashedPassword,
      store: new Array(),
    };

    usersDB.push(userObject);

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

// get all users
const getAllUsers = (req, res) => {
  try {
    const users = readFromDatabase(pathToUsersDb);
    const safeUsers = users.map(({ password, ...rest }) => rest);
    res.send({
      statusCode: 200,
      data: safeUsers,
      totalUsers: safeUsers.length,
    });
  } catch (err) {
    console.log(err);
    res.send({
      statusCode: 500,
      message: "Failed to fetch users",
    });
  }
};

// search for a user
const searchUser =  (req, res) => {
  const userId = Number(req.params.id);

  const users = readFromDatabase(pathToUsersDb);

  const user = users.find(
    (user) => user.id === userId,
  );

  if (!user) {
    res.send({
      statusCode: 404,
      message: "User not found",
    });

    return;
  }

  const { password, ...safeUser } = user;

  res.send({
      statusCode: 200,
      user: safeUser
    });
};

// Get all user info

const getAllUserInfo = (req, res) => {
  const {id, userName} = req.params;

  const users = readFromDatabase(pathToUsersDb);
  const stores = readFromDatabase(pathToInventoryDb);

  const user = users.find(
    (user) => user.id === Number(id) && user.userName.toLowerCase() === userName.toLowerCase(),
  );

  if (!user) {
    res.send({
      statusCode: 404,
      message: "User not found",
    });

    return;
  }

  const store = stores.find(
    (store) => store.storeId === user.storeId
  );

  const storeItems = user.store.map((userStore) => {
    const fullStore = stores.find(
      (store) => store.storeId === userStore.storeId
    );

    return fullStore;
  });

  if(!storeItems) {
    res.send({
      statusCode: 400,
      message: "User has no store yet"
    });

    return;
  }

  // destructuring and spreading the user object without the password
  const {password, ...userObject} = user
  const response = {
    ...userObject,
    store: storeItems
  };

  res.send({
    statusCode: 200,
    data: response
  });

};

// edit user - identity comes from the verified access token, not the URL
const editUser = async (req, res) => {
  const userId = req.user.id;

  const users = readFromDatabase(pathToUsersDb);

  const user = users.find(
    (user) => user.id === userId,
  );

  if (!user) {
    res.send({
      statusCode: 404,
      message: "User not found",
    });

    return;
  }

  if (!req.body.userName && !req.body.password) {
    res.send({
      statusCode: 400,
      message: "No valid fields to update",
    });

    return;
  }

  if (req.body.userName) {
    const nameTaken = users.find(
      (u) =>
        u.id !== userId &&
        u.userName.toLowerCase() === req.body.userName.toLowerCase(),
    );

    if (nameTaken) {
      res.send({
        statusCode: 400,
        message: "This shop owner name is already taken.",
      });

      return;
    }

    user.userName = req.body.userName;
  }

  try {
    if (req.body.password) {
      user.password = await bcrypt.hash(req.body.password, SALT_ROUNDS);
    }

    writeToDatabase(users, pathToUsersDb);

    const { password, ...safeUser } = user;

    res.send({
      statusCode: 200,
      message: "User updated successfully",
      data: safeUser,
    });
  } catch (err) {
    console.log(err);
    res.send({
      statusCode: 500,
      message: "Failed to update user",
    });
  }
};


// delete user - identity comes from the verified access token, not the URL
const deleteUser = (req, res) => {
  const userId = req.user.id;

  const users = readFromDatabase(pathToUsersDb);

  const userIndex = users.findIndex(
    (user) => user.id === userId,
  );

  if (userIndex === -1) {
    res.send({
      statusCode: 404,
      message: "No record found",
    });

    return;
  };

  // strip out the user by deleting them using splice
  users.splice(userIndex, 1);

  try {
    writeToDatabase(users, pathToUsersDb)

    res.clearCookie(ACCESS_TOKEN_COOKIE, {
      httpOnly: accessTokenCookieOptions.httpOnly,
      secure: accessTokenCookieOptions.secure,
      sameSite: accessTokenCookieOptions.sameSite,
      path: accessTokenCookieOptions.path,
    });

    res.send({
      statusCode: 200,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.send({
      statusCode: 500,
      message: "Failed to delete user",
    });
  }
};

// returns the identity of whoever the access token cookie belongs to -
// the frontend can't read the httpOnly cookie itself, so it calls this
// on load to know whether it's logged in and as whom.
const getMe = (req, res) => {
  const users = readFromDatabase(pathToUsersDb);

  const user = users.find((u) => u.id === req.user.id);

  if (!user) {
    res.send({
      statusCode: 404,
      message: "User not found",
    });

    return;
  }

  const { password, ...safeUser } = user;

  res.send({
    statusCode: 200,
    data: safeUser,
  });
};

export { createUser, getAllUsers, searchUser, editUser, deleteUser, getAllUserInfo, getMe };
