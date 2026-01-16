const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/ProductModel');
const Category = require('./models/Category');
const Brand = require('./models/Brand');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (lo_error) {
    console.error('❌ MongoDB connection error:', lo_error);
    process.exit(1);
  }
};

const seedData = async () => {
  await connectDB();

  try {
    // Clear existing data
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Brand.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create Categories
    const categories = await Category.insertMany([
      {
        name: 'Electronics',
        description: 'Electronic devices and gadgets',
        slug: 'electronics',
      },
      {
        name: 'Smartphones',
        description: 'Mobile phones and accessories',
        slug: 'smartphones',
      },
      {
        name: 'Laptops',
        description: 'Portable computers',
        slug: 'laptops',
      },
    ]);
    console.log('✅ Categories created');

    // Create Brands
    const brands = await Brand.insertMany([
      {
        name: 'Apple',
        country: 'USA',
        website: 'https://www.apple.com',
        logo: 'https://logo.clearbit.com/apple.com',
      },
      {
        name: 'Samsung',
        country: 'South Korea',
        website: 'https://www.samsung.com',
        logo: 'https://logo.clearbit.com/samsung.com',
      },
      {
        name: 'Dell',
        country: 'USA',
        website: 'https://www.dell.com',
        logo: 'https://logo.clearbit.com/dell.com',
      },
    ]);
    console.log('✅ Brands created');

    // Create Products
    const products = await Product.insertMany([
      {
        name: 'iPhone 15 Pro',
        description: 'The latest flagship smartphone from Apple with A17 Pro chip, titanium design, and advanced camera system.',
        price: 999.99,
        stock: 50,
        categoryId: categories[1]._id, // Smartphones
        brandId: brands[0]._id, // Apple
        imageUrl: 'https://via.placeholder.com/400x400?text=iPhone+15+Pro',
        rating: 4.8,
        specifications: new Map([
          ['Display', '6.1-inch Super Retina XDR'],
          ['Processor', 'A17 Pro chip'],
          ['Camera', '48MP Main | 12MP Ultra Wide | 12MP Telephoto'],
          ['Storage', '256GB'],
          ['Battery', 'Up to 23 hours video playback'],
          ['OS', 'iOS 17'],
        ]),
      },
      {
        name: 'Samsung Galaxy S24 Ultra',
        description: 'Premium Android smartphone with S Pen, powerful camera, and long-lasting battery.',
        price: 1199.99,
        stock: 35,
        categoryId: categories[1]._id, // Smartphones
        brandId: brands[1]._id, // Samsung
        imageUrl: 'https://via.placeholder.com/400x400?text=Galaxy+S24+Ultra',
        rating: 4.7,
        specifications: new Map([
          ['Display', '6.8-inch Dynamic AMOLED 2X'],
          ['Processor', 'Snapdragon 8 Gen 3'],
          ['Camera', '200MP Main | 12MP Ultra Wide | 50MP Telephoto | 10MP Telephoto'],
          ['Storage', '512GB'],
          ['RAM', '12GB'],
          ['Battery', '5000mAh'],
          ['OS', 'Android 14'],
        ]),
      },
      {
        name: 'Dell XPS 15',
        description: 'High-performance laptop with stunning InfinityEdge display and powerful Intel processor.',
        price: 1799.99,
        stock: 20,
        categoryId: categories[2]._id, // Laptops
        brandId: brands[2]._id, // Dell
        imageUrl: 'https://via.placeholder.com/400x400?text=Dell+XPS+15',
        rating: 4.6,
        specifications: new Map([
          ['Display', '15.6-inch FHD+ (1920 x 1200)'],
          ['Processor', 'Intel Core i7-13700H'],
          ['RAM', '16GB DDR5'],
          ['Storage', '512GB PCIe NVMe SSD'],
          ['Graphics', 'NVIDIA GeForce RTX 4050'],
          ['Battery', 'Up to 13 hours'],
          ['Weight', '4.23 lbs (1.92 kg)'],
          ['OS', 'Windows 11 Pro'],
        ]),
      },
      {
        name: 'MacBook Pro 14"',
        description: 'Supercharged by M3 Pro chip, featuring a stunning Liquid Retina XDR display.',
        price: 1999.99,
        stock: 15,
        categoryId: categories[2]._id, // Laptops
        brandId: brands[0]._id, // Apple
        imageUrl: 'https://via.placeholder.com/400x400?text=MacBook+Pro+14',
        rating: 4.9,
        specifications: new Map([
          ['Display', '14.2-inch Liquid Retina XDR'],
          ['Processor', 'Apple M3 Pro chip'],
          ['RAM', '18GB unified memory'],
          ['Storage', '512GB SSD'],
          ['Battery', 'Up to 18 hours'],
          ['Weight', '3.5 lbs (1.6 kg)'],
          ['OS', 'macOS Sonoma'],
        ]),
      },
    ]);
    console.log('✅ Products created');

    console.log('\n📊 Sample Data Summary:');
    console.log(`- ${categories.length} categories created`);
    console.log(`- ${brands.length} brands created`);
    console.log(`- ${products.length} products created`);
    
    console.log('\n🆔 Sample Product IDs for testing:');
    products.forEach((lo_product, li_index) => {
      console.log(`${li_index + 1}. ${lo_product.name}: ${lo_product._id}`);
    });

  } catch (lo_error) {
    console.error('❌ Error seeding data:', lo_error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
};

seedData();
