import fs from "fs";

function writeToDatabase(studentData, pathToDB) {
  try {
    const data = fs.writeFileSync(
      pathToDB,
      JSON.stringify(studentData, null, 2),
    );

    return data;
  } catch (error) {
    console.log(error);

    throw new Error("An Error Occured");
  }
}

function readFromDatabase(pathToDB) {
  try {
    const data = JSON.parse(fs.readFileSync(pathToDB, "utf8"));

    return data;
  } catch (error) {
    console.log(error);

    throw new Error("An Error Occured");
  }
}

export { writeToDatabase, readFromDatabase };