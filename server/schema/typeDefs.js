const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Category {
    id: ID!
    name: String!
    description: String
    slug: String!
    logo: String
    createdAt: String
    updatedAt: String
  }

  type Brand {
    id: ID!
    name: String!
    country: String
    website: String
    logo: String
    createdAt: String
    updatedAt: String
  }

  type Product {
    id: ID!
    name: String!
    description: String!
    price: Float!
    stock: Int!
    category: Category!
    brand: Brand!
    imageUrl: String
    specifications: [Specification]
    rating: Float
    createdAt: String
    updatedAt: String
  }

  type Specification {
    key: String!
    value: String!
  }

  input SpecificationInput {
    key: String!
    value: String!
  }

  type Query {
    # Get all products
    products: [Product!]!
    
    # Get product details by ID (with category and brand lookup)
    productDetails(id: ID!): Product
    
    # Get products by category
    productsByCategory(categoryId: ID!): [Product!]!
    
    # Get products by brand
    productsByBrand(brandId: ID!): [Product!]!
    
    # Get all categories
    categories: [Category!]!
    
    # Get all brands
    brands: [Brand!]!
  }

  type Mutation {
    # Create new product
    createProduct(
      name: String!
      description: String!
      price: Float!
      stock: Int!
      categoryId: ID!
      brandId: ID!
      imageUrl: String
      specifications: [SpecificationInput]
      rating: Float
    ): Product!
    
    # Update product
    updateProduct(
      id: ID!
      name: String
      description: String
      price: Float
      stock: Int
      categoryId: ID
      brandId: ID
      imageUrl: String
      specifications: [SpecificationInput]
      rating: Float
    ): Product!
    
    # Delete product
    deleteProduct(id: ID!): Boolean!
    
    # Create new brand
    createBrand(
      name: String!
      country: String
      website: String
      logo: String
    ): Brand!
    
    # Update brand
    updateBrand(
      id: ID!
      name: String
      country: String
      website: String
      logo: String
    ): Brand!
    
    # Delete brand
    deleteBrand(id: ID!): Boolean!
    
    # Create new category
    createCategory(
      name: String!
      description: String
      slug: String!
      logo: String
    ): Category!
    
    # Update category
    updateCategory(
      id: ID!
      name: String
      description: String
      slug: String
      logo: String
    ): Category!
    
    # Delete category
    deleteCategory(id: ID!): Boolean!
  }
`;

module.exports = typeDefs;
