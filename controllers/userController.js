import { db } from "../server.js";
import { User } from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb";

export class UserController {


    /*
    This method handles the registration of a new user.
    It takes user information, hashes the password using bcrypt, creates a new User object,
    inserts it into the "users" collection in the database, and returns the inserted ID.
    */
    static async userRegistration(userInfo) {
        let userCollection = db.collection("users");
        let hasedPassword = await bcrypt.hash(userInfo.password, 8);
        let user = new User(userInfo.fullname, userInfo.email, hasedPassword);
        let insertionResult = await userCollection.insertOne(user);
        return insertionResult.insertedId;
    }


    /**
     * This method is responsible for creating an access
     *  token for a given user. It takes a user object, extracts the user's ID,
     *  and uses jsonwebtoken to sign a token with the specified payload and expiration time.
     */
    static async generateAccessToken(user) {
        const payload = {id : user._id};
        return jwt.sign(payload, process.env.JWT_SECRET, 
            { expiresIn: 253402300000000});
    };


    /**
     * This method retrieves all users from the "users" collection in the database.
     * It uses the find method to get all documents and converts them to an array,
     * returning the array of users or null if no users are found.
     */
    static async getAllUsers() {
        let userController = db.collection("users");
        let users = await userController.find().toArray();
        return users || null;
    }


    /**
     * The fourth method, userInfoById, retrieves user information
     * based on the provided user ID. It uses the findOne method to find a user with the specified ID
     * and returns the user information or null if no user is found.
     */
    static async userInfoById(id) {
        let userCollection = db.collection("users");
        let candidate = await userCollection.findOne({"_id" : new ObjectId(id)});
        return candidate || null;
    }



    /**
     * Updates user information, including password if provided.
    If the updateData includes a password, it hashes the new password using bcrypt.
    Then, it updates the user's information in the database and updates the
    corresponding fields in the user session object.
     */
    static async updateUserInfo(user, updateData) {
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }
        let usersCollection = db.collection("users");
        let updatingResult = await usersCollection.updateOne({"email" : user.email}, {$set: updateData});
        return updatingResult.modifiedCount;
    }



    /**
     * Deletes a user's account after confirming the password.
    Compares the provided password with the hashed password in the database.
    If they match, it deletes the user's account from the database and destroys the user's session.
     */
    static async deleteUserAccount(user, password) {
        let usersCollection = db.collection("users");
        let candidate = await usersCollection.findOne({"email": user.email});
    
        if (! await bcrypt.compare(password, candidate.password)) {
            return false; 
        }

        let deletionResult = await usersCollection.deleteOne({"email": user.email});
        return deletionResult.deletedCount;
    }
}