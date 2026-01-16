import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Space, 
  message, 
  Popconfirm,
  Tag,
  Drawer,
  Dropdown,
  Upload,
  Image
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  GlobalOutlined,
  MoreOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { graphqlRequest } from './utils/graphqlClient';

const BrandCRUD = () => {
  const [la_brands, setLa_brands] = useState([]);
  const [lb_loading, setLb_loading] = useState(true);
  const [lb_modalVisible, setLb_modalVisible] = useState(false);
  const [lb_drawerVisible, setLb_drawerVisible] = useState(false);
  const [lo_selectedBrand, setLo_selectedBrand] = useState(null);
  const [ls_editingId, setLs_editingId] = useState(null);
  const [ls_searchText, setLs_searchText] = useState('');
  const [ls_logoUrl, setLs_logoUrl] = useState('');
  const [lo_form] = Form.useForm();

  const formatDate = (ls_dateString) => {
    if (!ls_dateString) return 'N/A';
    const ldate_date = new Date(parseInt(ls_dateString));
    if (isNaN(ldate_date.getTime())) return 'N/A';
    const ls_day = String(ldate_date.getDate()).padStart(2, '0');
    const ls_month = String(ldate_date.getMonth() + 1).padStart(2, '0');
    const li_year = ldate_date.getFullYear();
    return `${ls_day}-${ls_month}-${li_year}`;
  };

  const handleFileUpload = async (lo_info) => {
    const lo_file = lo_info.file.originFileObj || lo_info.file;
    
    const lo_formData = new FormData();
    lo_formData.append('file', lo_file);
    
    try {
      const ls_uploadEndpoint = import.meta.env.VITE_UPLOAD_ENDPOINT || 'http://localhost:4000/upload';
      const lo_response = await fetch(ls_uploadEndpoint, {
        method: 'POST',
        body: lo_formData,
      });
      
      const lo_result = await lo_response.json();
      
      if (lo_result.success) {
        const ls_apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
        const ls_fileUrl = `${ls_apiUrl}${lo_result.url}`;
        setLs_logoUrl(ls_fileUrl);
        lo_form.setFieldsValue({ logo: ls_fileUrl });
        message.success('Logo uploaded successfully!');
      } else {
        message.error('Failed to upload logo');
      }
    } catch (lo_error) {
      message.error('Error uploading file: ' + lo_error.message);
    }
  };

  const beforeUpload = (lo_file) => {
    const lb_isImage = lo_file.type.startsWith('image/');
    if (!lb_isImage) {
      message.error('You can only upload image files!');
      return false;
    }
    const lb_isLt2M = lo_file.size / 1024 / 1024 < 2;
    if (!lb_isLt2M) {
      message.error('Image must be smaller than 2MB!');
      return false;
    }
    return false; // Prevent auto upload, we'll handle it manually
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLb_loading(true);

    const ls_query = `
      query GetBrands {
        brands {
          id
          name
          country
          website
          logo
          createdAt
          updatedAt
        }
      }
    `;

    try {
      const lo_data = await graphqlRequest(ls_query);
      setLa_brands(lo_data.brands);
    } catch (lo_err) {
      message.error(lo_err.message);
    } finally {
      setLb_loading(false);
    }
  };

  const handleSubmit = async (lo_values) => {
    const ls_mutation = ls_editingId
      ? `
        mutation UpdateBrand($id: ID!, $name: String, $country: String, $website: String, $logo: String) {
          updateBrand(id: $id, name: $name, country: $country, website: $website, logo: $logo) {
            id
            name
            country
            website
            logo
          }
        }
      `
      : `
        mutation CreateBrand($name: String!, $country: String, $website: String, $logo: String) {
          createBrand(name: $name, country: $country, website: $website, logo: $logo) {
            id
            name
            country
            website
            logo
          }
        }
      `;

    const lo_variables = ls_editingId ? { id: ls_editingId, ...lo_values } : lo_values;

    try {
      await graphqlRequest(ls_mutation, lo_variables);

      message.success(ls_editingId ? 'Brand updated successfully!' : 'Brand created successfully!');
      setLb_modalVisible(false);
      setLs_editingId(null);
      lo_form.resetFields();
      fetchBrands();
    } catch (lo_err) {
      // Check for duplicate key error
      if (lo_err.message.includes('E11000') || lo_err.message.includes('duplicate key')) {
        if (lo_err.message.includes('name')) {
          message.error('A brand with this name already exists. Please use a different name.');
        } else {
          message.error('This brand already exists. Please use different values.');
        }
      } else {
        message.error(lo_err.message || 'Failed to save brand');
      }
    }
  };

  const handleEdit = (lo_record) => {
    setLs_editingId(lo_record.id);
    setLs_logoUrl(lo_record.logo || '');
    lo_form.setFieldsValue(lo_record);
    setLb_modalVisible(true);
  };

  const handleDelete = async (ls_id) => {
    const ls_mutation = `
      mutation DeleteBrand($id: ID!) {
        deleteBrand(id: $id)
      }
    `;

    try {
      await graphqlRequest(ls_mutation, { id: ls_id });

      message.success('Brand deleted successfully!');
      fetchBrands();
    } catch (lo_err) {
      message.error(lo_err.message);
    }
  };

  const handleViewDetails = (lo_record) => {
    setLo_selectedBrand(lo_record);
    setLb_drawerVisible(true);
  };

  const handleAddNew = () => {
    setLs_editingId(null);
    setLs_logoUrl('');
    lo_form.resetFields();
    setLb_modalVisible(true);
  };

  const la_filteredBrands = la_brands.filter((lo_brand) =>
    lo_brand.name.toLowerCase().includes(ls_searchText.toLowerCase()) ||
    (lo_brand.country && lo_brand.country.toLowerCase().includes(ls_searchText.toLowerCase()))
  );

  const la_columns = [
    {
      title: 'Brand Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (lo_a, lo_b) => lo_a.name.localeCompare(lo_b.name),
    },
    {
      title: 'Country',
      dataIndex: 'country',
      key: 'country',
      render: (ls_country) => ls_country || <Tag>Not specified</Tag>,
    },
    {
      title: 'Website',
      dataIndex: 'website',
      key: 'website',
      render: (ls_website) => ls_website ? (
        <a href={ls_website} target="_blank" rel="noopener noreferrer">
          <GlobalOutlined /> Visit
        </a>
      ) : '-',
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (ls_date) => formatDate(ls_date),
      sorter: (lo_a, lo_b) => {
        const ldate_dateA = new Date(parseInt(lo_a.createdAt));
        const ldate_dateB = new Date(parseInt(lo_b.createdAt));
        return ldate_dateA - ldate_dateB;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      render: (_, lo_record) => {
        const la_items = [
          {
            key: 'view',
            label: 'View Details',
            icon: <EyeOutlined />,
            onClick: () => handleViewDetails(lo_record),
          },
          {
            key: 'edit',
            label: 'Edit',
            icon: <EditOutlined />,
            onClick: () => handleEdit(lo_record),
          },
          {
            type: 'divider',
          },
          {
            key: 'delete',
            label: 'Delete',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => {
              Modal.confirm({
                title: 'Are you sure you want to delete this brand?',
                content: `Brand: ${lo_record.name}`,
                okText: 'Yes',
                okType: 'danger',
                cancelText: 'No',
                onOk: () => handleDelete(lo_record.id),
              });
            },
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
    <div>
      <Card
        title="Brand Management"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>
            Add New Brand
          </Button>
        }
      >
        <Input
          placeholder="Search brands..."
          prefix={<SearchOutlined />}
          value={ls_searchText}
          onChange={(lo_e) => setLs_searchText(lo_e.target.value)}
          style={{ marginBottom: 16, maxWidth: 400 }}
        />

        <Table
          columns={la_columns}
          dataSource={la_filteredBrands}
          rowKey="id"
          loading={lb_loading}
          scroll={{ x: 'max-content' }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (li_total) => `Total ${li_total} brands`,
          }}
        />
      </Card>

      <Modal
        title={ls_editingId ? 'Edit Brand' : 'Add New Brand'}
        open={lb_modalVisible}
        onCancel={() => {
          setLb_modalVisible(false);
          setLs_editingId(null);
          lo_form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={lo_form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Brand Name"
            rules={[{ required: true, message: 'Please enter brand name' }]}
          >
            <Input placeholder="Enter brand name" />
          </Form.Item>

          <Form.Item
            name="country"
            label="Country"
          >
            <Input placeholder="Enter country" />
          </Form.Item>

          <Form.Item
            name="website"
            label="Website"
            rules={[{ type: 'url', message: 'Please enter a valid URL' }]}
          >
            <Input placeholder="https://example.com" />
          </Form.Item>

          <Form.Item
            name="logo"
            label="Logo"
            hidden
          >
            <Input />
          </Form.Item>

          <Form.Item label="Upload Logo">
            <Upload
              beforeUpload={beforeUpload}
              onChange={handleFileUpload}
              maxCount={1}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>Select Logo File</Button>
            </Upload>
            {ls_logoUrl && (
              <div style={{ marginTop: 8 }}>
                <Image
                  src={ls_logoUrl}
                  alt="Brand Logo Preview"
                  style={{ maxWidth: '200px', maxHeight: '100px', objectFit: 'contain' }}
                />
              </div>
            )}
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {ls_editingId ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => {
                setLb_modalVisible(false);
                setLs_editingId(null);
                setLs_logoUrl('');
                lo_form.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="Brand Details"
        placement="right"
        onClose={() => setLb_drawerVisible(false)}
        open={lb_drawerVisible}
        width={500}
      >
        {lo_selectedBrand && (
          <div>
            {lo_selectedBrand.logo && (
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <img 
                  src={lo_selectedBrand.logo} 
                  alt={lo_selectedBrand.name} 
                  style={{ maxWidth: '100%', maxHeight: 150, objectFit: 'contain' }}
                />
              </div>
            )}
            
            <h2>{lo_selectedBrand.name}</h2>
            
            <div style={{ marginTop: 16 }}>
              <p><strong>Country:</strong> {lo_selectedBrand.country || 'Not specified'}</p>
              <p><strong>Website:</strong> {lo_selectedBrand.website ? (
                <a href={lo_selectedBrand.website} target="_blank" rel="noopener noreferrer">
                  {lo_selectedBrand.website}
                </a>
              ) : 'Not specified'}</p>
              <p><strong>Created:</strong> {formatDate(lo_selectedBrand.createdAt)}</p>
              <p><strong>Last Updated:</strong> {formatDate(lo_selectedBrand.updatedAt)}</p>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default BrandCRUD;
