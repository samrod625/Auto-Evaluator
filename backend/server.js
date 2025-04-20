import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import userRoutes from "./routes/userRoutes.js";
import testRoutes from "./routes/testRoutes.js";

const app = express();
dotenv.config();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/dbms", userRoutes);
app.use("/dbms/test", testRoutes);

connectDB();
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
