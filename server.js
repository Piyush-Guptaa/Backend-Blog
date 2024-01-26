import express from "express";
import { connectToDB } from "./database.js";
import blogRouter from "./routes/blogs.js";
import userRouter from "./routes/users.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const PORT = 9191;
const app = express();

// Connect to the database
export const db = await connectToDB();

// Middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use("/blogs", blogRouter);
app.use("/auth", userRouter);

// Redirect root to /blogs
app.get("/", (req, res) => {
    res.redirect("/blogs");
});

// 404 Error Handling
app.use((req, res) => {
    res.status(404).json({ message: "Oops, the page was not found" });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});