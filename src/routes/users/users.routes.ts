import express from "express";
import {deleteUser, getCurrentUser, getUser, getUsers, updateUser} from "../../controllers/users/user.controller";
import {authenticate} from "../../helpers/middlewares/authMiddleware";

const router = express.Router();

router.get("/", getUsers);
router.get("/me", authenticate, getCurrentUser);
router.get("/:id", getUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
