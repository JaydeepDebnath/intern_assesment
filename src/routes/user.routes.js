import { Router } from "express";
import {
    listAllUsers,
    getUserDetalis,
    registerUser,
    updateUserDetails,
    softDeleteUser,
} from '../controller/user.controller.js'
import { verifyJWT } from '../middlewares/auth.middlewares.js'

const router = Router()

router.post("/register",registerUser);
router.get("/:userId", getUserDetalis, verifyJWT);
router.put("/update", updateUserDetails, verifyJWT);
router.patch("/update/details", updateUserDetails, verifyJWT); 
router.get("/list-users", listAllUsers);
router.delete("/delete-user/:userId", softDeleteUser, verifyJWT)


export default router