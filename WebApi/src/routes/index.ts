import { Router } from "express";
import { ExampleController } from "../controllers/ExampleController";
import { UserController } from "../controllers/userController";


const router = Router();

router.get("/health", ExampleController.health);

//Rotas USUARIOS
router.post("/users", UserController.createUser);
router.get("/users", UserController.listUsers);
router.get("/users/:id", UserController.getUserById);
router.patch("/users/:id", UserController.updateUser);
router.delete("/users/:id", UserController.deleteUser);


export default router;