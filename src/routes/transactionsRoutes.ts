import { FastifyInstance } from "fastify";
import { knex } from "../database/database";
import { randomUUID } from "node:crypto";
import { z } from "zod";
export async function transactionsRoutes(app: FastifyInstance) {
  // GET Lista de Transações
  app.get("/", async () => {
    const transactions = await knex("transactions").select();

    return {
      transactions,
    };
  });

  // GET Lista de Transações
  app.get("/:id", async (req) => {
   
    const getTransactionParamsSchema = z.object({
        id : z.string().uuid(),
    })
    const {id} = getTransactionParamsSchema.parse(req.params)

    const transaction = await knex("transactions").where("id",id).first();
    console.log(transaction)
    return {
        transaction,
    };
  });

  // POST - Criação de transação

  app.post("/", async (req, reply) => {
    // Objeto esperado
    const createTransactionsBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(["credit", "debit"]),
    });

    const { title, amount, type } = createTransactionsBodySchema.parse(
      req.body
    );
    // Inserção no banco
    await knex("transactions").insert({
      id: randomUUID(),
      title,
      amount: type === "credit" ? amount : amount * -1,
    });

    return reply.code(201).send();
  });
}
