// OJO: En tu foto el modelo se llama 'product_model.js' (con guion bajo)
const Product = require('../models/product_model');

class ProductRepository {
  async create(productData) {
    return await Product.create(productData);
  }

  async findAll() {
    return await Product.find();
  }

  async count() {
    return await Product.countDocuments();
  }

  async findById(id) {
    return await Product.findById(id);
  }

  async update(id, data) {
    return await Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return await Product.findByIdAndDelete(id);
  }
}

module.exports = new ProductRepository();