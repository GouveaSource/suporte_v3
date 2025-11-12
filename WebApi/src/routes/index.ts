import { Router } from "express";
import { ExampleController } from "../controllers/ExampleController";
import { AuthController } from "../controllers/AuthController";
import { UserController } from "../controllers/UserController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { Role } from "@prisma/client";
import { checkRole } from "../middlewares/roleMiddleware";
import { AcessorioController } from "../controllers/AcessoriosController";
import { OrgaoController } from "../controllers/OrgaosController";
import { SetorController } from "../controllers/SetorController";



const router = Router();

//Rotas públicas
router.get("/health", ExampleController.health);
router.post("/login", AuthController.login);
router.post("/refresh", AuthController.refreshToken);
router.post("/logout", AuthController.logout);


router.post("/users", UserController.createUser);


//Rotas Protegidas
// USUARIOS
router.get("/users", authMiddleware, UserController.listUsers);
router.get("/users/:id", authMiddleware, UserController.getUserById);
router.patch("/users/:id", authMiddleware, UserController.updateUser);


router.delete("/users/:id", authMiddleware, checkRole([Role.ADMIN, Role.ADMMaster]), UserController.deleteUser
);

//Rotas Acessorios
router.post("/acessorios", AcessorioController.createAcessorio);
router.get("/acessorios", AcessorioController.listAllAcessorios);
router.get("/acessorios/ativos", AcessorioController.listAcessoriosAtivos);
router.patch("/acessorios/:id", AcessorioController.updateAcessorio);
router.delete("/acessorios/:id", AcessorioController.deleteAcessorio);

//Rotas Orgãos
router.post("/orgaos", OrgaoController.createOrgao);
router.get("/orgaos", OrgaoController.listAllOrgaos); // Rota do Admin
router.get("/orgaos/ativos", OrgaoController.listOrgaosAtivos); // Rota do Comum
router.patch("/orgaos/:id", OrgaoController.updateOrgao);
router.delete("/orgaos/:id", OrgaoController.deleteOrgao);

//Rotas Setor
router.post("/setores", SetorController.createSetor);
router.get("/setores", SetorController.listAllSetores); // Rota do Admin
router.get("/setores/ativos", SetorController.listSetoresAtivos); // Rota do Comum
router.patch("/setores/:id", SetorController.updateSetor);
router.delete("/setores/:id", SetorController.deleteSetor);

export default router;