import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class EnhancePaymentEntity1704081600003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add external_id column
    await queryRunner.addColumn(
      'payments',
      new TableColumn({
        name: 'external_id',
        type: 'varchar',
        isNullable: true,
      }),
    );

    // Add paid_at column
    await queryRunner.addColumn(
      'payments',
      new TableColumn({
        name: 'paid_at',
        type: 'timestamp',
        isNullable: true,
      }),
    );

    // Add metadata column
    await queryRunner.addColumn(
      'payments',
      new TableColumn({
        name: 'metadata',
        type: 'jsonb',
        isNullable: true,
      }),
    );

    // Add foreign key for appointment_id to appointment table
    // Note: appointment_id already exists, just adding the foreign key relationship
    await queryRunner.createForeignKey(
      'payments',
      new TableForeignKey({
        columnNames: ['appointment_id'],
        referencedTableName: 'appointments',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key
    const table = await queryRunner.getTable('payments');
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('appointment_id') !== -1 &&
              fk.referencedTableName === 'appointments',
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('payments', foreignKey);
    }

    // Drop columns
    await queryRunner.dropColumn('payments', 'metadata');
    await queryRunner.dropColumn('payments', 'paid_at');
    await queryRunner.dropColumn('payments', 'external_id');
  }
}
