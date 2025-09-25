import express from "express";
import { createServer } from "node:http";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { ConnectToSocket } from "./controller/socketManager.js";
import userRoute from "./routes/user.js";

dotenv.config(); // ✅ Load .env file at the top

const app = express();

// Use same server for Express + Socket.IO
const server = createServer(app);
const io = ConnectToSocket(server);

app.set("port", process.env.PORT || 8000);

app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true })); // ✅ fix (urlencoded, not json twice)

app.use("/api/v1/users", userRoute);

const start = async () => {
  try {
    const connectiondb = await mongoose.connect(process.env.MONGO_URI);
    console.log(` MONGO DB CONNECTED: ${connectiondb.connection.host}`);

    server.listen(app.get("port"), () => {
      console.log(` Server is running on port ${app.get("port")}`);
    });
  } catch (err) {
    console.error(" MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};

start();
