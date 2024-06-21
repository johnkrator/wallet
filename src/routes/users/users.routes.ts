import express from "express";
import {deleteUser, getCurrentUser, getUser, getUsers, updateUser} from "../../controllers/users/user.controller";
import {authenticate} from "../../helpers/middlewares/authMiddleware";

const router = express.Router();

router.route("/")
    .get(getUsers);

router.route("/me")
    .get(authenticate, getCurrentUser);

router.route("/:id")
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser);

export default router;
