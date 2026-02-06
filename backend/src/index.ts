import { PORT } from "./config";
import { connectDatabase } from "./database/mongodb";
import app from "./app";

async function startServer(){
    await connectDatabase();

    app.listen(PORT, () => {
        console.log(`Server: http://localhost:${PORT}`);
    });
}
startServer();