import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateWaitlistEntity1704081600004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create WaitlistStatus enum type
    await queryRunner.query(`
      CREATE TYPE "public"."waitlist_status_enum" AS ENUM (
        'WAITING',
        'OFFERED',
        'CONFIRMED',
        'CANCELLED',
        'NO_RESPONSE',
        'FULFILLED'
      );
    `);

    // Create waitlists table
    await queryRunner.createTable(
      new Table({
        name: 'waitlists',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'tenant_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'customer_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'barber_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'service_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['WAITING', 'OFFERED', 'CONFIRMED', 'CANCELLED', 'NO_RESPONSE', 'FULFILLED'],
            default: "'WAITING'",
          },
          {
            name: 'requested_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'slot_offered_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'slot_available_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'slot_confirmed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'position_in_queue',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'offered_slots',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'resulting_appointment_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['tenant_id'],
            referencedTableName: 'tenants',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['customer_id'],
            referencedTableName: 'customers',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['barber_id'],
            referencedTableName: 'barbers',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['service_id'],
            referencedTableName: 'services',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          }),
        ],
        indices: [
          new TableIndex({
            columnNames: ['tenant_id'],
          }),
          new TableIndex({
            columnNames: ['customer_id'],
          }),
          new TableIndex({
            columnNames: ['barber_id'],
          }),
          new TableIndex({
            columnNames: ['status'],
          }),
          new TableIndex({
            columnNames: ['tenant_id', 'barber_id', 'status'],
          }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop table
    await queryRunner.dropTable('waitlists');

    // Drop enum type
    await queryRunner.query('DROP TYPE "public"."waitlist_status_enum";');
  }
}
