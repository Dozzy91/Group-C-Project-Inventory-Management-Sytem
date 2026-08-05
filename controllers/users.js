import { writeToDatabase, readFromDatabase } from "../utils/fileOperations.js";
import path from "path";

const pathToUsersDb = new URL("../data/users.json", import.meta.url);
const pathToInventoryDb = new URL("../data/inventory.json", import.meta.url);

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

  const usersDB = readFromDatabase(pathToUsersDb);

  // const storeExist = usersDB.find((user) => user.storeName === data.storeName);

//   if (storeExist) {
//     res.send({
//       statusCode: 400,
//       message: "This store name is already taken.",
//     });

//     return;
//   }

  const generatedId = userIdGenerator(usersDB);

  const userObject = {
    id: generatedId,
    userName: data.userName,
    password: data.password,
    store: new Array(),
  };

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

// get all users
const getAllUsers = (req, res) => {
  try {
    const users = readFromDatabase(pathToUsersDb);
    res.send({
      statusCode: 200,
      data: users,
      totalUsers: users.length,
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

  res.send({
      statusCode: 200,
      user: user
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

  console.log(storeItems);

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

// edit user
const editUser =  (req, res) => {
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

  
  if(req.body.userName && req.body.password ){
    user.userName = req.body.userName;
    user.password = req.body.password;
  }
  else if (req.body.userName) {
    user.userName = req.body.userName;
  } else if (req.body.password) {
    user.password = req.body.password;
  } else {
    res.send({
      statusCode: 400,
      message: "No valid fields to update",
    });

    return;
  }

  // Save the updated student data back to the database
  try {
    writeToDatabase(users, pathToUsersDb)

    res.send({
      statusCode: 200,
      message: "User updated successfully",
      data: user,
    });
  } catch (err) {
    console.log(err);
    res.send({
      statusCode: 500,
      message: "Failed to update user",
    });
  }
};


// delete user
const deleteUser = (req, res) => {
  const userId = Number(req.params.id);
  
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

export { createUser, getAllUsers, searchUser, editUser, deleteUser, getAllUserInfo };
