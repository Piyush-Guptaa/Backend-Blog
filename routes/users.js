import { Router } from "express";
import { UserController } from "../controllers/userController.js";
import { isValidRegistration, checkUserAuth, isValidLogin } from "../middlewares/authMiddleware.js";
import { db } from "../server.js";

const router = new Router();
export default router;



/**
 * The isValidRegistration middleware ensures
 *  that the registration data is valid. The router checks
 *  if the user is already logged in and, if not, proceeds to register the user via UserController.
 *  Success and failure responses are provided accordingly.
 */
router.post("/registration", isValidRegistration, async function(request, response) {
    const checkToken = request.cookies.token;
    if (checkToken) {
        return response.status(403).json({ message: "You are already logged in. Logout" });
    }

    try {
        const isSuccessfulRegistration = await UserController.userRegistration(request.body);
        return response.status(200).json({ message: "Successful registration" });
    } catch (error) {
        return response.status(401).json({ message: "Registration failed" });
    }
});




/*
The route handles user login. Similar to registration,
the isValidLogin middleware checks the validity
of login data. The router checks if the user is already
logged in, searches for the user in the database, generates an access token, and sets it in cookies.
The response varies based on the success or failure of the login process.
*/
router.post("/login", isValidLogin, async function(request, response) {
    let checkToken = request.cookies.token;
    if (checkToken) {
        return response.status(403).json({message : "you are already logged in. Logout"})
    }

    let userCollection = db.collection("users");
    let user = await userCollection.findOne({email : request.body.email});
    let token = await UserController.generateAccessToken(user);
    if (token) {
        response.cookie("token", token, {
            expires: new Date(253402300000000),
            httpOnly: true,
        });
        return response.status(200).json({message : "Successful authorization"})
    }
    return response.status(401).json({message : "authorization failed"});
    
})


/**
 * This middleware ensures that subsequent routes are only accessible to authenticated users.
 *  It sets the tone for secure interactions by validating user authenticity.
 */
router.use(checkUserAuth);


/**
 * the route handles user logout. It clears the token from cookies,
 * sets the user to null, and responds with a message confirming the user's logout.
 */
router.delete("/logout", async function(request, response) {
    response.clearCookie("token");
    request.user == null;
    return response.status(200).json({message : "the user logged out"})
})


/**
 * the route handles allow users to retrieve their account information.
 *  It responds with the user's information in a JSON format.
 */
router.get("/account", function(request, response) {
    return response.status(200).json({ user: request.user });
});



/**
 * the route for updating user account information.
 *  It copies the updated data from the request, calls UserController to perform the update,
 *  and responds accordingly based on the success or failure of the update operation.
 */
router.put("/account", async function(request, response) {
    let updatedData = {...request.body};
    let isSuccesfulUpdating = await UserController.updateUserInfo(request.user, updatedData);
    if (isSuccesfulUpdating) {
        return response.status(200).json({message : "The user info successful updateded"});
    }
    return response.status(400).json({message: "Woops, the info not updated"});

})


/**
 * the route for deleting a user account.
 *  It verifies the deletion with the entered password, calls UserController to delete the account,
 *  and responds based on the success or failure of the deletion process.
 */
router.delete("/account", async function(request, response) {
    let deletionConfirmPassword = request.body.password;
    let isOkDeletion = await UserController.deleteUserAccount(request.user, deletionConfirmPassword);
    if (isOkDeletion) {
        request.user = null;
        response.clearCookie("token");
        return response.status(200).json({message : "the account deleted"});
    }
    return response.status(400).json({message : "Sorry, operation failed. Try again"});
})


/**
 * The final scene acts as a safety net, responding with
 *  a 404 status and a message for any requests that don't match the defined routes.
 */
router.use(function(request, response) {
    response.status(404).json({message : "Wooops, the page not found"});
})