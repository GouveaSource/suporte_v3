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
import { EmpresaController } from "../controllers/EmpresaController";
import { CidadeController } from "../controllers/CidadeController";
import { PatioController } from "../controllers/PatioController";
import { ReboqueController } from "../controllers/ReboqueController";
import { GuincheiroController } from "../controllers/GuincheiroController";



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

//Rotas Empresas
router.post("/empresas", EmpresaController.createEmpresa);
router.get("/empresas", EmpresaController.listAllEmpresas); // Rota do Admin
router.get("/empresas/ativas", EmpresaController.listEmpresasAtivas); // Rota do Comum
router.patch("/empresas/:id", EmpresaController.updateEmpresa);
router.delete("/empresas/:id", EmpresaController.deleteEmpresa);

//Rotas Cidades
router.post("/cidades", CidadeController.createCidade);
router.get("/cidades", CidadeController.listAllCidades); // Admin
router.get("/cidades/ativas", CidadeController.listCidadesAtivas); // Comum
router.patch("/cidades/:id", CidadeController.updateCidade);
router.delete("/cidades/:id", CidadeController.deleteCidade);

//Rotas Patios
router.post("/patios", PatioController.createPatio);
router.get("/patios", PatioController.listAllPatios); // Admin
router.get("/patios/ativos", PatioController.listPatiosAtivos); // Comum (IMPORTANTE)
router.get("/patios/:id", PatioController.getPatioById); // Pega um Pátio (Admin)
router.patch("/patios/:id", PatioController.updatePatio);
router.delete("/patios/:id", PatioController.deletePatio);

//Rotas Reboques
router.post("/reboques", ReboqueController.createReboque);
router.get("/reboques", ReboqueController.listAllReboques); // Admin
router.get("/reboques/ativos", ReboqueController.listReboquesAtivos); // Comum
router.patch("/reboques/:id", ReboqueController.updateReboque);
router.delete("/reboques/:id", ReboqueController.deleteReboque);

//Rotas de Associar acessorio
router.patch("/reboques/:id/associar-acessorio", ReboqueController.associarAcessorio);
router.patch("/reboques/:id/desassociar-acessorio", ReboqueController.desassociarAcessorio);
router.patch("/reboques/:id/sincronizar-acessorios", ReboqueController.sincronizarAcessorios);

//Rotas Guincheiros
router.post("/guincheiros", GuincheiroController.createGuincheiro);
router.get("/guincheiros", GuincheiroController.listAllGuincheiros); // Admin
router.get("/guincheiros/ativos", GuincheiroController.listGuincheirosAtivos); // Comum
router.get("/guincheiros/:id", GuincheiroController.getGuincheiroById); // Admin (detalhes)
router.patch("/guincheiros/:id", GuincheiroController.updateGuincheiro);
router.delete("/guincheiros/:id", GuincheiroController.deleteGuincheiro);

router.patch("/guincheiros/:id/associar-reboque", GuincheiroController.associarReboque);
router.patch("/guincheiros/:id/desassociar-reboque", GuincheiroController.desassociarReboque);
router.patch("/guincheiros/:id/associar-patio", GuincheiroController.associarPatio);
router.patch("/guincheiros/:id/desassociar-patio", GuincheiroController.desassociarPatio);
router.patch("/guincheiros/:id/associar-orgao", GuincheiroController.associarOrgao);
router.patch("/guincheiros/:id/desassociar-orgao", GuincheiroController.desassociarOrgao);
router.patch("/guincheiros/:id/sincronizar-cidades", GuincheiroController.sincronizarCidades);
export default router;