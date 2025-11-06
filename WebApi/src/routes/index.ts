import { Router } from "express";
import { ExampleController } from "../controllers/ExampleController";
import { AuthController } from "../controllers/AuthController";
import { UserController } from "../controllers/UserController";
import { authMiddleware } from "../middlewares/authMiddlewares";



const router = Router();

//Rotas públicas
router.get("/health", ExampleController.health);
router.post("/login", AuthController.login);
router.post("/refresh", AuthController.refreshToken);
router.post("/logout", AuthController.logout);


//Rotas Protegidas
// USUARIOS
router.post("/users", authMiddleware, UserController.createUser);
router.get("/users", authMiddleware, UserController.listUsers);
router.get("/users/:id", authMiddleware, UserController.getUserById);
router.patch("/users/:id", authMiddleware, UserController.updateUser);
router.delete("/users/:id", authMiddleware, UserController.deleteUser);


export default router;