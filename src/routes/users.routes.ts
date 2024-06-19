import express from "express";
import {deleteUser, getCurrentUser, getUser, getUsers, updateUser} from "../controllers/user/user.controller";

const router = express.Router();

router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.get("/:id", getUser);
router.get("/", getUsers);
router.get("/current-user", getCurrentUser);

export default router;
