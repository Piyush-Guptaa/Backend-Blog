"use strict";
import { UserController } from "../controllers/userController.js";
import { db } from "../server.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const MIN_FULLNAME_LENGTH = 5;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 20;

const emailRegEx = /^((([0-9A-Za-z]{1}[-0-9A-z\.]{1,}[0-9A-Za-z]{1})|([0-9А-Яа-я]{1}[-0-9А-я\.]{1,}[0-9А-Яа-я]{1}))@([-A-Za-z]{1,}\.){1,2}[-A-Za-z]{2,})$/;

export async function isValidRegistration(request, response, next) {
    const { fullname, email, password, confirmPassword } = request.body;

    const usersCollection = db.collection("users");
    const existingUser = await usersCollection.findOne({ "email": email });

    if (existingUser) {
        return response.status(403).json({ message: "A user with this email already exists" });
    }

    if (fullname.split(" ").length !== 2 || fullname.length < MIN_FULLNAME_LENGTH) {
        return response.status(400).json({ message: "Invalid fullname" });
    }

    if (!emailRegEx.test(email)) {
        return response.status(400).json({ message: "Invalid email" });
    }

    if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
        return response.status(400).json({ message: "Invalid password length" });
    }

    if (password !== confirmPassword) {
        return response.status(400).json({ message: "Passwords do not match" });
    }

    next();
}

export async function isValidLogin(request, response, next) {
    const { email, password } = request.body;

    const userCollection = db.collection("users");
    const user = await userCollection.findOne({ "email": email });

    if (!user) {
        return response.status(404).json({ message: "User not found" });
    }

    const passwordCompareResult = await bcrypt.compare(password, user.password);

    if (!passwordCompareResult) {
        return response.status(404).json({ message: "Invalid password" });
    }

    next();
}

export async function checkUserAuth(request, response, next) {
    const token = request.cookies.token;

    if (!token) {
        return response.status(401).json({ error: 'Access denied' });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await UserController.userInfoById(decodedToken.id);
        delete user.password;
        request.user = user;
        next();
    } catch (error) {
        response.status(401).json({ error: 'Invalid token' });
    }
}
