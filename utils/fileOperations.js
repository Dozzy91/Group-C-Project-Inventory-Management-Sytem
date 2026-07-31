import fs from "fs";

// Read data from a JSON file
export function readData(filePath) {
    try {
        // Check if the file exists
        if (!fs.existsSync(filePath)) {
            return [];
        }

        // Read the file
        const data = fs.readFileSync(filePath, "utf8");

        // Return an empty array if the file is empty
        if (!data.trim()) {
            return [];
        }

        // Convert JSON string to JavaScript object
        return JSON.parse(data);

    } catch (error) {
        console.error("Error reading file:", error.message);
        return [];
    }
}

// Save data to a JSON file
export function writeData(filePath, data) {
    try {

        fs.writeFileSync(
            filePath,
            JSON.stringify(data, null, 2)
        );

    } catch (error) {
        console.error("Error writing file:", error.message);
        throw error;
    }
}