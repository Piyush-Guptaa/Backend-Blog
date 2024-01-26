# Backend Server for Blogs

## Authentication

1. **Registration**: To register in the system, send a POST request to `http://localhost:9191/auth/registration`. The request body must contain an object of the `{fullname, email, password, confirmPassword}` type.

2. **Login**: To log in to the system, send a POST request to `http://localhost:9191/auth/login`. The request body must contain an object of the `{email, password}` type.

3. **Logout**: To log out, send a DELETE request to `http://localhost:9191/auth/logout`.

## Account Management

1. **Get User Info**: To see the user's account, make a GET request to `http://localhost:9191/auth/account`. The user object will be returned.

2. **Update User Info**: To change the account data, send a PUT request to `http://localhost:9191/auth/account`. The request body must contain an object with the data that needs to be changed. Example: `{fullname: "Changed fullname"}`.

3. **Delete User Account**: To delete your account, send a DELETE request to `http://localhost:9191/auth/account`. The request body must contain an object containing the password of this user (`{password: UserPassword}`). This confirms the user's deletion.

## Blog Management

1. **See All Blogs**: To see all the blogs, make a GET request to the main path `http://localhost:9191/` or `http://localhost:9191/blogs`. An array of blogs will be returned.

2. **Create Blog**: To create a new blog, make a POST request to `http://localhost:9191/blogs/create_blog`. In the request body, pass an object with blog data. Example: `{title, mainContent}`.

3. **Delete Blog**: To delete a specific blog, give the ID of the specific blog to be deleted in the query string. Example: DELETE request to `http://localhost:9191/blogs/blog/:blogId`.

4. **Edit Blog**: To make changes to an existing blog, make a PUT request to `http://localhost:9191/blogs/blog/:blogId`. In the query string, give the ID of a specific blog. In the request body, pass an object that contains the data to be changed. Example: `{title: "NewTitle"}`.

5. **Add Comment**: To add a comment to a specific blog, make a POST request to `http://localhost:9191/blogs/:blogId/comments`. Specify the ID of a specific blog in the query string, and specify the comment object in the request body. Example: `{comment: "SomeComment"}`.

6. **Delete Comment**: To delete a specific comment on a specific blog, make a DELETE request to `http://localhost:9191/blogs/:blogId/comments`. In the query string, give the ID of a specific blog. Pass an object with a comment ID property that identifies a specific comment in the request body. Example: `{commentId: "SomeCommentId"}`.

# Basic Blog Platform

This is a basic blog platform built with Node.js. It allows users to register, login, create, edit, and delete blogs, as well as add and delete comments on blogs.

## How to Use the App

- Open the Terminal and write `npm run start`

**Note: Replace "http://localhost:9191/" with your own URL.**

### Environment Settings

- MongoDB Guide: In the `.env` file, write the URL of your MongoDB local server. Example: `MongoURI="mongodb://localhost:27017/DB_NAME"`
- Database: Your database should have the following collections: "blogs", "users"
- Port: In the `.env` file, write the port that the server will listen to. Example: `PORT=9191`
- JWT Secret: In the `.env` file, write the secret key for signing the JWT token. Example: `JWT_SECRET="SECRET_KEY"`
