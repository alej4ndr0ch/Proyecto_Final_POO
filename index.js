import dotenv from "dotenv";

dotenv.config();

const { initServer, defaultAdmin } = await import("./config/server.js");

const start = async () => {
  await initServer();
  await defaultAdmin();
};

start();