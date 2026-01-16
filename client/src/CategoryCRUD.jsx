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
  FolderOutlined,
  MoreOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { graphqlRequest } from './utils/graphqlClient';

const { TextArea } = Input;

const CategoryCRUD = () => {
  const [la_categories, setLa_categories] = useState([]);
  const [lb_loading, setLb_loading] = useState(true);
  const [lb_modalVisible, setLb_modalVisible] = useState(false);
  const [lb_drawerVisible, setLb_drawerVisible] = useState(false);
  const [lo_selectedCategory, setLo_selectedCategory] = useState(null);
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
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLb_loading(true);

    const ls_query = `
      query GetCategories {
        categories {
          id
          name
          description
          slug
          logo
          createdAt
          updatedAt
        }
      }
    `;

    try {
      const lo_data = await graphqlRequest(ls_query);
      setLa_categories(lo_data.categories);
    } catch (lo_err) {
      message.error(lo_err.message);
    } finally {
      setLb_loading(false);
    }
  };

  const generateSlug = (ls_name) => {
    return ls_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (lo_e) => {
    const ls_name = lo_e.target.value;
    lo_form.setFieldsValue({
      name: ls_name,
      slug: generateSlug(ls_name),
    });
  };

  const handleSubmit = async (lo_values) => {
    const ls_mutation = ls_editingId
      ? `
        mutation UpdateCategory($id: ID!, $name: String, $description: String, $slug: String, $logo: String) {
          updateCategory(id: $id, name: $name, description: $description, slug: $slug, logo: $logo) {
            id
            name
            description
            slug
            logo
          }
        }
      `
      : `
        mutation CreateCategory($name: String!, $description: String, $slug: String!, $logo: String) {
          createCategory(name: $name, description: $description, slug: $slug, logo: $logo) {
            id
            name
            description
            slug
            logo
          }
        }
      `;

    const lo_variables = ls_editingId ? { id: ls_editingId, ...lo_values } : lo_values;

    try {
      await graphqlRequest(ls_mutation, lo_variables);

      message.success(ls_editingId ? 'Category updated successfully!' : 'Category created successfully!');
      setLb_modalVisible(false);
      setLs_editingId(null);
      lo_form.resetFields();
      fetchCategories();
    } catch (lo_err) {
      // Check for duplicate key error
      if (lo_err.message.includes('E11000') || lo_err.message.includes('duplicate key')) {
        if (lo_err.message.includes('name')) {
          message.error('A category with this name already exists. Please use a different name.');
        } else if (lo_err.message.includes('slug')) {
          message.error('A category with this slug already exists. Please use a different slug.');
        } else {
          message.error('This category already exists. Please use different values.');
        }
      } else {
        message.error(lo_err.message || 'Failed to save category');
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
      mutation DeleteCategory($id: ID!) {
        deleteCategory(id: $id)
      }
    `;

    try {
      await graphqlRequest(ls_mutation, { id: ls_id });

      message.success('Category deleted successfully!');
      fetchCategories();
    } catch (lo_err) {
      message.error(lo_err.message);
    }
  };

  const handleViewDetails = (lo_record) => {
    setLo_selectedCategory(lo_record);
    setLb_drawerVisible(true);
  };

  const handleAddNew = () => {
    setLs_editingId(null);
    setLs_logoUrl('');
    lo_form.resetFields();
    setLb_modalVisible(true);
  };

  const la_filteredCategories = la_categories.filter((lo_category) =>
    lo_category.name.toLowerCase().includes(ls_searchText.toLowerCase()) ||
    (lo_category.description && lo_category.description.toLowerCase().includes(ls_searchText.toLowerCase())) ||
    lo_category.slug.toLowerCase().includes(ls_searchText.toLowerCase())
  );

  const la_columns = [
    {
      title: 'Category Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (lo_a, lo_b) => lo_a.name.localeCompare(lo_b.name),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (ls_description) => ls_description || <Tag>No description</Tag>,
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      render: (ls_slug) => <Tag color="blue">{ls_slug}</Tag>,
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
                title: 'Are you sure you want to delete this category?',
                content: `Category: ${lo_record.name}`,
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
        title="Category Management"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>
            Add New Category
          </Button>
        }
      >
        <Input
          placeholder="Search categories..."
          prefix={<SearchOutlined />}
          value={ls_searchText}
          onChange={(lo_e) => setLs_searchText(lo_e.target.value)}
          style={{ marginBottom: 16, maxWidth: 400 }}
        />

        <Table
          columns={la_columns}
          dataSource={la_filteredCategories}
          rowKey="id"
          loading={lb_loading}
          scroll={{ x: 'max-content' }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (li_total) => `Total ${li_total} categories`,
          }}
        />
      </Card>

      <Modal
        title={ls_editingId ? 'Edit Category' : 'Add New Category'}
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
            label="Category Name"
            rules={[{ required: true, message: 'Please enter category name' }]}
          >
            <Input placeholder="Enter category name" onChange={handleNameChange} />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} placeholder="Enter category description" />
          </Form.Item>

          <Form.Item
            name="slug"
            label="Slug"
            rules={[{ required: true, message: 'Please enter slug' }]}
            extra="Auto-generated from name, but you can customize it"
          >
            <Input placeholder="category-slug" />
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
                  alt="Category Logo Preview"
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
        title="Category Details"
        placement="right"
        onClose={() => setLb_drawerVisible(false)}
        open={lb_drawerVisible}
        width={500}
      >
        {lo_selectedCategory && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              {lo_selectedCategory.logo ? (
                <Image
                  src={lo_selectedCategory.logo}
                  alt={lo_selectedCategory.name}
                  style={{ maxWidth: '100%', maxHeight: 150, objectFit: 'contain' }}
                />
              ) : (
                <FolderOutlined style={{ fontSize: 64, color: '#faad14' }} />
              )}
            </div>
            
            <h2>{lo_selectedCategory.name}</h2>
            
            <div style={{ marginTop: 16 }}>
              <p><strong>Description:</strong> {lo_selectedCategory.description || 'No description'}</p>
              <p><strong>Slug:</strong> <Tag color="blue">{lo_selectedCategory.slug}</Tag></p>
              <p><strong>Created:</strong> {formatDate(lo_selectedCategory.createdAt)}</p>
              <p><strong>Last Updated:</strong> {formatDate(lo_selectedCategory.updatedAt)}</p>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default CategoryCRUD;
