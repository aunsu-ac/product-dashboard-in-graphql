import React from 'react';

const Products = () => {
  return (
    <div className="products-container">
      <h1>Products</h1>
      <p>Product listing will be displayed here.</p>
      
      <style jsx>{`
        .products-container {
          padding: 40px;
        }

        h1 {
          color: #2c3e50;
          margin-bottom: 20px;
        }

        p {
          color: #7f8c8d;
        }
      `}</style>
    </div>
  );
};

export default Products;
