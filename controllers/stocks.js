import { nanoid } from "nanoid";
import { writeToDatabase, readFromDatabase } from "../utils/fileOperations.js";
import path from "path";

const pathToInventoryDb = new URL("../data/inventory.json", import.meta.url);
const pathToUsersDb = new URL("../data/users.json", import.meta.url);

const stockIdGenerator = () => {
  const stockId = nanoid();
  return stockId;
};

const storeIdGenerator = (storeArray) => {
  const storeId =
    storeArray.length !== 0 ? storeArray[storeArray.length - 1].storeId : 0;

  return storeId + 1;
};

// future update
// function authoriseUser(req, res) {
//     const usersDb = readFromDatabase(pathToUsersDb);
//     const isValid = usersDb.find(
//     (connection) => connection.store.some(
//       (store) => store.storeName === oldStoreName
//     ) && connection.password === password && connection.id === Number(id)
//   )

//   if(!isValid){
//     res.send({
//         statusCode: 400,
//         message: "Not Authorised"
//     });

//     return;
//   }
// }

const createStore = (req, res) => {
  if (!req.body) {
    res.send({
      statusCode: 400,
      message: "No data found",
    });

    return;
  }

  const { id, password } = req.params;

  const data = req.body;

  if (!data.storeName) {
    res.send({
      statusCode: 400,
      message: "No data found",
    });

    return;
  }

  const usersDb = readFromDatabase(pathToUsersDb);

  const stocksDb = readFromDatabase(pathToInventoryDb);

  const storeExist = stocksDb.find(
    (store) => store.storeName === data.storeName,
  );

  if (storeExist) {
    res.send({
      statusCode: 400,
      message: "Store name is not available",
    });

    return;
  }

  const userStoreObject = {
    storeId: storeIdGenerator(stocksDb),
    storeName: data.storeName,
  };

  const storeObject = {
    ...userStoreObject,
    items: new Array(),
  };

  const user = usersDb.find(
    (user) => user.id === Number(id) && user.password === password,
  );

  user.store.push(userStoreObject);

  stocksDb.push(storeObject);

  try {
    writeToDatabase(usersDb, pathToUsersDb);

    writeToDatabase(stocksDb, pathToInventoryDb);

    res.send({
      statusCode: 201,
      message: "Store Created successfully",
    });
  } catch (err) {
    console.log(err);
    res.send({
      statusCode: 500,
      message: "Failed to create store",
    });
  }
};

const getAllStores = (req, res) => {
  const stores = readFromDatabase(pathToInventoryDb);

  res.send({
    statusCode: 200,
    data: stores,
  });
};

const getStore = (req, res) => {
  if (!req.params) {
    res.send({
      statusCode: 400,
      message: "No data found",
    });

    return;
  }

  const { storeName } = req.params;

  const stores = readFromDatabase(pathToInventoryDb);

  const store = stores.find(
    (store) => store.storeName.toLowerCase() === storeName.toLowerCase(),
  );

  if (!store) {
    return res.send({
      statusCode: 404,
      message: "Store not found",
    });
  }

  res.send({
    statusCode: 200,
    data: store,
  });
};

const searchStores = (req, res) => {
  const { query } = req.params;

  const stores = readFromDatabase(pathToInventoryDb);

  const result = stores.filter((store) =>
    store.storeName.toLowerCase().includes(query.toLowerCase()),
  );

  res.send({
    statusCode: 200,
    data: result,
  });
};

const editStore = (req, res) => {
  if (!req.body) {
    res.send({
      statusCode: 400,
      message: "No data found",
    });

    return;
  }

  const { id, password, oldStoreName } = req.params;
  const { storeName } = req.body;

  const usersDb = readFromDatabase(pathToUsersDb);
  const inventoryDb = readFromDatabase(pathToInventoryDb);

  //   make sure user edits only their store
  const isValid = usersDb.find(
    (connection) =>
      connection.store.some((store) => store.storeName.toLowerCase() === oldStoreName.toLowerCase()) &&
      connection.password === password &&
      connection.id === Number(id),
  );

  if (!isValid) {
    res.send({
      statusCode: 400,
      message: "Not Authorised",
    });

    return;
  }

  // check if store exists
  const storeExists = inventoryDb.find(
    (store) => store.storeName.toLowerCase() === oldStoreName.toLowerCase(),
  );

  if (!storeExists) {
    res.send({
      statusCode: 404,
      message: "Store not found",
    });
    return;
  }

  // check if new name matches an exisiting store because, we can't have two stores bearing the same name
  const duplicate = inventoryDb.find((store) => store.storeName.toLowerCase() === storeName.toLowerCase());

  if (duplicate) {
    res.send({
      statusCode: 400,
      message: "Store name already exists. Choose a different store name",
    });
    return;
  }

  // get the store name from the user store and ready it for manipulation
  const userStore = usersDb.find((query) =>
    query.store.some((store) => store.storeName.toLowerCase() === oldStoreName.toLowerCase()),
  );

  if (!userStore) {
    res.send({
      statusCode: 404,
      message: "Store not found",
    });

    return;
  }

  const storeToUpdate = userStore.store.find(
    (store) => store.storeName.toLowerCase() === oldStoreName.toLowerCase(),
  );

  if (!storeToUpdate) {
    res.send({
      statusCode: 404,
      message: "No record found",
    });

    return;
  }
  //update the inventory storeName and the user storeName

  storeExists.storeName = storeName;

  storeToUpdate.storeName = storeName;

  try {
    writeToDatabase(usersDb, pathToUsersDb);
    writeToDatabase(inventoryDb, pathToInventoryDb);

    res.send({
      statusCode: 200,
      message: "Store updated",
    });
  } catch (err) {
    console.log(err);
    res.send({
      statusCode: 500,
      message: "An unexpected error occured",
    });
  }
};

const deleteStore = (req, res) => {
  const { id, password, storeName } = req.params;

  const usersDb = readFromDatabase(pathToUsersDb);
  const inventoryDb = readFromDatabase(pathToInventoryDb);

  const storeExist = inventoryDb.find((store) => store.storeName.toLowerCase() === storeName.toLowerCase());

  if (!storeExist) {
    res.send({
      statusCode: 400,
      message: "Store not found",
    });
    return;
  }

  //   make sure user only edits only their store
  const isValid = usersDb.find(
    (connection) =>
      connection.store.some((store) => store.storeName.toLowerCase() === storeName.toLowerCase()) &&
      connection.password === password &&
      connection.id === Number(id),
  );

  if (!isValid) {
    res.send({
      statusCode: 400,
      message: "Not Authorised",
    });

    return;
  }

  isValid.store = isValid.store.filter(
    (store) => store.storeName.toLowerCase() !== storeName.toLowerCase(),
  );

  const updatedInventory = inventoryDb.filter(
    (store) => store.storeName.toLowerCase() !== storeName.toLowerCase(),
  );

  try {
    writeToDatabase(usersDb, pathToUsersDb);
    writeToDatabase(updatedInventory, pathToInventoryDb);

    res.send({
    statusCode: 200,
    message: "Store deleted successfully",
  });

  } catch (err) {
    console.log(err);
    res.send({
      statusCode: 500,
      message: "An error occurred",
    });
  };
};

// items

const createItem = (req, res) => {
  if (!req.body) {
    res.send({
      statusCode: 400,
      message: "No data found",
    });

    return;
  }
  const data = req.body;

  const stocksDb = readFromDatabase(pathToInventoryDb);

  const usersDb = readFromDatabase(pathToUsersDb);

  const { id, password } = req.params;

  const isValid = usersDb.find(
    (connection) =>
      connection.store.some((store) => store.storeName.toLowerCase() === data.storeName.toLowerCase()) &&
      connection.password === password &&
      connection.id === Number(id),
  );

  if (!isValid) {
    res.send({
      statusCode: 400,
      message: "Not Authorised",
    });

    return;
  }

  const store = stocksDb.find((store) => store.storeName.toLowerCase() === data.storeName.toLowerCase());

  if (!store) {
    res.send({
      statusCode: 404,
      message: "Store not found",
    });

    return;
  }

  const itemExists = store.items.find(
    (item) => item.itemName.toLowerCase() === data.itemName.toLowerCase(),
  );

  if (itemExists) {
    res.send({
      statusCode: 400,
      message: "Item already exists. Do you want to update?",
    });

    return;
  }

  if (
    !data.itemName ||
    !data.category ||
    !data.price ||
    !data.quantity ||
    !data.supplier
  ) {
    res.send({
      statusCode: 400,
      message: "Please fill all fields",
    });

    return;
  }

  if (data.quantity < 0) {
    res.send({
      statusCode: 400,
      message: "Quantity cannot be lower than zero"
    });

    return;
  } else if (data.price < 0) {
    res.send({
      statusCode: 400,
      message: "Price cannot be lower than zero"
    });

    return;
  }

  const itemsObject = {
    id: stockIdGenerator(),
    itemName: data.itemName,
    category: data.category,
    price: Number(data.price),
    quantity: Number(data.quantity),
    supplier: data.supplier,
    createdAt: new Date().toLocaleDateString("sv-SE"),
  };

  store.items.push(itemsObject);

  try {
    writeToDatabase(stocksDb, pathToInventoryDb);
    res.send({
      statusCode: 201,
      message: "Item added successfully",
    });
  } catch (err) {
    console.log(err);
    res.send({
      statusCode: 500,
      message: "Failed to add items to store",
    });
  }
};

const getAllStoreItems = (req, res) => {
  const { storeName } = req.params;

  const inventory = readFromDatabase(pathToInventoryDb);

  const store = inventory.find((store) => store.storeName.toLowerCase() === storeName.toLowerCase());

  if (!store) {
    return res.send({
      statusCode: 404,
      message: "Store not found",
    });
  }

  res.send({
    statusCode: 200,
    data: store.items,
  });
};

const searchItem = (req, res) => {
  const { storeName, itemName } = req.params;

  const inventory = readFromDatabase(pathToInventoryDb);

  const store = inventory.find((store) => store.storeName.toLowerCase() === storeName.toLowerCase());

  if (!store) {
    res.send({
      statusCode: 404,
      message: "Store not found",
    });

    return;
  }

  const item = store.items.find(
    (item) => item.itemName.toLowerCase() === itemName.toLowerCase(),
  );

  if (!item) {
    res.send({
      statusCode: 404,
      message: "Item not found",
    });

    return;
  }

  res.send({
    statusCode: 200,
    data: item,
  });
};

const editItem = (req, res) => {
  const { id, password, storeName, itemId } = req.params;

  if (!req.body) {
    res.send({
      statusCode: 400,
      message: "No data found",
    });

    return;
  }

  const inventory = readFromDatabase(pathToInventoryDb);
  const usersDb = readFromDatabase(pathToUsersDb);

  const store = inventory.find((store) => store.storeName.toLowerCase() === storeName.toLowerCase());

  if (!store) {
    res.send({
      statusCode: 404,
      message: "Store not found",
    });

    return;
  }

  const isValid = usersDb.find(
    (connection) =>
      connection.store.some((store) => store.storeName.toLowerCase() === storeName.toLowerCase()) &&
      connection.password === password &&
      connection.id === Number(id),
  );

  if (!isValid) {
    res.send({
      statusCode: 400,
      message: "Not Authorised",
    });

    return;
  }

  const item = store.items.find((item) => item.id === itemId);

  if (!item) {
    res.send({
      statusCode: 404,
      message: "Item not found",
    });

    return;
  }

  if (req.body.quantity && req.body.quantity < 0) {
    res.send({
      statusCode: 400,
      message: "Quantity cannot be lower than zero"
    });

    return;
  } else if (req.body.price && req.body.price < 0) {
    res.send({
      statusCode: 400,
      message: "Price cannot be lower than zero"
    });

    return;
  }

  item.itemName = req.body.itemName ?? item.itemName;
  item.category = req.body.category ?? item.category;
  item.price = req.body.price ?? item.price;
  item.quantity = req.body.quantity ?? item.quantity;
  item.supplier = req.body.supplier ?? item.supplier;

  item.updatedAt = new Date().toLocaleDateString("sv-SE");

  try {
    writeToDatabase(inventory, pathToInventoryDb);

    res.send({
      statusCode: 200,
      message: "Item updated",
    });
  } catch (err) {
    console.log(err);
    res.send({
      statusCode: 500,
      message: "Something went wrong. Definitely, it is your fault :)",
    });
  }
};

const deleteItem = (req, res) => {
  const { id, password, storeName, itemId } = req.params;

  const usersDb = readFromDatabase(pathToUsersDb);

  const isAuthorized = usersDb.find(
    (connection) =>
      connection.store.some((store) => store.storeName.toLowerCase() === storeName.toLowerCase()) &&
      connection.password === password &&
      connection.id === Number(id),
  );

  if (!isAuthorized) {
    res.send({
      statusCode: 400,
      message: "Not Authorised",
    });

    return;
  }

  const inventory = readFromDatabase(pathToInventoryDb);

  const store = inventory.find((store) => store.storeName.toLowerCase() === storeName.toLowerCase());

  if (!store) {
    res.send({
      statusCode: 404,
      message: "Store not found",
    });

    return;
  }

  const item = inventory.find((i) =>
    i.items.some((items) => items.id === itemId),
  );

  if (!item) {
    res.send({
      statusCode: 404,
      message: "Item not found",
    });

    return;
  }

  store.items = store.items.filter((item) => item.id !== itemId);

  writeToDatabase(inventory, pathToInventoryDb);

  res.send({
    statusCode: 200,
    message: "Item deleted",
  });
};

export {
  createStore,
  getAllStores,
  getStore,
  searchStores,
  editStore,
  deleteStore,
  createItem,
  getAllStoreItems,
  searchItem,
  editItem,
  deleteItem,
};