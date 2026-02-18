import dotenv from "dotenv";
dotenv.config();

const { start } = await import("./app");
start();
