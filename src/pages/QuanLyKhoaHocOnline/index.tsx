import React, { useState, useMemo } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Select, 
  Tag, 
  Space, 
  Modal, 
  Form, 
  InputNumber, 
  Radio, 
  Card, 
  Typography,
  message,
  Popconfirm,
  Row,
  Col,
  Statistic,
  Empty
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  BookOutlined,
  UserOutlined,
  CheckCircleFilled,
  ClockCircleFilled,
  PauseCircleFilled,
  TeamOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { TextArea } = Input;

// Định nghĩa kiểu dữ liệu (Interfaces)
interface Course {
  id: string;
  name: string;
  instructor: string;
  students: number;
  status: 'OPEN' | 'CLOSED' | 'PAUSED';
  description?: string;
}

interface StatusConfig {
  label: string;
  color: string;
  dot: string;
  icon: React.ReactNode;
}

// Mock Data Giảng viên
const INITIAL_INSTRUCTORS: string[] = ["Nguyễn Văn A", "Trần Thị B", "Lê Văn C", "Phạm Minh D"];

const COURSE_STATUS: Record<string, StatusConfig> = {
  OPEN: { label: "Đang mở", color: "#f87171", dot: "#dc2626", icon: <CheckCircleFilled /> },
  CLOSED: { label: "Đã kết thúc", color: "#fecaca", dot: "#94a3b8", icon: <ClockCircleFilled /> },
  PAUSED: { label: "Tạm dừng", color: "#fee2e2", dot: "#f59e0b", icon: <PauseCircleFilled /> }
};

const INITIAL_COURSES: Course[] = [
  { id: 'C001', name: 'Lập trình React cơ bản', instructor: 'Nguyễn Văn A', students: 120, status: 'OPEN', description: 'Khóa học dành cho người mới bắt đầu.' },
  { id: 'C002', name: 'Thiết kế UI/UX hiện đại', instructor: 'Trần Thị B', students: 85, status: 'OPEN', description: 'Học về Figma và tư duy thiết kế.' },
  { id: 'C003', name: 'NodeJS và MongoDB', instructor: 'Lê Văn C', students: 0, status: 'PAUSED', description: 'Backend nâng cao.' },
  { id: 'C004', name: 'Kỹ năng giao tiếp', instructor: 'Nguyễn Văn A', students: 45, status: 'CLOSED', description: 'Khóa học đã hoàn thành xuất sắc.' },
];

const App: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterInstructor, setFilterInstructor] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [form] = Form.useForm<Course>();

  // Logic lọc dữ liệu
  const filteredData = useMemo(() => {
    return courses.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchInstructor = filterInstructor === 'All' || item.instructor === filterInstructor;
      const matchStatus = filterStatus === 'All' || item.status === filterStatus;
      return matchSearch && matchInstructor && matchStatus;
    });
  }, [courses, searchTerm, filterInstructor, filterStatus]);

  // Thống kê nhanh
  const stats = useMemo(() => {
    return {
      total: courses.length,
      students: courses.reduce((acc, curr) => acc + curr.students, 0),
      opening: courses.filter(c => c.status === 'OPEN').length
    };
  }, [courses]);

  const handleAddEdit = (values: Course) => {
    if (editingCourse) {
      setCourses(courses.map(c => c.id === editingCourse.id ? { ...values, id: c.id } : c));
      message.success('Cập nhật thành công');
    } else {
      const newCourse: Course = {
        ...values,
        id: `C${Math.floor(1000 + Math.random() * 9000)}`,
      };
      setCourses([newCourse, ...courses]);
      message.success('Đã thêm khóa học mới');
    }
    setIsModalOpen(false);
    setEditingCourse(null);
    form.resetFields();
  };

  const showModal = (course: Course | null = null) => {
    setEditingCourse(course);
    if (course) {
      form.setFieldsValue(course);
    } else {
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
    message.error('Đã xóa khóa học');
  };

  const columns: ColumnsType<Course> = [
    {
      title: 'MÃ KH',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (text: string) => <Text strong style={{ color: '#dc2626', fontFamily: 'monospace' }}>{text}</Text>,
    },
    {
      title: 'TÊN KHÓA HỌC',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong style={{ fontSize: '14px' }}>{text}</Text>,
    },
    {
      title: 'GIẢNG VIÊN',
      dataIndex: 'instructor',
      key: 'instructor',
      render: (text: string) => (
        <Space>
          <UserOutlined style={{ color: '#dc2626', opacity: 0.6 }} />
          <Text>{text}</Text>
        </Space>
      )
    },
    {
      title: 'HỌC VIÊN',
      dataIndex: 'students',
      key: 'students',
      align: 'center',
      sorter: (a, b) => a.students - b.students,
      render: (val: number) => <Text strong>{val.toLocaleString()}</Text>
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config = COURSE_STATUS[status as keyof typeof COURSE_STATUS];
        return (
          <Tag 
            style={{ 
              borderRadius: '20px', 
              padding: '2px 10px', 
              backgroundColor: '#fff', 
              border: `1px solid ${config.dot}`,
              color: config.dot,
              fontWeight: '600',
              fontSize: '11px'
            }}
          >
            {config.label.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'THAO TÁC',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            style={{ color: '#dc2626' }}
            onClick={() => showModal(record)}
          />
          <Popconfirm
            title="Xác nhận xóa"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              disabled={record.students > 0}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="v4-wrapper" style={{ minHeight: '100vh', backgroundColor: '#fff', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header & Stats Section */}
        <div style={{ marginBottom: '40px' }}>
          <Row gutter={[24, 24]} align="bottom">
            <Col xs={24} md={12}>
              <Space align="center" size="middle">
                <div style={{ width: '56px', height: '56px', backgroundColor: '#dc2626', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', boxShadow: '0 8px 16px rgba(220, 38, 38, 0.2)' }}>
                  <BookOutlined style={{ fontSize: '32px' }} />
                </div>
                <div>
                  <Title level={2} style={{ margin: 0, color: '#dc2626', fontWeight: 900, letterSpacing: '-1px', textTransform: 'uppercase' }}>
                    QUẢN LÝ KHÓA HỌC ONLINE
                  </Title>
                  <Text type="secondary" style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: 800, letterSpacing: '2px', color: '#ef4444' }}>
                    Hệ thống quản lý đào tạo
                  </Text>
                </div>
              </Space>
            </Col>
            <Col xs={24} md={12}>
              <Row gutter={16} justify="end">
                <Col>
                  <Card size="small" bordered={false} style={{ backgroundColor: '#fff5f5', borderRadius: '12px', minWidth: '120px' }}>
                    <Statistic 
                      title={<Text strong style={{ fontSize: '10px', color: '#b91c1c' }}>KHÓA HỌC</Text>} 
                      value={stats.total} 
                      prefix={<BookOutlined style={{ fontSize: '14px', color: '#dc2626' }} />}
                    />
                  </Card>
                </Col>
                <Col>
                  <Card size="small" bordered={false} style={{ backgroundColor: '#fff5f5', borderRadius: '12px', minWidth: '120px' }}>
                    <Statistic 
                      title={<Text strong style={{ fontSize: '10px', color: '#b91c1c' }}>HỌC VIÊN</Text>} 
                      value={stats.students} 
                      prefix={<TeamOutlined style={{ fontSize: '14px', color: '#dc2626' }} />}
                    />
                  </Card>
                </Col>
                <Col>
                  <Card size="small" bordered={false} style={{ backgroundColor: '#fff5f5', borderRadius: '12px', minWidth: '120px' }}>
                    <Statistic 
                      title={<Text strong style={{ fontSize: '10px', color: '#b91c1c' }}>ĐANG MỞ</Text>} 
                      value={stats.opening} 
                      valueStyle={{ color: '#dc2626' }}
                      prefix={<CheckCircleFilled style={{ fontSize: '14px' }} />}
                    />
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>

        {/* Action Bar */}
        <Card bordered={false} style={{ marginBottom: '24px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #fee2e2' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={10}>
              <Input 
                placeholder="Tìm kiếm tên khóa học nhanh..." 
                prefix={<SearchOutlined style={{ color: '#dc2626' }} />} 
                size="large"
                allowClear
                style={{ borderRadius: '10px' }}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col xs={12} md={5}>
              <Select
                placeholder="Giảng viên"
                style={{ width: '100%' }}
                size="large"
                defaultValue="All"
                suffixIcon={<UserOutlined style={{ color: '#dc2626' }}/>}
                onChange={setFilterInstructor}
              >
                <Select.Option value="All">Tất cả giảng viên</Select.Option>
                {INITIAL_INSTRUCTORS.map(i => <Select.Option key={i} value={i}>{i}</Select.Option>)}
              </Select>
            </Col>
            <Col xs={12} md={5}>
              <Select
                placeholder="Trạng thái"
                style={{ width: '100%' }}
                size="large"
                defaultValue="All"
                suffixIcon={<FilterOutlined style={{ color: '#dc2626' }}/>}
                onChange={setFilterStatus}
              >
                <Select.Option value="All">Mọi trạng thái</Select.Option>
                {Object.entries(COURSE_STATUS).map(([key, val]) => (
                  <Select.Option key={key} value={key}>{val.label}</Select.Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} md={4} style={{ textAlign: 'right' }}>
              <Button 
                type="primary" 
                size="large" 
                icon={<PlusOutlined />} 
                onClick={() => showModal()}
                style={{ width: '100%', fontWeight: 700, borderRadius: '10px', backgroundColor: '#dc2626', borderColor: '#dc2626' }}
              >
                THÊM MỚI
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Table Container */}
        <div className="table-container" style={{ border: '1px solid #fee2e2', borderRadius: '20px', overflow: 'hidden', backgroundColor: '#fff' }}>
          <Table 
            columns={columns} 
            dataSource={filteredData} 
            rowKey="id"
            locale={{ 
              emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không tìm thấy khóa học nào" /> 
            }}
            pagination={{ 
              pageSize: 7, 
              position: ['bottomCenter']
            }}
          />
        </div>
      </div>

      {/* Modal form */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: '#dc2626', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', marginRight: '10px' }}>
              {editingCourse ? <EditOutlined /> : <PlusOutlined />}
            </div>
            <Text strong style={{ color: '#dc2626', fontSize: '16px', textTransform: 'uppercase' }}>
              {editingCourse ? 'CẬP NHẬT THÔNG TIN' : 'TẠO KHÓA HỌC MỚI'}
            </Text>
          </div>
        }
        visible={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
        width={550}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddEdit}
          initialValues={{ status: 'OPEN', students: 0 }}
        >
          <Form.Item
            name="name"
            label={<Text strong>Tên khóa học</Text>}
            rules={[{ required: true, message: 'Vui lòng nhập tên khóa học' }]}
          >
            <Input placeholder="VD: Lập trình di động Flutter" size="large" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="instructor" label={<Text strong>Giảng viên</Text>}>
                <Select size="large">
                  {INITIAL_INSTRUCTORS.map(i => <Select.Option key={i} value={i}>{i}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="students" label={<Text strong>Số lượng học viên</Text>}>
                <InputNumber min={0} style={{ width: '100%' }} size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="status" label={<Text strong>Trạng thái vận hành</Text>}>
            <Radio.Group style={{ width: '100%' }} buttonStyle="solid">
              <Row gutter={8}>
                {Object.entries(COURSE_STATUS).map(([key, val]) => (
                  <Col span={8} key={key}>
                    <Radio.Button value={key} style={{ width: '100%', textAlign: 'center' }}>
                      {val.label}
                    </Radio.Button>
                  </Col>
                ))}
              </Row>
            </Radio.Group>
          </Form.Item>

          <Form.Item name="description" label={<Text strong>Mô tả tóm tắt</Text>}>
            <TextArea rows={3} placeholder="Ghi chú nội dung chính của khóa học..." />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: '32px', borderTop: '1px solid #fee2e2', paddingTop: '20px' }}>
            <Space size="middle">
              <Button onClick={() => setIsModalOpen(false)} size="large">
                HỦY
              </Button>
              <Button type="primary" htmlType="submit" size="large" style={{ backgroundColor: '#dc2626', borderColor: '#dc2626', fontWeight: 'bold' }}>
                XÁC NHẬN
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      <style>{`
        /* Ghi đè CSS cho Ant Design v4 */
        .v4-wrapper .ant-btn-primary {
          background-color: #dc2626;
          border-color: #dc2626;
        }
        .v4-wrapper .ant-btn-primary:hover, .v4-wrapper .ant-btn-primary:focus {
          background-color: #b91c1c;
          border-color: #b91c1c;
        }
        .v4-wrapper .ant-table-thead > tr > th {
          background-color: #fff !important;
          color: #dc2626 !important;
          font-weight: 800 !important;
          border-bottom: 2px solid #fee2e2 !important;
        }
        .v4-wrapper .ant-table-tbody > tr:hover > td {
          background-color: #fff5f5 !important;
        }
        .v4-wrapper .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
          color: #dc2626;
          border-color: #dc2626;
          background: #fff;
        }
        .v4-wrapper .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled)::before {
          background-color: #dc2626;
        }
        .v4-wrapper .ant-input:focus, .v4-wrapper .ant-input-focused, 
        .v4-wrapper .ant-select-focused:not(.ant-select-disabled).ant-select:not(.ant-select-customize-input) .ant-select-selector {
          border-color: #dc2626;
          box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.1);
        }
        .v4-wrapper .ant-pagination-item-active {
          border-color: #dc2626;
        }
        .v4-wrapper .ant-pagination-item-active a {
          color: #dc2626;
        }
      `}</style>
    </div>
  );
};

export default App;