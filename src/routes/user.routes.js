import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router=Router();
// router.post("/register",registerUser)
//singlee for one file
//array for multiple files in one fields
//here i used fields
router.route("/register").post(
    upload.fields([
        {name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
) //hc sir
router.route("/login").post(loginUser) //hc sir

//secured routes
router.post("/logout",verifyJWT,logoutUser); //heheh

export default router