import {MongoClient} from 'mongodb';
import * as dotenv from 'dotenv';

import {quotes} from "./quotes";

dotenv.config();


const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;
const collectionName = process.env.COLLECTION_PRICES;



const seedDatabase = async () => {
    const client = new MongoClient(uri);

    try {
        // Connect to the database
        await client.connect();
        console.log("Connected to MongoDB");

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Drop the collection if it exists
        const collectionExists = await db.listCollections({name: collectionName}).hasNext();
        if (collectionExists) {
            await collection.drop();
            console.log(`Collection '${collectionName}' dropped`);
        }

        // Insert data into the collection
        const result = await collection.insertMany(quotes);
        console.log(`${result.insertedCount} documents inserted successfully!`);
    } catch (err) {
        console.error("Error seeding database:", err);
    } finally {
        // Close the connection
        await client.close();
        console.log("Connection closed");
    }
};

// Run the seed function
(async () => await seedDatabase())();
