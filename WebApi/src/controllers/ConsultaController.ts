import { Request, Response } from "express";
import axios from "axios"; // 1. Importar o Axios
import { z } from "zod";

// 2. Usar o Zod para validar o parâmetro da URL (o CNPJ)
const cnpjSchema = z.string().length(14, {
  message: "O CNPJ deve ter 14 dígitos (sem máscara)",
});

export class ConsultaController {

  /**
   * Rota para consultar um CNPJ numa API Externa
   */
  static async consultarCnpj(req: Request, res: Response) {
    try {
      // 3. Validar o CNPJ que vem da URL (ex: /api/consulta/cnpj/123)
      const cnpj = cnpjSchema.parse(req.params.cnpj);

      // 4. Usar o Axios para chamar a API pública (BrasilAPI)
      // Esta API é gratuita e não requer chave
      const url = `https://brasilapi.com.br/api/cnpj/v1/${cnpj}`;
      
      const response = await axios.get(url);

      // 5. Se der sucesso (Status 200), retornar os dados
      // O frontend vai querer 'razao_social', 'nome_fantasia', etc.
      return res.status(200).json(response.data);

    } catch (error) {
      // 6. Tratamento de Erro (Zod, Axios ou outros)
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Erro de validação", errors: error.issues 
        });
      }

      // 7. Tratamento de Erro específico do Axios
      if (axios.isAxiosError(error)) {
        // Se a API externa nos deu um erro (ex: 404 - CNPJ não encontrado)
        if (error.response) {
          return res.status(error.response.status).json({
            message: "Erro ao consultar CNPJ na API externa",
            errors: error.response.data,
          });
        } else {
          // Se a API externa estiver fora do ar
          return res.status(503).json({ message: "Serviço externo indisponível" });
        }
      }

      // Erro genérico
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }
}