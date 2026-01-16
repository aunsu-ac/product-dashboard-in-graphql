const ProductModel = require('../models/ProductModel');
const Category = require('../models/Category');
const Brand = require('../models/Brand');

const resolvers = {
    Query: {
        // Get all products with category and brand populated
        products: async () => {
            try {
                const la_products = await ProductModel.find();
                return la_products;
            } catch (lo_error) {
                throw new Error(`Error fetching products: ${lo_error.message}`);
            }
        },

        // Get product details by ID with category and brand lookup
        productDetails: async (_, { id: ls_id }) => {
            try {
                const lo_product = await ProductModel.findById(ls_id);
                if (!lo_product) {
                    throw new Error('Product not found');
                }
                return lo_product;
            } catch (lo_error) {
                throw new Error(`Error fetching product details: ${lo_error.message}`);
            }
        },

        // Get products by category
        productsByCategory: async (_, { categoryId: ls_categoryId }) => {
            try {
                const la_products = await ProductModel.find({ categoryId: ls_categoryId });
                return la_products;
            } catch (lo_error) {
                throw new Error(`Error fetching products by category: ${lo_error.message}`);
            }
        },

        // Get products by brand
        productsByBrand: async (_, { brandId: ls_brandId }) => {
            try {
                const la_products = await ProductModel.find({ brandId: ls_brandId });
                return la_products;
            } catch (lo_error) {
                throw new Error(`Error fetching products by brand: ${lo_error.message}`);
            }
        },

        // Get all categories
        categories: async () => {
            try {
                const la_categories = await Category.find();
                return la_categories;
            } catch (lo_error) {
                throw new Error(`Error fetching categories: ${lo_error.message}`);
            }
        },

        // Get all brands
        brands: async () => {
            try {
                const la_brands = await Brand.find();
                return la_brands;
            } catch (lo_error) {
                throw new Error(`Error fetching brands: ${lo_error.message}`);
            }
        },
    },

    Mutation: {
        // Create a new product
        createProduct: async (_, lo_args) => {
            try {
                // Convert specifications array to Map if provided
                if (lo_args.specifications && Array.isArray(lo_args.specifications)) {
                    const lo_specsMap = new Map();
                    lo_args.specifications.forEach(lo_spec => {
                        lo_specsMap.set(lo_spec.key, lo_spec.value);
                    });
                    lo_args.specifications = lo_specsMap;
                }

                const lo_product = new ProductModel(lo_args);
                await lo_product.save();
                return lo_product;
            } catch (lo_error) {
                throw new Error(`Error creating product: ${lo_error.message}`);
            }
        },

        // Update a product
        updateProduct: async (_, { id: ls_id, ...lo_updates }) => {
            try {
                // Convert specifications array to Map if provided
                if (lo_updates.specifications && Array.isArray(lo_updates.specifications)) {
                    const lo_specsMap = new Map();
                    lo_updates.specifications.forEach(lo_spec => {
                        lo_specsMap.set(lo_spec.key, lo_spec.value);
                    });
                    lo_updates.specifications = lo_specsMap;
                }

                const lo_product = await ProductModel.findByIdAndUpdate(
                    ls_id,
                    lo_updates,
                    { new: true, runValidators: true }
                );
                if (!lo_product) {
                    throw new Error('Product not found');
                }
                return lo_product;
            } catch (lo_error) {
                throw new Error(`Error updating product: ${lo_error.message}`);
            }
        },

        // Delete a product
        deleteProduct: async (_, { id: ls_id }) => {
            try {
                const lo_product = await ProductModel.findByIdAndDelete(ls_id);
                if (!lo_product) {
                    throw new Error('Product not found');
                }
                return true;
            } catch (lo_error) {
                throw new Error(`Error deleting product: ${lo_error.message}`);
            }
        },

        // Create a new brand
        createBrand: async (_, lo_args) => {
            try {
                const lo_brand = new Brand(lo_args);
                await lo_brand.save();
                return lo_brand;
            } catch (lo_error) {
                throw new Error(`Error creating brand: ${lo_error.message}`);
            }
        },

        // Update a brand
        updateBrand: async (_, { id: ls_id, ...lo_updates }) => {
            try {
                const lo_brand = await Brand.findByIdAndUpdate(
                    ls_id,
                    lo_updates,
                    { new: true, runValidators: true }
                );
                if (!lo_brand) {
                    throw new Error('Brand not found');
                }
                return lo_brand;
            } catch (lo_error) {
                throw new Error(`Error updating brand: ${lo_error.message}`);
            }
        },

        // Delete a brand
        deleteBrand: async (_, { id: ls_id }) => {
            try {
                const lo_brand = await Brand.findByIdAndDelete(ls_id);
                if (!lo_brand) {
                    throw new Error('Brand not found');
                }
                return true;
            } catch (lo_error) {
                throw new Error(`Error deleting brand: ${lo_error.message}`);
            }
        },

        // Create a new category
        createCategory: async (_, lo_args) => {
            try {
                const lo_category = new Category(lo_args);
                await lo_category.save();
                return lo_category;
            } catch (lo_error) {
                throw new Error(`Error creating category: ${lo_error.message}`);
            }
        },

        // Update a category
        updateCategory: async (_, { id: ls_id, ...lo_updates }) => {
            try {
                const lo_category = await Category.findByIdAndUpdate(
                    ls_id,
                    lo_updates,
                    { new: true, runValidators: true }
                );
                if (!lo_category) {
                    throw new Error('Category not found');
                }
                return lo_category;
            } catch (lo_error) {
                throw new Error(`Error updating category: ${lo_error.message}`);
            }
        },

        // Delete a category
        deleteCategory: async (_, { id: ls_id }) => {
            try {
                const lo_category = await Category.findByIdAndDelete(ls_id);
                if (!lo_category) {
                    throw new Error('Category not found');
                }
                return true;
            } catch (lo_error) {
                throw new Error(`Error deleting category: ${lo_error.message}`);
            }
        },
    },

    // Field resolvers for Product type
    Product: {
        // Resolve category field with lookup
        category: async (lo_parent) => {
            try {
                const lo_category = await Category.findById(lo_parent.categoryId);
                return lo_category;
            } catch (lo_error) {
                throw new Error(`Error fetching category: ${lo_error.message}`);
            }
        },

        // Resolve brand field with lookup
        brand: async (lo_parent) => {
            try {
                const lo_brand = await Brand.findById(lo_parent.brandId);
                return lo_brand;
            } catch (lo_error) {
                throw new Error(`Error fetching brand: ${lo_error.message}`);
            }
        },

        // Convert Map to array of key-value pairs
        specifications: (lo_parent) => {
            if (!lo_parent.specifications) return [];
            return Array.from(lo_parent.specifications).map(([ls_key, ls_value]) => ({
                key: ls_key,
                value: ls_value,
            }));
        },
    },
};

module.exports = resolvers;
