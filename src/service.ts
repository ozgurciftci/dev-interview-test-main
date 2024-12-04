import {Db} from "mongodb";
import axios from "axios";

export const getPrices = async (db: Db) => {
    return await db.collection('prices').find().toArray();
}

// Create a second averagePrices GET REST API which uses the MongoDB Aggregation API to group documents by their 'symbol' and calculate the average price, returning the results to the caller as an array of JSON documents, each containing the symbol and the average price. 4 documents should be returned from each call to the API.

export const averagePrices = async (db: Db) => {
    const results = await db.collection('prices').aggregate([
        {
            $group: {
                _id: "$symbol",
                averagePrice: {$avg: "$price"}
            }
        },
        {
            $project: {
                _id: 0,
                symbol: "$_id",
                averagePrice: 1
            }
        }
    ]).toArray();

    return enhanceWithCurrentPrices(results);

}

const enhanceWithCurrentPrices = async (results: any[]) => {
    const enhancedResults = [];
    for (const result of results) {
        const min = result.averagePrice - 5;
        const max = result.averagePrice + 5;

        try {
            const currentPrice = await fetchCurrentPrice(min, max);
            enhancedResults.push({
                symbol: result.symbol,
                averagePrice: result.averagePrice,
                currentPrice,
            });
            await delay(1000); // Rate limit: 1 call per second
        } catch (error) {
            console.error(`Error fetching current price for symbol ${result.symbol}:`, error);
            // You could choose to push a partial result or skip
            enhancedResults.push({
                symbol: result.symbol,
                averagePrice: result.averagePrice,
                currentPrice: null, // Fallback for missing current price
            });
        }
    }
    return enhancedResults;
}

const fetchCurrentPrice = async (min: number, max: number): Promise<number> => {
    const url = `https://csrng.net/csrng/csrng.php?min=${min}&max=${max}`;
    const response = await axios.get(url);

    if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
        throw new Error("Invalid response from external API");
    }

    return response.data[0].random;
};

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
