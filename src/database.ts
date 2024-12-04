import { Db, MongoClient } from "mongodb";

const MONGODB_URI = 'mongodb://admin:password@localhost:27017/interview?authSource=admin';
const DATABASE_NAME = 'interview';

export let database: {
    dbClient: MongoClient;
    dbHandle: Db;
};

export async function connectToMongoDB() {
    try {
        const dbClient = await MongoClient.connect(MONGODB_URI);
        console.log("Successfully connected to server " + MONGODB_URI);
        database = {
            dbClient,
            dbHandle: dbClient.db(DATABASE_NAME)
        };
    } catch (error) {
        console.log("Error creating database connection: " + error);
        throw error;
    }
}
