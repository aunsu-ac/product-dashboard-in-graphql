import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout, ConfigProvider } from 'antd';
import Sidebar from './Sidebar';
import Home from './Home';
import ProductCRUD from './ProductCRUD';
import BrandCRUD from './BrandCRUD';
import CategoryCRUD from './CategoryCRUD';

const { Content } = Layout;

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
      }}
    >
      <Router>
        <Layout style={{ minHeight: '100vh' }}>
          <Sidebar />
          <Layout style={{ marginLeft: 250 }}>
            <Content style={{ padding: '24px', background: '#f0f2f5' }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<ProductCRUD />} />
                <Route path="/brands" element={<BrandCRUD />} />
                <Route path="/categories" element={<CategoryCRUD />} />
              </Routes>
            </Content>
          </Layout>
        </Layout>
      </Router>
    </ConfigProvider>
  );
}

export default App;
