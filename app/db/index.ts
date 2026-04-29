import { Database } from "bun:sqlite";

const db = new Database();

Bun.file("./app/db/schema.sql").text().then((schema) => {
    db.run(schema);
    console.log("Database schema loaded successfully.");
}).catch((error) => {
    console.error("Error loading database schema:", error);
});

export default db;
