import {Router, Request, Response} from "express";
import {database} from "./database";
import {averagePrices, getPrices} from "./service";

export const router: Router = Router();

router.route("/ping").get((_req: Request, res: Response) => res.send(`OK @ ${new Date()}`));

router.get('/prices', async (req: Request, res: Response) => {
    try {
        const db = database.dbHandle;
        const data = await getPrices(db);
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json('Internal Server Error');
    }
});

router.get('/averagePrices', async (req: Request, res: Response) => {
    try {
        const db = database.dbHandle;
        const data = await averagePrices(db);
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json('Internal Server Error');
    }
});
