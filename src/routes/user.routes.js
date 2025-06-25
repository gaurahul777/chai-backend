import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router=Router();
// router.post("/register",registerUser)
router.route("/register").post(registerUser) //hc sir
router.route("/login").post(registerUser) //hc sir

export default router