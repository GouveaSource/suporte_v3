# Projeto Suporte (Em Desenvolvimento)

Monorepo com o backend de um sistema de suporte interno.

-   **WebApp:** (Frontend) React + Vite + TS + MUI (Ainda não iniciado)
-   **WebApi:** (Backend) Node.js + Express + TS + Prisma
-   **Banco de Dados:** PostgreSQL (Rodando via Docker)

---

## 🚀 WebApi (Backend)

Servidor da API REST construído com Node.js.

### Stack de Tecnologia (Backend)

-   **Runtime:** Node.js
-   **Framework:** Express
-   **Linguagem:** TypeScript
-   **ORM:** Prisma (conectado ao PostgreSQL)
-   **Banco de Dados:** PostgreSQL
-   **Autenticação:** JWT (Access/Refresh Tokens), Bcrypt (Hash), Blacklist (via Prisma)

### 1. Pré-requisitos (Backend)

-   Node.js (v18 ou superior)
-   Docker e Docker Compose (para rodar o PostgreSQL)
-   Um cliente de API (Postman, Insomnia) para testes

### 2. Configuração do Ambiente

1.  **Navegue até a API:**
    ```bash
    cd WebApi
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Inicie o contêiner do Docker:**
    (Certifique-se de ter um `docker-compose.yml` para o PostgreSQL. Se não tiver, avise-me e criamos um!)
    ```bash
    docker-compose up -d
    ```

4.  **Crie o arquivo de ambiente:**
    Crie um arquivo chamado `.env` dentro da pasta `WebApi` e adicione as variáveis:
    ```env
    # Conexão do Banco (ajuste se necessário)
    DATABASE_URL="postgresql://admin:admin123@localhost:5432/suporte_db?schema=suporte"

    # Segredos JWT (use valores fortes em produção)
    JWT_ACCESS_SECRET="SEU_SEGREDO_SUPER_SECRETO_PARA_ACCESS_TOKEN"
    JWT_REFRESH_SECRET="SEU_SEGREDO_DIFERENTE_PARA_REFRESH_TOKEN"

    # Tempos de Expiração
    JWT_ACCESS_EXPIRES_IN="5m"
    JWT_REFRESH_EXPIRES_IN="7d"
    ```

5.  **Rode as Migrações do Banco:**
    Este comando aplica o schema (tabelas `users` e `revoked_tokens`) ao banco de dados:
    ```bash
    npx prisma migrate dev
    ```

### 3. Rodando a Aplicação

Para iniciar o servidor em modo de desenvolvimento (com auto-reload):

```bash
npm run dev