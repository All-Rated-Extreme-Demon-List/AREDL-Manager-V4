import { defineConfig } from "commandkit/config";
import { tasks } from "@commandkit/tasks";

export default defineConfig({
    plugins: [
        tasks({
            sqliteDriverDatabasePath: "./data/tasks.sqlite",
        }),
    ],
});
