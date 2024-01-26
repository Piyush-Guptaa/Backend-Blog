import { db } from "../server.js";
import {Blog} from "../models/blog.js";
import { Comment } from "../models/comment.js";
import { ObjectId } from "mongodb";


export class BlogController {

    /**
     * The method is responsible for creating a new blog.
     *  It takes the blog information, such as title, owner, main content,
     *  and the current date. It then creates a new Blog object,
     *  inserts it into the "blogs" collection in the database, and returns the inserted ID.
     */
    static async createBlog(blog, owner) {
        let currentDate = new Date().toISOString();
        let newBlog = new Blog(blog.title, owner, blog.mainContent, currentDate.split('T')[0])
        let blogCollection = db.collection("blogs");
        let operationResult = await blogCollection.insertOne(newBlog);
        return operationResult.insertedId || null;
    }


    /**
     * The method,deletes a blog based on its ID.
     *  It removes the blog from the "blogs" collection
     *  and returns the count of deleted blogs (0 or 1).
     */
    static async deleteBlog(blogID) {
        let blogCollection = db.collection("blogs");
        let deletionResult = await blogCollection.deleteOne({"_id" : new ObjectId(blogID)});
        return deletionResult.deletedCount // return 0 or 1
    }


    /**
     * The method, modifies an existing blog's content based on its ID.
     *  It retrieves the existing blog,
     *  updates it with the provided data, and
     *  returns the updated blog or null if the blog doesn't exist.
     */
    static async editBlog(blogID, updatedData) {
        let blogCollection = db.collection("blogs");
        let wantedBlog = await blogCollection.findOne({"_id" : new ObjectId(blogID)});
        if (wantedBlog) {
            await blogCollection.updateOne({"_id" : new ObjectId(blogID)}, {$set: {...updatedData}});
        }
        return wantedBlog || null;
    }


    /**
     * The method, retrieves a blog based on its ID from the "blogs"
     *  collection and returns it or null if the blog doesn't exist.
     */
    static async getBlogById(blogID) {
        let blogCollection = db.collection("blogs");
        let targetBlog = await blogCollection.findOne({_id : new ObjectId(blogID)});
        return targetBlog || null; 
    }


    /**
     * The fifth method, addCommentToBlog, adds a new comment to a specified blog.
     *  It retrieves the target blog, creates a new comment, and
     *  updates the blog's comments array with the new comment.
     *  It returns the count of modified blogs (0 or 1).
     */
    static async addCommentToBlog(blogId, comment, commentOwner) {
        let blog = await this.getBlogById(blogId);
        let blogCollection = db.collection("blogs");
        let newComment = new Comment(comment, commentOwner);

        let blogUpdatingResult = await blogCollection.updateOne(blog, 
            {$push: {comments : newComment}})
        return blogUpdatingResult.modifiedCount; //return 0 or 1
    }



    /**
     * The sixth method, deleteCommentFromBlog, removes a comment
     *  from a specified blog. It finds the index of the target comment,
     *  removes it from the blog's comments array, and updates the blog in the database.
     *  It returns the count of modified blogs (0 or 1).
     */
    static async deleteCommentFromBlog(blogId, commentId, user) {
        let blog = await this.getBlogById(blogId);
        let blogCollection = db.collection("blogs");


        let targetCommentIndex = blog.comments.findIndex((comment) => {
            if (comment?.id == commentId && user._id.toString() == comment.ownerId?.toString()) {
                return true;
            }
        })
        if (targetCommentIndex == -1) {
            return null;
        }

        blog.comments.splice(targetCommentIndex, 1);      
        let blogUpdatingResult = await blogCollection.updateOne({"_id" : new ObjectId(blogId)}, {

            $set : {comments : blog.comments}
        })
        return blogUpdatingResult.modifiedCount;
    }
}