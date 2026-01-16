# Product Dashboard using GraphQL

A full-stack product management dashboard built with GraphQL, Apollo Server, React, and MongoDB. This application provides a comprehensive CRUD interface for managing products, brands, and categories with real-time data visualization.

## 🚀 Features

- **Product Management**: Create, read, update, and delete products with image uploads
- **Brand Management**: Full CRUD operations for product brands
- **Category Management**: Organize products by categories with hierarchical structure
- **Real-time Dashboard**: Interactive charts and statistics using Recharts
- **Image Upload**: Support for product image uploads with file handling
- **Responsive UI**: Modern interface built with Ant Design components
- **GraphQL API**: Efficient data fetching with Apollo Server and GraphQL queries/mutations

## 📁 Project Structure

```
graphql-product-app/
├── client/                      # React frontend application
│   ├── src/
│   │   ├── main.jsx            # Application entry point
│   │   ├── App.jsx             # Main app component with routing
│   │   ├── Home.jsx            # Dashboard home with statistics
│   │   ├── Products.jsx        # Product listing page
│   │   ├── ProductDetails.jsx  # Individual product view
│   │   ├── ProductCRUD.jsx     # Product create/edit form
│   │   ├── BrandCRUD.jsx       # Brand management interface
│   │   ├── Categories.jsx      # Category listing page
│   │   ├── CategoryCRUD.jsx    # Category create/edit form
│   │   ├── Sidebar.jsx         # Navigation sidebar component
│   │   └── utils/
│   │       └── graphqlClient.js # Apollo Client configuration
│   ├── package.json            # Client dependencies
│   └── vite.config.js          # Vite configuration for development
│
├── server/                      # GraphQL API backend
│   ├── index.js                # Express & Apollo Server setup
│   ├── db.js                   # MongoDB connection configuration
│   ├── seedData.js             # Database seeding script
│   ├── upload.js               # Multer file upload configuration
│   ├── models/
│   │   ├── ProductModel.js     # Mongoose product schema
│   │   ├── Brand.js            # Mongoose brand schema
│   │   └── Category.js         # Mongoose category schema
│   └── schema/
│       ├── typeDefs.js         # GraphQL type definitions
│       └── resolvers.js        # GraphQL resolvers
│
├── public/
│   └── uploads/                # Uploaded product images storage
│
└── README.md                   # Project documentation
```

## 🛠️ Technologies Used

### Backend
- **Apollo Server Express** (v3.13.0) - GraphQL server implementation
- **Express.js** (v4.18.2) - Web application framework
- **MongoDB & Mongoose** (v8.0.3) - Database and ODM
- **GraphQL** (v16.8.1) - Query language for APIs
- **Multer** - File upload middleware
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** (v18.2.0) - UI library
- **Vite** (v5.0.8) - Build tool and development server
- **Apollo Client** - GraphQL client for React
- **React Router DOM** (v7.12.0) - Client-side routing
- **Ant Design** (v6.2.0) - UI component library
- **Recharts** (v3.6.0) - Data visualization library
- **Axios** (v1.13.2) - HTTP client for file uploads

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn package manager

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd graphql-product-app
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables**
   
   Create a `.env` file in the `server` directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/product-dashboard
   PORT=4000
   CLIENT_URL=http://localhost:5173
   ```

4. **Seed the database with sample data:**
```bash
npm run seed
```

## 🚀 Running the Application

### Start the Server (Backend)

```bash
cd server
npm run dev
```

The GraphQL server will start on `http://localhost:4000`
- GraphQL Playground: `http://localhost:4000/graphql`

### Start the Client (Frontend)

```bash
cd client
npm run dev
```

The React app will start on `http://localhost:5173`

### Seed Database (Optional)

To populate the database with sample data:

```bash
cd server
npm run seed
```

## 📊 GraphQL API

The GraphQL API provides the following main operations:

### Queries
- `products` - Fetch all products with brand and category details
- `product(id: ID!)` - Get a single product by ID
- `brands` - Fetch all brands
- `brand(id: ID!)` - Get a single brand by ID
- `categories` - Fetch all categories
- `category(id: ID!)` - Get a single category by ID

### Mutations
- `createProduct` - Add a new product
- `updateProduct` - Update existing product
- `deleteProduct` - Remove a product
- `createBrand` - Add a new brand
- `updateBrand` - Update existing brand
- `deleteBrand` - Remove a brand
- `createCategory` - Add a new category
- `updateCategory` - Update existing category
- `deleteCategory` - Remove a category

## 🎨 Key Features Explained

### Product Management
Products include name, description, price, stock quantity, brand, category, and image. The system supports full CRUD operations with image upload functionality.

### Brand Management
Brands can be created and managed independently, with each brand associated with multiple products. The interface provides statistics on product count per brand.

### Category Management
Categories organize products hierarchically, allowing for better product organization and filtering. Each category tracks the number of associated products.

### Dashboard
The home dashboard displays:
- Total product count
- Total brand count
- Total category count
- Interactive charts showing product distribution
- Recent product listings

### Image Upload
Products support image uploads through a dedicated upload endpoint. Images are stored in the `public/uploads` directory and served statically.

## 📦 Build for Production

### Build Client
```bash
cd client
npm run build
```

### Start Server in Production
```bash
cd server
npm start
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

ISC License

## 👨‍💻 Author

**Aunsu Chandra**

Built with ❤️ using GraphQL, React, and MongoDB
        "name": "Smartphones",
        "description": "Mobile phones and accessories",
        "slug": "smartphones"
      },
      "brand": {
        "id": "60d5ec49f1b2c8b1f8e4e1a3",
        "name": "Apple",
        "country": "USA",
        "website": "https://www.apple.com",
        "logo": "https://logo.clearbit.com/apple.com"
      },
      "specifications": [
        {
          "key": "Display",
          "value": "6.1-inch Super Retina XDR"
        },
        {
          "key": "Processor",
          "value": "A17 Pro chip"
        },
        {
          "key": "Camera",
          "value": "48MP Main | 12MP Ultra Wide | 12MP Telephoto"
        },
        {
          "key": "Storage",
          "value": "256GB"
        },
        {
          "key": "Battery",
          "value": "Up to 23 hours video playback"
        },
        {
          "key": "OS",
          "value": "iOS 17"
        }
      ]
    }
  }
}
```

### Example 2: Query All Products

**GraphQL Query:**
```graphql
query GetAllProducts {
  products {
    id
    name
    price
    stock
    rating
    category {
      name
    }
    brand {
      name
    }
  }
}
```

**Expected Output:**
```json
{
  "data": {
    "products": [
      {
        "id": "60d5ec49f1b2c8b1f8e4e1a1",
        "name": "iPhone 15 Pro",
        "price": 999.99,
        "stock": 50,
        "rating": 4.8,
        "category": {
          "name": "Smartphones"
        },
        "brand": {
          "name": "Apple"
        }
      },
      {
        "id": "60d5ec49f1b2c8b1f8e4e1a4",
        "name": "Samsung Galaxy S24 Ultra",
        "price": 1199.99,
        "stock": 35,
        "rating": 4.7,
        "category": {
          "name": "Smartphones"
        },
        "brand": {
          "name": "Samsung"
        }
      }
    ]
  }
}
```

### Example 3: Query Products by Category

**GraphQL Query:**
```graphql
query GetProductsByCategory($categoryId: ID!) {
  productsByCategory(categoryId: $categoryId) {
    id
    name
    price
    brand {
      name
    }
  }
}
```

**Variables:**
```json
{
  "categoryId": "60d5ec49f1b2c8b1f8e4e1a2"
}
```

### Example 4: Create New Product (Mutation)

**GraphQL Mutation:**
```graphql
mutation CreateProduct {
  createProduct(
    name: "iPad Pro 12.9"
    description: "Powerful tablet with M2 chip"
    price: 1099.99
    stock: 30
    categoryId: "60d5ec49f1b2c8b1f8e4e1a2"
    brandId: "60d5ec49f1b2c8b1f8e4e1a3"
    rating: 4.7
  ) {
    id
    name
    price
    category {
      name
    }
    brand {
      name
    }
  }
}
```

## 🎨 React Component Usage

### Basic Usage:

```jsx
import React from 'react';
import ProductDetails from './ProductDetails';

function App() {
  // Use the product ID from your database (get it from seedData.js output)
  const productId = "60d5ec49f1b2c8b1f8e4e1a1";
  
  return (
    <div className="App">
      <ProductDetails productId={productId} />
    </div>
  );
}

export default App;
```

### With Dynamic Product ID:

```jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import ProductDetails from './ProductDetails';

function ProductPage() {
  const { id } = useParams();
  
  return (
    <div>
      <ProductDetails productId={id} />
    </div>
  );
}

export default ProductPage;
```

## 🔍 Testing the API

### Using GraphQL Playground:

1. Start the server (`npm start`)
2. Open browser to `http://localhost:4000/graphql`
3. Run the seed script to get sample product IDs
4. Use the queries from the examples above

### Using cURL:

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { products { id name price category { name } brand { name } } }"
  }'
```

## 🎯 Key Features

- ✅ **Category Lookup**: Automatically populates category details in product queries
- ✅ **Brand Lookup**: Automatically populates brand details in product queries
- ✅ **Field Resolvers**: Efficient data fetching using GraphQL field resolvers
- ✅ **React Integration**: Complete React component with fetch API
- ✅ **Error Handling**: Comprehensive error handling on both server and client
- ✅ **Responsive Design**: Mobile-friendly product details page
- ✅ **Sample Data**: Includes seed script with realistic product data

## 📝 API Endpoints

### Queries:
- `products` - Get all products
- `productDetails(id: ID!)` - Get product by ID with category and brand
- `productsByCategory(categoryId: ID!)` - Filter products by category
- `productsByBrand(brandId: ID!)` - Filter products by brand
- `categories` - Get all categories
- `brands` - Get all brands

### Mutations:
- `createProduct(...)` - Create a new product
- `updateProduct(id: ID!, ...)` - Update existing product
- `deleteProduct(id: ID!)` - Delete a product

## 🛠️ Technologies Used

- **Backend**: Node.js, Express, Apollo Server, GraphQL
- **Database**: MongoDB, Mongoose
- **Frontend**: React, Fetch API
- **Styling**: CSS-in-JS (styled-jsx)

## 📄 License

MIT
