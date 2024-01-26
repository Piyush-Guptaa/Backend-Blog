import { MongoClient } from "mongodb";

const mongoUri = process.env.MongoURI;

async function connectToDB() {
    try {
        const client = new MongoClient(mongoUri, { });
        await client.connect();
        console.log("Connected to the database");
        return client.db();
    } catch (error) {
        console.error("Error connecting to the database:", error);
        throw error; // Rethrow the error to handle it in the calling code
    }
}

export { connectToDB };
