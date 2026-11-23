const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  firstname: { type: DataTypes.STRING, allowNull: false },
  surname: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
}, { tableName: 'users', underscored: true, timestamps: true });

const Category = sequelize.define('Category', {
  name: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, allowNull: false },
  use_in_menu: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'categories', underscored: true, timestamps: true });

const Product = sequelize.define('Product', {
  enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
  name: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, allowNull: false },
  use_in_menu: { type: DataTypes.BOOLEAN, defaultValue: false },
  stock: { type: DataTypes.INTEGER, defaultValue: 0 },
  description: { type: DataTypes.STRING },
  price: { type: DataTypes.FLOAT, allowNull: false },
  price_with_discount: { type: DataTypes.FLOAT, allowNull: false },
}, { tableName: 'products', underscored: true, timestamps: true });

const ProductImage = sequelize.define('ProductImage', {
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
  path: { type: DataTypes.STRING, allowNull: false },
}, { tableName: 'product_images', timestamps: false });

const ProductOption = sequelize.define('ProductOption', {
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  shape: { type: DataTypes.ENUM('square', 'circle'), defaultValue: 'square' },
  radius: { type: DataTypes.INTEGER, defaultValue: 0 },
  type: { type: DataTypes.ENUM('text', 'color'), defaultValue: 'text' },
  values: { type: DataTypes.STRING, allowNull: false },
}, { tableName: 'product_options', timestamps: false });

// Relacionamentos entre as tabelas
Product.hasMany(ProductImage, { foreignKey: 'product_id', as: 'images', onDelete: 'CASCADE' });
ProductImage.belongsTo(Product, { foreignKey: 'product_id' });
Product.hasMany(ProductOption, { foreignKey: 'product_id', as: 'options', onDelete: 'CASCADE' });
ProductOption.belongsTo(Product, { foreignKey: 'product_id' });
Product.belongsToMany(Category, {
  through: 'product_categories', foreignKey: 'product_id', otherKey: 'category_id',
  as: 'categories', timestamps: false,
});
Category.belongsToMany(Product, {
  through: 'product_categories', foreignKey: 'category_id', otherKey: 'product_id',
  timestamps: false,
});

module.exports = { sequelize, User, Category, Product, ProductImage, ProductOption };