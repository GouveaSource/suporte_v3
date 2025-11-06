import { Router } from "express";
import { ExampleController } from "../controllers/ExampleController";
import { AuthController } from "../controllers/AuthController";
import { UserController } from "../controllers/UserController";



const router = Router();

router.get("/health", ExampleController.health);

//Rotas de Auth
router.post("/login", AuthController.login);
router.post("/refresh", AuthController.refreshToken);
router.post("/logout", AuthController.logout);



//Rotas USUARIOS
router.post("/users", UserController.createUser);
router.get("/users", UserController.listUsers);
router.get("/users/:id", UserController.getUserById);
router.patch("/users/:id", UserController.updateUser);
router.delete("/users/:id", UserController.deleteUser);


export default router;