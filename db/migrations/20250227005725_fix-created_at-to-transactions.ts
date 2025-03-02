import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
        await knex.schema.createTable('transactions',(table) =>{
        table.uuid('id').primary() // Chave primaria
        table.text('title').notNullable() // Titulo que não pode ser nulo
        table.decimal('amount',10,2).notNullable()
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
    })
}


export async function down(knex: Knex): Promise<void> {
      await knex.schema.dropTable('transactions')
}

