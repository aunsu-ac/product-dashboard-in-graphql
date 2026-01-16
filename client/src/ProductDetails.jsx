import React, { useState, useEffect } from 'react';

const ProductDetails = ({ productId }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    setLoading(true);
    setError(null);

    // GraphQL query with category and brand lookup
    const query = `
      query GetProductDetails($id: ID!) {
        productDetails(id: $id) {
          id
          name
          description
          price
          stock
          imageUrl
          rating
          specifications {
            key
            value
          }
          category {
            id
            name
            description
            slug
          }
          brand {
            id
            name
            country
            website
            logo
          }
          createdAt
          updatedAt
        }
      }
    `;

    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: { id: productId },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      setProduct(result.data.productDetails);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Error: {error}</p>
        <button onClick={fetchProductDetails}>Retry</button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="not-found-container">
        <p>Product not found</p>
      </div>
    );
  }

  return (
    <div className="product-details-container">
      <div className="product-header">
        <h1>{product.name}</h1>
        <div className="product-rating">
          ⭐ {product.rating ? product.rating.toFixed(1) : 'N/A'} / 5.0
        </div>
      </div>

      <div className="product-content">
        {/* Product Image */}
        <div className="product-image">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} />
          ) : (
            <div className="no-image">No Image Available</div>
          )}
        </div>

        {/* Product Info */}
        <div className="product-info">
          <div className="price-section">
            <h2 className="price">${product.price.toFixed(2)}</h2>
            <p className="stock">
              {product.stock > 0 ? (
                <span className="in-stock">In Stock ({product.stock} available)</span>
              ) : (
                <span className="out-of-stock">Out of Stock</span>
              )}
            </p>
          </div>

          {/* Category Information */}
          <div className="category-section">
            <h3>Category</h3>
            <div className="info-box">
              <p><strong>Name:</strong> {product.category.name}</p>
              {product.category.description && (
                <p><strong>Description:</strong> {product.category.description}</p>
              )}
            </div>
          </div>

          {/* Brand Information */}
          <div className="brand-section">
            <h3>Brand</h3>
            <div className="info-box">
              {product.brand.logo && (
                <img 
                  src={product.brand.logo} 
                  alt={product.brand.name} 
                  className="brand-logo"
                />
              )}
              <p><strong>Name:</strong> {product.brand.name}</p>
              {product.brand.country && (
                <p><strong>Country:</strong> {product.brand.country}</p>
              )}
              {product.brand.website && (
                <p>
                  <strong>Website:</strong>{' '}
                  <a href={product.brand.website} target="_blank" rel="noopener noreferrer">
                    {product.brand.website}
                  </a>
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="description-section">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          {/* Specifications */}
          {product.specifications && product.specifications.length > 0 && (
            <div className="specifications-section">
              <h3>Specifications</h3>
              <table className="specs-table">
                <tbody>
                  {product.specifications.map((spec, index) => (
                    <tr key={index}>
                      <td className="spec-key">{spec.key}</td>
                      <td className="spec-value">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <button className="add-to-cart-btn" disabled={product.stock === 0}>
            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .product-details-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }

        .product-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #eee;
          padding-bottom: 15px;
        }

        .product-header h1 {
          margin: 0;
          font-size: 2rem;
          color: #333;
        }

        .product-rating {
          font-size: 1.2rem;
          color: #ff9800;
          font-weight: bold;
        }

        .product-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }

        .product-image {
          display: flex;
          justify-content: center;
          align-items: center;
          background: #f5f5f5;
          border-radius: 8px;
          overflow: hidden;
        }

        .product-image img {
          max-width: 100%;
          height: auto;
          object-fit: cover;
        }

        .no-image {
          padding: 100px;
          color: #999;
          font-size: 1.2rem;
        }

        .product-info {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .price-section {
          background: #f0f8ff;
          padding: 20px;
          border-radius: 8px;
        }

        .price {
          font-size: 2.5rem;
          color: #2e7d32;
          margin: 0 0 10px 0;
        }

        .stock {
          margin: 0;
          font-size: 1rem;
        }

        .in-stock {
          color: #2e7d32;
          font-weight: bold;
        }

        .out-of-stock {
          color: #d32f2f;
          font-weight: bold;
        }

        .category-section,
        .brand-section,
        .description-section,
        .specifications-section {
          border: 1px solid #ddd;
          padding: 15px;
          border-radius: 8px;
        }

        .category-section h3,
        .brand-section h3,
        .description-section h3,
        .specifications-section h3 {
          margin-top: 0;
          color: #555;
          font-size: 1.2rem;
          border-bottom: 2px solid #4caf50;
          padding-bottom: 8px;
        }

        .info-box {
          margin-top: 10px;
        }

        .info-box p {
          margin: 8px 0;
          line-height: 1.6;
        }

        .brand-logo {
          max-width: 100px;
          margin-bottom: 10px;
        }

        .specs-table {
          width: 100%;
          border-collapse: collapse;
        }

        .specs-table tr {
          border-bottom: 1px solid #eee;
        }

        .specs-table td {
          padding: 10px;
        }

        .spec-key {
          font-weight: bold;
          color: #555;
          width: 40%;
        }

        .spec-value {
          color: #333;
        }

        .add-to-cart-btn {
          background: #4caf50;
          color: white;
          border: none;
          padding: 15px 30px;
          font-size: 1.2rem;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.3s;
        }

        .add-to-cart-btn:hover:not(:disabled) {
          background: #45a049;
        }

        .add-to-cart-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .loading-container,
        .error-container,
        .not-found-container {
          text-align: center;
          padding: 50px;
          font-size: 1.2rem;
        }

        .error-container button {
          margin-top: 20px;
          padding: 10px 20px;
          background: #f44336;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .product-content {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductDetails;
