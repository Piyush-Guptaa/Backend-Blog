import { Router } from "express";
import {db} from "../server.js"
import { BlogController } from "../controllers/blogController.js";
import { checkBlogOwner } from "../middlewares/blogMiddleware.js";
import { checkUserAuth } from "../middlewares/authMiddleware.js";


const router = new Router();
export default router;


/**
 * The router begins by defining a route to fetch and display all blogs.
 *  It queries the MongoDB collection for blogs, and
 *  if any are found, it responds with a JSON object containing the blogs.
 *  In case of no blogs, it responds with a 404 status and a message.
 */
router.get("/", async function(request, response) {
    let blogsCollection = db.collection("blogs");
    let allBlogs = await blogsCollection.find().toArray();

    if (allBlogs) {
        return response.status(200).json({blogs : allBlogs});
    }

    return response.json(404).json({message : "blogs not found"});
})


router.use(checkUserAuth);

/**
 * A route is defined for creating a blog.
 * Before allowing a blog to be created, it 
 * checks if the user is authenticated (checkUserAuth middleware). If authenticated, the
 * router delegates the creation to BlogController.
 * It then responds with success or failure messages.
 */
router.post("/create_blog", async function(request, response) {
    let blogCreatingResult = await BlogController.createBlog(request.body, request.user);
    if (blogCreatingResult) {
        return response.status(200).json({message : "blog successful created"});
    }
    return response.status(400).json({message : "sorry, but the blog has not been created, try again"});
})


/**
For deleting a blog, the router ensures that the user is authenticated
and is the owner of the blog (checkUserAuth and checkBlogOwner middleware). Upon confirmation,
it delegates the deletion task to BlogController and responds accordingly.
 */
router.delete("/blog/:blogId", checkBlogOwner, async function(request, response) {
    let blogID = request.params.blogId;
    let blogDeletionResult = await BlogController.deleteBlog(blogID);
    if (blogDeletionResult) {
        return response.status(200).json({message : "blog successful deleted"});
    }
    return response.status(400).json({message : "blog not deleted"});
})


/**
Similar to deletion, editing a blog requires user authentication and ownership verification.
 The router collaborates with BlogController to perform the blog editing operation.
 */
router.put("/blog/:blogId", checkBlogOwner, async function(request, response) {
    let blogID = request.params.blogId;
    let updateData = request.body;
    let blogEditResult = await BlogController.editBlog(blogID, updateData);

    if (blogEditResult) {
        return response.status(200).json({message : "blog successful edited"});
    }
    return response.status(400).json({message : "blog not changed, try again"});
})


/**
Commenting is handled through two routes.
Adding a comment requires user authentication, and the router
collaborates with BlogController to add the comment.
Deleting a comment also demands user authentication and is facilitated by BlogController.
 */
router.post("/:blogId/comments", async function(request, response) {
    let targetBlogId = request.params.blogId;
    let comment = request.body.comment;
    let commentOwner = request.user;
    let isCommentAdded =  await BlogController.addCommentToBlog(targetBlogId, comment, commentOwner);
    if (isCommentAdded) {
        return response.status(200).json({message : "comment added"});
    }
    return response.status(500).json({message : "some error in server, comment not added"});
})


router.delete("/:blogId/comments", async function(request, response) {
    let commentId = request.body.commentId;
    let blogId = request.params.blogId;
    let isCommentDeleted = await BlogController.deleteCommentFromBlog(blogId, commentId, request.user);
    if (isCommentDeleted) {
        return response.status(200).json({message : "Comment successful removed"});
    }
    return response.status(200).json({message : "Comment not removed"});
    
})


/**
 * To gracefully handle unknown paths, the router defines
 * a catch-all middleware that responds with a 404 status and a friendly message.
 */
router.use(function(request, response) {
    response.status(404).json({message : "Wooops, the page not found"});
})