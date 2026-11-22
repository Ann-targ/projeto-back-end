'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Tabela de usuários
    await queryInterface.createTable('users', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      firstname: { type: Sequelize.STRING, allowNull: false },
      surname: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      password: { type: Sequelize.STRING, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    // Tabela de categorias
    await queryInterface.createTable('categories', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false },
      slug: { type: Sequelize.STRING, allowNull: false },
      use_in_menu: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    // Tabela de produtos
    await queryInterface.createTable('products', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      enabled: { type: Sequelize.BOOLEAN, defaultValue: false },
      name: { type: Sequelize.STRING, allowNull: false },
      slug: { type: Sequelize.STRING, allowNull: false },
      use_in_menu: { type: Sequelize.BOOLEAN, defaultValue: false },
      stock: { type: Sequelize.INTEGER, defaultValue: 0 },
      description: { type: Sequelize.STRING },
      price: { type: Sequelize.FLOAT, allowNull: false },
      price_with_discount: { type: Sequelize.FLOAT, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    // Imagens do produto
    await queryInterface.createTable('product_images', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'products', key: 'id' },
        onDelete: 'CASCADE',
      },
      enabled: { type: Sequelize.BOOLEAN, defaultValue: false },
      path: { type: Sequelize.STRING, allowNull: false },
    });

    // Opções do produto
    await queryInterface.createTable('product_options', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'products', key: 'id' },
        onDelete: 'CASCADE',
      },
      title: { type: Sequelize.STRING, allowNull: false },
      shape: { type: Sequelize.ENUM('square', 'circle'), defaultValue: 'square' },
      radius: { type: Sequelize.INTEGER, defaultValue: 0 },
      type: { type: Sequelize.ENUM('text', 'color'), defaultValue: 'text' },
      values: { type: Sequelize.STRING, allowNull: false },
    });

    // Ligação produto <-> categoria
    await queryInterface.createTable('product_categories', {
      product_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: { model: 'products', key: 'id' },
        onDelete: 'CASCADE',
      },
      category_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: { model: 'categories', key: 'id' },
        onDelete: 'CASCADE',
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('product_categories');
    await queryInterface.dropTable('product_options');
    await queryInterface.dropTable('product_images');
    await queryInterface.dropTable('products');
    await queryInterface.dropTable('categories');
    await queryInterface.dropTable('users');
  },
};