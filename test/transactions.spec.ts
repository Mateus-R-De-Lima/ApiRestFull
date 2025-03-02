import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { execSync } from "node:child_process";
import { app } from "../src/app";
import { afterEach } from "node:test";

describe("Transactions routes", () => {
  beforeAll(() => {
    // Antes de tudo espero iniciar aplicação
    app.ready();
  });

  afterAll(() => {
    // Depois de tudo eu fecho a aplicação.
    app.close();
  });

  beforeEach(() => {
    execSync("npm run knex migrate:latest");
  });

  afterEach(() => {
    execSync("npm run knex migrate:rollback --all");
  });

  it("should be able to create a new transaction", async () => {
    // execução do testes
    await request(app.server) // server
      .post("/transactions") // Verbo + rota
      .send({
        // Objeto de envio da requisição
        title: "New Transaction Test",
        amount: 5000,
        type: "credit",
      })
      .expect(201); // Espero que o retorno seja 201
  });

  it("should be able to list all transactions", async () => {
    // Crio uma transação
    const createTransactionResponse = await request(app.server)
      .post("/transactions")
      .send({
        // Objeto de envio da requisição
        title: "New Transaction Test list",
        amount: 5000,
        type: "credit",
      });

    // Armazeno o cookie com forme a regra de negocio
    const cookies = createTransactionResponse.get("Set-Cookie");
    // Asserção de tipo para garantir que cookies será tratado como string[]
    const cookieToSet = (cookies as string[]) || [];
    // Realizo a requisição de listar
    const listTransactionsReponse = await request(app.server)
      .get("/transactions")
      .set("Cookie", cookieToSet)
      .expect(200);

    expect(listTransactionsReponse.body.transactions).toEqual([
      expect.objectContaining({
        // Objeto de envio da requisição
        title: "New Transaction Test list",
        amount: 5000,
      }),
    ]);
  });

  it("should be able to get a specific transaction", async () => {
    // Crio uma transação
    const createTransactionResponse = await request(app.server)
      .post("/transactions")
      .send({
        // Objeto de envio da requisição
        title: "New Transaction Test list",
        amount: 5000,
        type: "credit",
      });

    // Armazeno o cookie com forme a regra de negocio
    const cookies = createTransactionResponse.get("Set-Cookie");
    // Asserção de tipo para garantir que cookies será tratado como string[]
    const cookieToSet = (cookies as string[]) || [];
    // Realizo a requisição de listar
    const listTransactionsReponse = await request(app.server)
      .get("/transactions")
      .set("Cookie", cookieToSet)
      .expect(200);

    const transactionId = listTransactionsReponse.body.transactions[0].id;

    const getTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set("Cookie", cookieToSet)
      .expect(200);

    expect(getTransactionResponse.body.transaction).toEqual(
      expect.objectContaining({
        // Objeto de envio da requisição
        title: "New Transaction Test list",
        amount: 5000,
      })
    );
  });

  it("should be able to get the summary", async () => {
    // Crio uma transação
    const createTransactionResponse = await request(app.server)
      .post("/transactions")
      .send({
        // Objeto de envio da requisição
        title: "Credit Transaction",
        amount: 5000,
        type: "credit",
      });

    // Armazeno o cookie com forme a regra de negocio
    const cookies = createTransactionResponse.get("Set-Cookie");
    // Asserção de tipo para garantir que cookies será tratado como string[]
    const cookieToSet = (cookies as string[]) || [];

    await request(app.server)
      .post("/transactions")
      .set('Cookie',cookieToSet)
      .send({
        // Objeto de envio da requisição
        title: "Debit transaction",
        amount: 2000,
        type: "debit",
      });

    // Realizo a requisição de listar
    const summaryResponse = await request(app.server)
      .get("/transactions/summary")
      .set("Cookie", cookieToSet)
      .expect(200);

    expect(summaryResponse.body.summary).toEqual(
      expect.objectContaining({
       amount:3000,
      }),
    );
  });
});
