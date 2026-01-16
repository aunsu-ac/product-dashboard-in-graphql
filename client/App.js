import React from 'react';
import ProductDetails from './ProductDetails';

function App() {
  // Example product ID - replace with actual ID from your database
  // Run the seed script to get actual product IDs
  const productId = "PASTE_PRODUCT_ID_HERE";
  
  return (
    <div className="App">
      <header style={{
        background: '#4caf50',
        color: 'white',
        padding: '20px',
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        <h1>GraphQL Product Store</h1>
        <p>Product Details with Category and Brand Lookup</p>
      </header>
      
      <ProductDetails productId={productId} />
      
      <footer style={{
        textAlign: 'center',
        padding: '20px',
        marginTop: '40px',
        borderTop: '1px solid #ddd',
        color: '#666'
      }}>
        <p>GraphQL Product API Demo - 2026</p>
      </footer>
    </div>
  );
}

export default App;
