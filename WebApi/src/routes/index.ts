import { Router } from "express";
import { Role } from "@prisma/client";

// --- Middlewares ---
import { authMiddleware } from "../middlewares/authMiddleware";
import { checkRole } from "../middlewares/roleMiddleware";

// --- Controllers ---
import { ExampleController } from "../controllers/ExampleController";
import { AuthController } from "../controllers/AuthController";
import { UserController } from "../controllers/UserController";
import { AcessorioController } from "../controllers/AcessorioController";
import { OrgaoController } from "../controllers/OrgaoController";
import { SetorController } from "../controllers/SetorController";
import { EmpresaController } from "../controllers/EmpresaController";
import { CidadeController } from "../controllers/CidadeController";
import { PatioController } from "../controllers/PatioController";
import { ReboqueController } from "../controllers/ReboqueController";
import { GuincheiroController } from "../controllers/GuincheiroController";
import { AcionamentoController } from "../controllers/AcionamentoController";
import { ConsultaController } from "../controllers/ConsultaController";

const router = Router();

// --- Constantes de Roles (para limpeza) ---
const adminRoles = [Role.ADMIN, Role.ADMMaster];
const masterRole = [Role.ADMMaster];

// ====================================================================
// --- GRUPO 1: Rotas PÚBLICAS (Sem autenticação) ---
// ====================================================================

router.get("/health", ExampleController.health);
// Autenticação
router.post("/login", AuthController.login);
router.post("/refresh", AuthController.refreshToken);
router.post("/logout", AuthController.logout);
// Registo (vamos manter público por agora)
router.post("/users", UserController.createUser);

// ====================================================================
// --- GRUPO 2: Rotas de UTILIZADOR COMUM (Requer login) ---
// ====================================================================

// A Rota de Busca principal (só precisa de estar logado)
router.get("/acionamento/buscar", authMiddleware, AcionamentoController.buscarGuincheiros);

// Listagens de dados ATIVOS (para preencher ecrãs de consulta)
router.get("/setores/ativos", authMiddleware, SetorController.listSetoresAtivos);
router.get("/acessorios/ativos", authMiddleware, AcessorioController.listAcessoriosAtivos);
router.get("/orgaos/ativos", authMiddleware, OrgaoController.listOrgaosAtivos);
router.get("/empresas/ativas", authMiddleware, EmpresaController.listEmpresasAtivas);
router.get("/cidades/ativas", authMiddleware, CidadeController.listCidadesAtivas);
router.get("/patios/ativos", authMiddleware, PatioController.listPatiosAtivos);
router.get("/reboques/ativos", authMiddleware, ReboqueController.listReboquesAtivos);
router.get("/guincheiros/ativos", authMiddleware, GuincheiroController.listGuincheirosAtivos);

// ====================================================================
// --- GRUPO 3: Rotas de ADMIN (Criar, Editar, Ver Tudo) ---
// ====================================================================

router.get("/consulta/cnpj/:cnpj", authMiddleware, checkRole(adminRoles), ConsultaController.consultarCnpj);

// --- Utilizadores (Gestão) ---
router.get("/users", authMiddleware, checkRole(adminRoles), UserController.listUsers);
router.get("/users/:id", authMiddleware, checkRole(adminRoles), UserController.getUserById);
router.patch("/users/:id", authMiddleware, checkRole(adminRoles), UserController.updateUser);

// --- Acessórios (Gestão) ---
router.post("/acessorios", authMiddleware, checkRole(adminRoles), AcessorioController.createAcessorio);
router.get("/acessorios", authMiddleware, checkRole(adminRoles), AcessorioController.listAllAcessorios);
router.patch("/acessorios/:id", authMiddleware, checkRole(adminRoles), AcessorioController.updateAcessorio);

// --- Órgãos (Gestão) ---
router.post("/orgaos", authMiddleware, checkRole(adminRoles), OrgaoController.createOrgao);
router.get("/orgaos", authMiddleware, checkRole(adminRoles), OrgaoController.listAllOrgaos);
router.patch("/orgaos/:id", authMiddleware, checkRole(adminRoles), OrgaoController.updateOrgao);

// --- Setores (Gestão) ---
router.post("/setores", authMiddleware, checkRole(adminRoles), SetorController.createSetor);
router.get("/setores", authMiddleware, checkRole(adminRoles), SetorController.listAllSetores);
router.patch("/setores/:id", authMiddleware, checkRole(adminRoles), SetorController.updateSetor);

// --- Empresas (Gestão) ---
router.post("/empresas", authMiddleware, checkRole(adminRoles), EmpresaController.createEmpresa);
router.get("/empresas", authMiddleware, checkRole(adminRoles), EmpresaController.listAllEmpresas);
router.patch("/empresas/:id", authMiddleware, checkRole(adminRoles), EmpresaController.updateEmpresa);

// --- Cidades (Gestão) ---
router.post("/cidades", authMiddleware, checkRole(adminRoles), CidadeController.createCidade);
router.get("/cidades", authMiddleware, checkRole(adminRoles), CidadeController.listAllCidades);
router.patch("/cidades/:id", authMiddleware, checkRole(adminRoles), CidadeController.updateCidade);

// --- Pátios (Gestão) ---
router.post("/patios", authMiddleware, checkRole(adminRoles), PatioController.createPatio);
router.get("/patios", authMiddleware, checkRole(adminRoles), PatioController.listAllPatios);
router.get("/patios/:id", authMiddleware, checkRole(adminRoles), PatioController.getPatioById);
router.patch("/patios/:id", authMiddleware, checkRole(adminRoles), PatioController.updatePatio);

// --- Reboques (Gestão) ---
router.post("/reboques", authMiddleware, checkRole(adminRoles), ReboqueController.createReboque);
router.get("/reboques", authMiddleware, checkRole(adminRoles), ReboqueController.listAllReboques);
router.patch("/reboques/:id", authMiddleware, checkRole(adminRoles), ReboqueController.updateReboque);
router.patch("/reboques/:id/sincronizar-acessorios", authMiddleware, checkRole(adminRoles), ReboqueController.sincronizarAcessorios);

// --- Guincheiros (Gestão) ---
router.post("/guincheiros", authMiddleware, checkRole(adminRoles), GuincheiroController.createGuincheiro);
router.get("/guincheiros", authMiddleware, checkRole(adminRoles), GuincheiroController.listAllGuincheiros);
router.get("/guincheiros/:id", authMiddleware, checkRole(adminRoles), GuincheiroController.getGuincheiroById);
router.patch("/guincheiros/:id", authMiddleware, checkRole(adminRoles), GuincheiroController.updateGuincheiro);
// Associações
router.patch("/guincheiros/:id/associar-reboque", authMiddleware, checkRole(adminRoles), GuincheiroController.associarReboque);
router.patch("/guincheiros/:id/desassociar-reboque", authMiddleware, checkRole(adminRoles), GuincheiroController.desassociarReboque);
router.patch("/guincheiros/:id/associar-patio", authMiddleware, checkRole(adminRoles), GuincheiroController.associarPatio);
router.patch("/guincheiros/:id/desassociar-patio", authMiddleware, checkRole(adminRoles), GuincheiroController.desassociarPatio);
router.patch("/guincheiros/:id/associar-orgao", authMiddleware, checkRole(adminRoles), GuincheiroController.associarOrgao);
router.patch("/guincheiros/:id/desassociar-orgao", authMiddleware, checkRole(adminRoles), GuincheiroController.desassociarOrgao);
router.patch("/guincheiros/:id/sincronizar-cidades", authMiddleware, checkRole(adminRoles), GuincheiroController.sincronizarCidades);


// ====================================================================
// --- GRUPO 4: Rotas de ADMIN MASTER (Destruição) ---
// ====================================================================
router.delete("/users/:id", authMiddleware, checkRole(masterRole), UserController.deleteUser);
router.delete("/acessorios/:id", authMiddleware, checkRole(masterRole), AcessorioController.deleteAcessorio);
router.delete("/orgaos/:id", authMiddleware, checkRole(masterRole), OrgaoController.deleteOrgao);
router.delete("/setores/:id", authMiddleware, checkRole(masterRole), SetorController.deleteSetor);
router.delete("/empresas/:id", authMiddleware, checkRole(masterRole), EmpresaController.deleteEmpresa);
router.delete("/cidades/:id", authMiddleware, checkRole(masterRole), CidadeController.deleteCidade);
router.delete("/patios/:id", authMiddleware, checkRole(masterRole), PatioController.deletePatio);
router.delete("/reboques/:id", authMiddleware, checkRole(masterRole), ReboqueController.deleteReboque);
router.delete("/guincheiros/:id", authMiddleware, checkRole(masterRole), GuincheiroController.deleteGuincheiro);


export default router;