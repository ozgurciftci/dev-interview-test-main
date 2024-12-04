import {connectToMongoDB} from "./database";
import {app} from "./express";

async function init() {
    await connectToMongoDB();
    const listenPort = process.env.LISTEN_PORT ?? 3000;
    app.listen(listenPort);
    console.log(`Listening on port ${listenPort}`);
}

(async () => init())();
