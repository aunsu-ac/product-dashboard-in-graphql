import { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    InputNumber,
    Select,
    Upload,
    Space,
    Drawer,
    Descriptions,
    Tag,
    Image,
    message,
    Popconfirm,
    Dropdown,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    MoreOutlined,
    UploadOutlined,
    CloseOutlined,
} from '@ant-design/icons';
import { graphqlRequest } from './utils/graphqlClient';

const { TextArea } = Input;

const ProductCRUD = () => {
    const [la_products, setLa_products] = useState([]);
    const [la_categories, setLa_categories] = useState([]);
    const [la_brands, setLa_brands] = useState([]);
    const [lb_loading, setLb_loading] = useState(false);
    const [lb_modalVisible, setLb_modalVisible] = useState(false);
    const [lb_drawerVisible, setLb_drawerVisible] = useState(false);
    const [lo_selectedProduct, setLo_selectedProduct] = useState(null);
    const [ls_editingId, setLs_editingId] = useState(null);
    const [ls_searchText, setLs_searchText] = useState('');
    const [ls_imageUrl, setLs_imageUrl] = useState('');
    const [la_specifications, setLa_specifications] = useState([{ key: '', value: '' }]);
    const [lo_form] = Form.useForm();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLb_loading(true);
        try {
            const ls_query = `
        query {
          products {
            id
            name
            description
            price
            stock
            imageUrl
            specifications {
              key
              value
            }
            category {
              id
              name
              slug
            }
            brand {
              id
              name
              country
            }
            createdAt
            updatedAt
          }
        }
      `;
            const lo_data = await graphqlRequest(ls_query);
            setLa_products(lo_data.products);
        } catch (lo_error) {
            message.error('Failed to fetch products');
            console.error(lo_error);
        } finally {
            setLb_loading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const ls_query = `
        query {
          categories {
            id
            name
            slug
          }
        }
      `;
            const lo_data = await graphqlRequest(ls_query);
            setLa_categories(lo_data.categories);
        } catch (lo_error) {
            message.error('Failed to fetch categories');
            console.error(lo_error);
        }
    };

    const fetchBrands = async () => {
        try {
            const ls_query = `
        query {
          brands {
            id
            name
            country
          }
        }
      `;
            const lo_data = await graphqlRequest(ls_query);
            setLa_brands(lo_data.brands);
        } catch (lo_error) {
            message.error('Failed to fetch brands');
            console.error(lo_error);
        }
    };

    const handleFileUpload = async (lo_file) => {
        const lo_formData = new FormData();
        lo_formData.append('file', lo_file);

        try {
            const ls_uploadEndpoint = import.meta.env.VITE_UPLOAD_ENDPOINT || 'http://localhost:4000/upload';
            const lo_response = await fetch(ls_uploadEndpoint, {
                method: 'POST',
                body: lo_formData,
            });

            if (!lo_response.ok) {
                throw new Error('Upload failed');
            }

            const lo_data = await lo_response.json();
            const ls_apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
            const ls_fullUrl = `${ls_apiUrl}${lo_data.url}`;
            setLs_imageUrl(ls_fullUrl);
            lo_form.setFieldsValue({ imageUrl: ls_fullUrl });
            message.success('Image uploaded successfully');
            return false;
        } catch (lo_error) {
            message.error('Failed to upload image');
            console.error(lo_error);
            return false;
        }
    };

    const handleAddSpecification = () => {
        setLa_specifications([...la_specifications, { key: '', value: '' }]);
    };

    const handleRemoveSpecification = (li_index) => {
        const la_newSpecs = la_specifications.filter((_, li_i) => li_i !== li_index);
        setLa_specifications(la_newSpecs);
    };

    const handleSpecificationChange = (li_index, ls_field, ls_value) => {
        const la_newSpecs = [...la_specifications];
        la_newSpecs[li_index][ls_field] = ls_value;
        setLa_specifications(la_newSpecs);
    };

    const showModal = async (lo_product = null) => {
        // Fetch categories and brands when modal opens
        await Promise.all([fetchCategories(), fetchBrands()]);
        
        if (lo_product) {
            setLs_editingId(lo_product.id);
            setLs_imageUrl(lo_product.imageUrl || '');

            // Convert specifications array to form format
            const la_specs = lo_product.specifications && lo_product.specifications.length > 0
                ? lo_product.specifications.map(lo_spec => ({ key: lo_spec.key, value: lo_spec.value }))
                : [{ key: '', value: '' }];
            setLa_specifications(la_specs);

            lo_form.setFieldsValue({
                name: lo_product.name,
                description: lo_product.description,
                price: lo_product.price,
                stock: lo_product.stock,
                categoryId: lo_product.category?.id,
                brandId: lo_product.brand?.id,
                imageUrl: lo_product.imageUrl,
            });
        } else {
            setLs_editingId(null);
            setLs_imageUrl('');
            setLa_specifications([{ key: '', value: '' }]);
            lo_form.resetFields();
        }
        setLb_modalVisible(true);
    };

    const handleSubmit = async () => {
        try {
            const lo_values = await lo_form.validateFields();

            // Convert specifications to array format, filtering out empty entries
            const la_validSpecs = la_specifications.filter(
                lo_spec => lo_spec.key.trim() !== '' && lo_spec.value.trim() !== ''
            );

            const lo_specificationsInput = la_validSpecs.map(lo_spec =>
                `{ key: "${lo_spec.key}", value: "${lo_spec.value}" }`
            ).join(', ');

            if (ls_editingId) {
                const ls_mutation = `
          mutation {
            updateProduct(
              id: "${ls_editingId}"
              name: "${lo_values.name}"
              description: "${lo_values.description}"
              price: ${lo_values.price}
              stock: ${lo_values.stock}
              categoryId: "${lo_values.categoryId}"
              brandId: "${lo_values.brandId}"
              ${lo_values.imageUrl ? `imageUrl: "${lo_values.imageUrl}"` : ''}
              ${la_validSpecs.length > 0 ? `specifications: [${lo_specificationsInput}]` : ''}
            ) {
              id
              name
            }
          }
        `;
                await graphqlRequest(ls_mutation);
                message.success('Product updated successfully');
            } else {
                const ls_mutation = `
          mutation {
            createProduct(
              name: "${lo_values.name}"
              description: "${lo_values.description}"
              price: ${lo_values.price}
              stock: ${lo_values.stock}
              categoryId: "${lo_values.categoryId}"
              brandId: "${lo_values.brandId}"
              ${lo_values.imageUrl ? `imageUrl: "${lo_values.imageUrl}"` : ''}
              ${la_validSpecs.length > 0 ? `specifications: [${lo_specificationsInput}]` : ''}
            ) {
              id
              name
            }
          }
        `;
                await graphqlRequest(ls_mutation);
                message.success('Product created successfully');
            }

            setLb_modalVisible(false);
            lo_form.resetFields();
            setLs_imageUrl('');
            setLa_specifications([{ key: '', value: '' }]);
            fetchProducts();
        } catch (lo_error) {
            message.error('Operation failed');
            console.error(lo_error);
        }
    };

    const handleDelete = async (ls_id) => {
        try {
            const ls_mutation = `
        mutation {
          deleteProduct(id: "${ls_id}")
        }
      `;
            await graphqlRequest(ls_mutation);
            message.success('Product deleted successfully');
            fetchProducts();
        } catch (lo_error) {
            message.error('Failed to delete product');
            console.error(lo_error);
        }
    };

    const showDrawer = (lo_product) => {
        setLo_selectedProduct(lo_product);
        setLb_drawerVisible(true);
    };

    const la_columns = [
        {
            title: 'Image',
            dataIndex: 'imageUrl',
            key: 'imageUrl',
            width: 80,
            render: (ls_url) => (
                <Image
                    width={50}
                    height={50}
                    src={ls_url || 'https://via.placeholder.com/50'}
                    alt="product"
                    style={{ objectFit: 'cover', borderRadius: 4 }}
                />
            ),
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            filteredValue: [ls_searchText],
            onFilter: (ls_value, lo_record) =>
                lo_record.name.toLowerCase().includes(ls_value.toLowerCase()) ||
                lo_record.category?.name.toLowerCase().includes(ls_value.toLowerCase()) ||
                lo_record.brand?.name.toLowerCase().includes(ls_value.toLowerCase()),
        },
        {
            title: 'Category',
            dataIndex: ['category', 'name'],
            key: 'category',
            render: (ls_name) => <Tag color="blue">{ls_name}</Tag>,
        },
        {
            title: 'Brand',
            dataIndex: ['brand', 'name'],
            key: 'brand',
            render: (ls_name) => <Tag color="green">{ls_name}</Tag>,
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (lf_price) => `$${lf_price.toFixed(2)}`,
            sorter: (lo_a, lo_b) => lo_a.price - lo_b.price,
        },
        {
            title: 'Stock',
            dataIndex: 'stock',
            key: 'stock',
            sorter: (lo_a, lo_b) => lo_a.stock - lo_b.stock,
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 100,
            render: (_, lo_record) => {
                const la_items = [
                    {
                        key: 'view',
                        label: 'View Details',
                        icon: <EyeOutlined />,
                        onClick: () => showDrawer(lo_record),
                    },
                    {
                        key: 'edit',
                        label: 'Edit',
                        icon: <EditOutlined />,
                        onClick: () => showModal(lo_record),
                    },
                    {
                        key: 'delete',
                        label: 'Delete',
                        icon: <DeleteOutlined />,
                        danger: true,
                        onClick: () => handleDelete(lo_record.id),
                    },
                ];

                return (
                    <Dropdown menu={{ items: la_items }} trigger={['click']}>
                        <Button type="text" icon={<MoreOutlined />} />
                    </Dropdown>
                );
            },
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Input.Search
                    placeholder="Search products, categories, or brands..."
                    allowClear
                    style={{ width: 400 }}
                    onChange={(e) => setLs_searchText(e.target.value)}
                />
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => showModal()}
                >
                    Add Product
                </Button>
            </div>

            <Table
                columns={la_columns}
                dataSource={la_products}
                rowKey="id"
                loading={lb_loading}
                pagination={{
                    pageSize: 10,
                    showTotal: (li_total) => `Total ${li_total} products`,
                }}
            />

            <Modal
                title={ls_editingId ? 'Edit Product' : 'Add Product'}
                open={lb_modalVisible}
                onOk={handleSubmit}
                onCancel={() => {
                    setLb_modalVisible(false);
                    lo_form.resetFields();
                    setLs_imageUrl('');
                    setLa_specifications([{ key: '', value: '' }]);
                }}
                width={800}
                okText={ls_editingId ? 'Update' : 'Create'}
            >
                <Form form={lo_form} layout="vertical" style={{ marginTop: 20 }}>
                    <Form.Item
                        name="name"
                        label="Product Name"
                        rules={[{ required: true, message: 'Please enter product name' }]}
                    >
                        <Input placeholder="Enter product name" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{ required: true, message: 'Please enter description' }]}
                    >
                        <TextArea rows={3} placeholder="Enter product description" />
                    </Form.Item>

                    <Space style={{ width: '100%' }} size="large">
                        <Form.Item
                            name="price"
                            label="Price ($)"
                            rules={[{ required: true, message: 'Please enter price' }]}
                            style={{ width: 180 }}
                        >
                            <InputNumber
                                min={0}
                                step={0.01}
                                placeholder="0.00"
                                style={{ width: '100%' }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="stock"
                            label="Stock"
                            rules={[{ required: true, message: 'Please enter stock' }]}
                            style={{ width: 150 }}
                        >
                            <InputNumber min={0} placeholder="0" style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item name="imageUrl" label="Product Image" style={{ display: 'none' }}>
                            <Input />
                        </Form.Item>

                        <Form.Item label="Upload Image">
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Upload
                                    beforeUpload={handleFileUpload}
                                    showUploadList={false}
                                    accept="image/*"
                                >
                                    <Button icon={<UploadOutlined />}>Click to Upload Image</Button>
                                </Upload>
                                {ls_imageUrl && (
                                    <Image
                                        src={ls_imageUrl}
                                        alt="Product preview"
                                        width={200}
                                        style={{ marginTop: 10 }}
                                    />
                                )}
                            </Space>
                        </Form.Item>
                    </Space>

                    <Space style={{ width: '100%' }} size="large">
                        <Form.Item
                            name="categoryId"
                            label="Category"
                            rules={[{ required: true, message: 'Please select a category' }]}
                            style={{ width: 250 }}
                        >
                            <Select placeholder="Select category" showSearch optionFilterProp="children">
                                {la_categories.map((lo_category) => (
                                    <Select.Option key={lo_category.id} value={lo_category.id}>
                                        {lo_category.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="brandId"
                            label="Brand"
                            rules={[{ required: true, message: 'Please select a brand' }]}
                            style={{ width: 250 }}
                        >
                            <Select placeholder="Select brand" showSearch optionFilterProp="children">
                                {la_brands.map((lo_brand) => (
                                    <Select.Option key={lo_brand.id} value={lo_brand.id}>
                                        {lo_brand.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Space>

                    <Form.Item label="Specifications">
                        <Space direction="vertical" style={{ width: '100%' }}>
                            {la_specifications.map((lo_spec, li_index) => (
                                <Space key={li_index} style={{ width: '100%', marginBottom: 8 }}>
                                    <Input
                                        placeholder="Key (e.g., Display)"
                                        value={lo_spec.key}
                                        onChange={(e) => handleSpecificationChange(li_index, 'key', e.target.value)}
                                        style={{ width: 200 }}
                                    />
                                    <Input
                                        placeholder="Value (e.g., 6.1-inch OLED)"
                                        value={lo_spec.value}
                                        onChange={(e) => handleSpecificationChange(li_index, 'value', e.target.value)}
                                        style={{ width: 350 }}
                                    />
                                    {la_specifications.length > 1 && (
                                        <Button
                                            type="text"
                                            danger
                                            icon={<CloseOutlined />}
                                            onClick={() => handleRemoveSpecification(li_index)}
                                        />
                                    )}
                                </Space>
                            ))}
                            <Button
                                type="dashed"
                                onClick={handleAddSpecification}
                                icon={<PlusOutlined />}
                                style={{ width: '100%' }}
                            >
                                Add Specification
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            <Drawer
                title="Product Details"
                placement="right"
                onClose={() => setLb_drawerVisible(false)}
                open={lb_drawerVisible}
                width={600}
            >
                {lo_selectedProduct && (
                    <>
                        {lo_selectedProduct.imageUrl && (
                            <Image
                                src={lo_selectedProduct.imageUrl}
                                alt={lo_selectedProduct.name}
                                style={{ width: '100%', marginBottom: 20, borderRadius: 8 }}
                            />
                        )}
                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="Name">{lo_selectedProduct.name}</Descriptions.Item>
                            <Descriptions.Item label="Description">
                                {lo_selectedProduct.description}
                            </Descriptions.Item>
                            <Descriptions.Item label="Category">
                                <Tag color="blue">{lo_selectedProduct.category?.name}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Brand">
                                <Tag color="green">{lo_selectedProduct.brand?.name}</Tag>
                                {lo_selectedProduct.brand?.country && ` (${lo_selectedProduct.brand.country})`}
                            </Descriptions.Item>
                            <Descriptions.Item label="Price">
                                ${lo_selectedProduct.price.toFixed(2)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Stock">{lo_selectedProduct.stock}</Descriptions.Item>
                            {lo_selectedProduct.specifications && lo_selectedProduct.specifications.length > 0 && (
                                <Descriptions.Item label="Specifications">
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        {lo_selectedProduct.specifications.map((lo_spec, li_index) => (
                                            <div key={li_index} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <strong>{lo_spec.key}:</strong>
                                                <span>{lo_spec.value}</span>
                                            </div>
                                        ))}
                                    </Space>
                                </Descriptions.Item>
                            )}
                            <Descriptions.Item label="Created">
                                {new Date(parseInt(lo_selectedProduct.createdAt)).toLocaleDateString()}
                            </Descriptions.Item>
                            <Descriptions.Item label="Updated">
                                {new Date(parseInt(lo_selectedProduct.updatedAt)).toLocaleDateString()}
                            </Descriptions.Item>
                        </Descriptions>
                    </>
                )}
            </Drawer>
        </div>
    );
};

export default ProductCRUD;
