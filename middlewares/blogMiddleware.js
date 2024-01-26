import { ObjectId } from "mongodb";
import { db } from "../server.js";

export async function checkBlogOwner(request, response, next) {
    try {
        const blogID = request.params.blogId;
        const user = request.user;

        const blogsCollection = db.collection("blogs");
        const targetBlog = await blogsCollection.findOne({ _id: new ObjectId(blogID) });

        if (targetBlog?.author?.email === user?.email) {
            return next();
        }

        return response.status(403).json({ message: "Access denied!" });
    } catch (error) {
        console.error("Error in checkBlogOwner middleware:", error);
        return response.status(500).json({ message: "Internal server error" });
    }
}
