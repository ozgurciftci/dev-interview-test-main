import {Db} from "mongodb";
import axios from "axios";

export const getPrices = async (db: Db) => {
    return await db.collection('prices').find().toArray();
}


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
        const min = parseInt(result.averagePrice) - 5;
        const max = parseInt(result.averagePrice) + 5;
        console.log('min: ', min, 'max: ', max);
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
