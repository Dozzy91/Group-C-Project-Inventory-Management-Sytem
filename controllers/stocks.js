import { nanoid } from "nanoid";
import { writeToDatabase, readFromDatabase } from "../utils/fileOperations.js";

const pathToInventoryDb = new URL("../data/inventory.json", import.meta.url);
const pathToUsersDb = new URL("../data/users.json", import.meta.url);
const pathToOrdersDb = new URL("../data/orders.json", import.meta.url);

const stockIdGenerator = () => {
  const stockId = nanoid();
  return stockId;
};

const storeIdGenerator = (storeArray) => {
  const storeId =
    storeArray.length !== 0 ? storeArray[storeArray.length - 1].storeId : 0;

  return storeId + 1;
};

// Confirms the authenticated user (from the verified JWT) owns the store
// named `storeName`. Replaces the old id/password-in-the-URL check.
function userOwnsStore(usersDb, userId, storeName) {
  return usersDb.find(
    (connection) =>
      connection.id === userId &&
      connection.store.some(
        (store) => store.storeName.toLowerCase() === storeName.toLowerCase(),
      ),
  );
}

const createStore = (req, res) => {
  if (!req.body) {
    res.send({
      statusCode: 400,
      message: "No data found",
    });

    return;
  }

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
    (store) => store.storeName.toLowerCase() === data.storeName.toLowerCase(),
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

  const user = usersDb.find((user) => user.id === req.user.id);

  if (!user) {
    res.send({
      statusCode: 404,
      message: "User not found",
    });

    return;
  }

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

  const { oldStoreName } = req.params;
  const { storeName } = req.body;

  const usersDb = readFromDatabase(pathToUsersDb);
  const inventoryDb = readFromDatabase(pathToInventoryDb);

  //   make sure user edits only their own store
  const isValid = userOwnsStore(usersDb, req.user.id, oldStoreName);

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

  const storeToUpdate = isValid.store.find(
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
  const { storeName } = req.params;

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

  //   make sure user only deletes their own store
  const isValid = userOwnsStore(usersDb, req.user.id, storeName);

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

  const isValid = userOwnsStore(usersDb, req.user.id, data.storeName || "");

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
  const { storeName, itemId } = req.params;

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

  const isValid = userOwnsStore(usersDb, req.user.id, storeName);

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
  const { storeName, itemId } = req.params;

  const usersDb = readFromDatabase(pathToUsersDb);

  const isAuthorized = userOwnsStore(usersDb, req.user.id, storeName);

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

  const item = store.items.find((items) => items.id === itemId);

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

// Retrieve (withdraw/sell) one or more items from a store's stock in a
// single batch/order. Every line is validated against current stock
// *before* anything is written, so a batch either fully succeeds or fully
// fails - no partial stock deductions if line 3 of 5 runs out mid-way.
// Each successful batch is logged to orders.json as a retrieval record
// (order id, store, the item ids + quantities taken, and a timestamp) so
// it can be looked up later as retrieval history.
const retrieveItems = (req, res) => {
  const { storeName } = req.params;
  const requestedLines = Array.isArray(req.body?.items) ? req.body.items : [];

  if (requestedLines.length === 0) {
    res.send({
      statusCode: 400,
      message: "Add at least one item to retrieve",
    });

    return;
  }

  const usersDb = readFromDatabase(pathToUsersDb);

  const isAuthorized = userOwnsStore(usersDb, req.user.id, storeName);

  if (!isAuthorized) {
    res.send({
      statusCode: 400,
      message: "Not Authorised",
    });

    return;
  }

  const inventory = readFromDatabase(pathToInventoryDb);

  const store = inventory.find(
    (store) => store.storeName.toLowerCase() === storeName.toLowerCase(),
  );

  if (!store) {
    res.send({
      statusCode: 404,
      message: "Store not found",
    });

    return;
  }

  // First pass: resolve + validate every line without mutating anything.
  const resolvedLines = [];
  const seenItemIds = new Set();

  for (const line of requestedLines) {
    const itemId = line?.itemId;
    const quantityRequested = Number(line?.quantity);

    const item = store.items.find((i) => i.id === itemId);

    if (!item) {
      res.send({
        statusCode: 404,
        message: "One of the selected items could not be found",
      });

      return;
    }

    if (seenItemIds.has(itemId)) {
      res.send({
        statusCode: 400,
        message: `"${item.itemName}" was added more than once - combine it into a single line`,
      });

      return;
    }
    seenItemIds.add(itemId);

    if (!Number.isFinite(quantityRequested) || quantityRequested <= 0) {
      res.send({
        statusCode: 400,
        message: `Enter a quantity greater than zero for "${item.itemName}"`,
      });

      return;
    }

    if (quantityRequested > item.quantity) {
      res.send({
        statusCode: 400,
        message: `Only ${item.quantity} of "${item.itemName}" in stock. Cannot retrieve ${quantityRequested}.`,
      });

      return;
    }

    resolvedLines.push({ item, quantity: quantityRequested });
  }

  // Second pass: everything validated, safe to apply.
  const retrievedAt = new Date().toISOString();

  for (const { item, quantity } of resolvedLines) {
    item.quantity -= quantity;
    item.updatedAt = retrievedAt.slice(0, 10);
  }

  const ordersDb = readFromDatabase(pathToOrdersDb);

  const order = {
    orderId: stockIdGenerator(),
    storeName: store.storeName,
    items: resolvedLines.map(({ item, quantity }) => ({
      itemId: item.id,
      quantity,
    })),
    retrievedAt,
  };

  ordersDb.push(order);

  try {
    writeToDatabase(inventory, pathToInventoryDb);
    writeToDatabase(ordersDb, pathToOrdersDb);

    res.send({
      statusCode: 200,
      message: `Retrieved ${resolvedLines.length} item${resolvedLines.length === 1 ? "" : "s"}`,
      data: { order, items: resolvedLines.map(({ item }) => item) },
    });
  } catch (err) {
    console.log(err);
    res.send({
      statusCode: 500,
      message: "Failed to update stock",
    });
  }
};

// Retrieval history for a store, newest first. Each order's item ids are
// resolved against the store's *current* item list so the history can
// show a name, if an item was since deleted, itemName comes back null
// and the frontend falls back to showing the bare id.
const getOrderHistory = (req, res) => {
  const { storeName } = req.params;

  const usersDb = readFromDatabase(pathToUsersDb);

  const isAuthorized = userOwnsStore(usersDb, req.user.id, storeName);

  if (!isAuthorized) {
    res.send({
      statusCode: 400,
      message: "Not Authorised",
    });

    return;
  }

  const inventory = readFromDatabase(pathToInventoryDb);
  const store = inventory.find(
    (store) => store.storeName.toLowerCase() === storeName.toLowerCase(),
  );

  const ordersDb = readFromDatabase(pathToOrdersDb);

  const orders = ordersDb
    .filter((order) => order.storeName.toLowerCase() === storeName.toLowerCase())
    .map((order) => ({
      orderId: order.orderId,
      retrievedAt: order.retrievedAt,
      items: order.items.map(({ itemId, quantity }) => {
        const currentItem = store?.items.find((i) => i.id === itemId);
        const price = currentItem ? Number(currentItem.price) : null;
        return {
          itemId,
          quantity,
          itemName: currentItem ? currentItem.itemName : null,
          price,
          lineTotal: price != null ? price * quantity : null,
        };
      }),
    }))
    .sort((a, b) => new Date(b.retrievedAt) - new Date(a.retrievedAt));

  res.send({
    statusCode: 200,
    data: orders,
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
  retrieveItems,
  getOrderHistory,
};
