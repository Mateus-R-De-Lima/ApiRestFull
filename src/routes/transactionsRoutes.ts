import { FastifyInstance } from "fastify";
import { knex } from "../database/database";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { CheckSessionIdExist } from "../middleware/check-session-id-exist";
export async function transactionsRoutes(app: FastifyInstance) {
  // GET Lista de Transações
  app.get(
    "/",
    {
      preHandler: [CheckSessionIdExist],
    },
    async (req) => {
      const { sessionId } = req.cookies;

      const transactions = await knex("transactions")
        .where("session_id", sessionId)
        .select();

      return {
        transactions,
      };
    }
  );

  // GET Lista de Transações
  app.get(
    "/:id",
    {
      preHandler: [CheckSessionIdExist],
    },
    async (req) => {
      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      });
      const { id } = getTransactionParamsSchema.parse(req.params);
      const { sessionId } = req.cookies;
      const transaction = await knex("transactions")
        .where({
          id,
          session_id: sessionId,
        })
        .first();
      console.log(transaction);
      return {
        transaction,
      };
    }
  );
  // GET Lista de Transações
  app.get(
    "/summary",
    {
      preHandler: [CheckSessionIdExist],
    },
    async (req) => {
      const { sessionId } = req.cookies;
      const summary = await knex("transactions")
        .where("session_id", sessionId)
        .sum("amount", { as: "amount" })
        .first();
      return {
        summary,
      };
    }
  );

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

    let sessionId = req.cookies.sessionId;
    if (!sessionId) {
      sessionId = randomUUID();
      reply.cookie("sessionId", sessionId, {
        path: "/",
        maxAge: 60 * 60 * 27 * 7, // 7 days
      });
    }

    // Inserção no banco
    await knex("transactions").insert({
      id: randomUUID(),
      title,
      amount: type === "credit" ? amount : amount * -1,
      session_id: sessionId,
    });

    return reply.code(201).send();
  });
}
