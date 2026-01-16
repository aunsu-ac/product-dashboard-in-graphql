import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin, Alert } from 'antd';
import {
    ShoppingOutlined,
    TagsOutlined,
    FolderOutlined,
    RiseOutlined,
} from '@ant-design/icons';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { graphqlRequest } from './utils/graphqlClient';

const Home = () => {
    const [lo_stats, setLo_stats] = useState({
        totalProducts: 0,
        totalBrands: 0,
        totalCategories: 0,
        totalValue: 0,
    });
    const [la_productsByCategory, setLa_productsByCategory] = useState([]);
    const [la_productsByBrand, setLa_productsByBrand] = useState([]);
    const [la_topProducts, setLa_topProducts] = useState([]);
    const [la_creationTimeline, setLa_creationTimeline] = useState([]);
    const [lb_loading, setLb_loading] = useState(true);
    const [ls_error, setLs_error] = useState(null);

    const la_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLb_loading(true);
        setLs_error(null);

        const ls_query = `
      query GetDashboardData {
        products {
          id
          name
          price
          stock
          rating
          createdAt
          category {
            id
            name
          }
          brand {
            id
            name
          }
        }
        categories {
          id
          name
          createdAt
        }
        brands {
          id
          name
          createdAt
        }
      }
    `;

        try {
            const lo_data = await graphqlRequest(ls_query);

            const { products: la_products, categories: la_categories, brands: la_brands } = lo_data;

            // Calculate total value
            const lf_totalValue = la_products.reduce((lf_sum, lo_p) => lf_sum + lo_p.price * lo_p.stock, 0);

            setLo_stats({
                totalProducts: la_products.length,
                totalBrands: la_brands.length,
                totalCategories: la_categories.length,
                totalValue: lf_totalValue,
            });

            // Products by category (no need for categoryMap since we have nested data)
            const lo_categoryCount = {};
            la_products.forEach((lo_product) => {
                const ls_catName = lo_product.category?.name || 'Unknown';
                lo_categoryCount[ls_catName] = (lo_categoryCount[ls_catName] || 0) + 1;
            });

            const la_categoryData = Object.keys(lo_categoryCount).map((ls_name) => ({
                name: ls_name,
                count: lo_categoryCount[ls_name],
            }));

            setLa_productsByCategory(la_categoryData);

            // Products by brand (no need for brandMap since we have nested data)
            const lo_brandCount = {};
            la_products.forEach((lo_product) => {
                const ls_brandName = lo_product.brand?.name || 'Unknown';
                lo_brandCount[ls_brandName] = (lo_brandCount[ls_brandName] || 0) + 1;
            });

            const la_brandData = Object.keys(lo_brandCount).map((ls_name) => ({
                name: ls_name,
                count: lo_brandCount[ls_name],
            }));

            setLa_productsByBrand(la_brandData);

            // Top products by rating
            const la_sortedProducts = [...la_products]
                .sort((lo_a, lo_b) => (lo_b.rating || 0) - (lo_a.rating || 0))
                .slice(0, 5)
                .map((lo_p) => ({
                    name: lo_p.name.length > 20 ? lo_p.name.substring(0, 20) + '...' : lo_p.name,
                    rating: lo_p.rating || 0,
                    price: lo_p.price,
                }));

            setLa_topProducts(la_sortedProducts);

            // Creation timeline - group by month
            const la_allItems = [
                ...la_products.filter(lo_p => lo_p.createdAt).map(lo_p => ({ type: 'Product', date: lo_p.createdAt })),
                ...la_brands.filter(lo_b => lo_b.createdAt).map(lo_b => ({ type: 'Brand', date: lo_b.createdAt })),
                ...la_categories.filter(lo_c => lo_c.createdAt).map(lo_c => ({ type: 'Category', date: lo_c.createdAt })),
            ];

            const lo_timelineMap = {};
            la_allItems.forEach(lo_item => {
                if (!lo_item.date) return;
                
                const ldate_dateObj = new Date(parseInt(lo_item.date));
                if (isNaN(ldate_dateObj.getTime())) return; // Skip invalid dates
                
                const ls_monthYear = ldate_dateObj.toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric'
                });
                
                if (!lo_timelineMap[ls_monthYear]) {
                    lo_timelineMap[ls_monthYear] = { 
                        month: ls_monthYear, 
                        date: ldate_dateObj,
                        Products: 0, 
                        Brands: 0, 
                        Categories: 0 
                    };
                }
                lo_timelineMap[ls_monthYear][lo_item.type === 'Product' ? 'Products' : lo_item.type === 'Brand' ? 'Brands' : 'Categories']++;
            });

            const la_timelineData = Object.values(lo_timelineMap).sort((lo_a, lo_b) =>
                lo_a.date - lo_b.date
            ).map(lo_item => {
                const { date, ...lo_rest } = lo_item;
                return lo_rest;
            });

            setLa_creationTimeline(la_timelineData);
        } catch (lo_err) {
            setLs_error(lo_err.message);
        } finally {
            setLb_loading(false);
        }
    };

    if (lb_loading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px' }}>
                <Spin size="large" tip="Loading dashboard..." />
            </div>
        );
    }

    if (ls_error) {
        return (
            <Alert
                message="Error Loading Dashboard"
                description={ls_error}
                type="error"
                showIcon
                style={{ margin: '20px' }}
            />
        );
    }

    return (
        <div>
            <h1 style={{ marginBottom: '24px', fontSize: '28px', fontWeight: 600 }}>
                Dashboard Overview
            </h1>

            {/* Statistics Cards */}
            <Row gutter={16} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Total Products"
                            value={lo_stats.totalProducts}
                            prefix={<ShoppingOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Total Brands"
                            value={lo_stats.totalBrands}
                            prefix={<TagsOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Total Categories"
                            value={lo_stats.totalCategories}
                            prefix={<FolderOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Charts Row 1 */}
            <Row gutter={16} style={{ marginBottom: '24px' }}>
                <Col xs={24} lg={12}>
                    <Card title="Products by Category" bordered={false}>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={la_productsByCategory}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#1890ff" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Products by Brand" bordered={false}>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={la_productsByBrand}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name: ls_name, percent: lf_percent }) =>
                                        `${ls_name}: ${(lf_percent * 100).toFixed(0)}%`
                                    }
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {la_productsByBrand.map((lo_entry, li_index) => (
                                        <Cell
                                            key={`cell-${li_index}`}
                                            fill={la_COLORS[li_index % la_COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* Charts Row 2 */}
            <Row gutter={16} style={{ marginBottom: '24px' }}>
                <Col xs={24}>
                    <Card title="Creation Timeline" bordered={false}>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={la_creationTimeline}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="Products" stroke="#3f8600" strokeWidth={2} />
                                <Line type="monotone" dataKey="Brands" stroke="#1890ff" strokeWidth={2} />
                                <Line type="monotone" dataKey="Categories" stroke="#faad14" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Home;
