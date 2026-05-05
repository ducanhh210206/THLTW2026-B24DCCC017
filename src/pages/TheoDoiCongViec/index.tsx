import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Layout, 
  Menu, 
  Card, 
  Col, 
  Row, 
  Statistic, 
  Table, 
  Tag, 
  Button, 
  Modal, 
  Form, 
  Input, 
  DatePicker, 
  Select, 
  Typography, 
  Space, 
  Badge, 
  message,
  Avatar,
  Progress,
  Divider
} from 'antd';
import { 
  DashboardOutlined, 
  ProjectOutlined, 
  UnorderedListOutlined, 
  PlusOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  BellOutlined,
  MoreOutlined,
  CalendarOutlined,
  FireOutlined,
  SafetyCertificateOutlined,
  RocketOutlined,
  HeartOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

// --- Interfaces & Types ---

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'doing' | 'done';
  priority: 'high' | 'medium' | 'low';
  deadline: string;
  tags: string[];
}

interface ColumnConfig {
  title: string;
  color: string;
  bg: string;
  icon: React.ReactNode;
}

interface PriorityTheme {
  color: string;
  label: string;
  dot: string;
}

// --- Constants ---

const STORAGE_KEY = 'focusflow-tasks-premium-red-ts';

const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Xây dựng thương hiệu sản phẩm',
    description: 'Thiết kế bộ nhận diện thương hiệu với tông màu đỏ chủ đạo.',
    status: 'doing',
    priority: 'high',
    deadline: dayjs().add(1, 'day').format('YYYY-MM-DD'),
    tags: ['Branding', 'Design']
  },
  {
    id: '2',
    title: 'Phát triển module thanh toán',
    description: 'Tích hợp cổng thanh toán và kiểm tra luồng tiền tệ.',
    status: 'todo',
    priority: 'medium',
    deadline: dayjs().add(4, 'day').format('YYYY-MM-DD'),
    tags: ['Dev', 'Finance']
  }
];

const COLUMNS: Record<Task['status'], ColumnConfig> = {
  todo: { title: 'Sắp tới', color: '#e11d48', bg: '#fff1f2', icon: <CalendarOutlined /> },
  doing: { title: 'Đang làm', color: '#be123c', bg: '#fff1f2', icon: <FireOutlined /> },
  done: { title: 'Hoàn tất', color: '#9f1239', bg: '#fff1f2', icon: <SafetyCertificateOutlined /> }
};

const PRIORITY_THEME: Record<Task['priority'], PriorityTheme> = {
  high: { color: '#fb7185', label: 'Khẩn cấp', dot: '#e11d48' },
  medium: { color: '#fda4af', label: 'Quan trọng', dot: '#fb7185' },
  low: { color: '#fecdd3', label: 'Bình thường', dot: '#fda4af' }
};

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch (e) {
      return INITIAL_TASKS;
    }
  });
  
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState<string>('');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dropTargetStatus, setDropTargetStatus] = useState<Task['status'] | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'done').length;
    const active = tasks.filter(t => t.status === 'doing').length;
    const overdue = tasks.filter(t => t.status !== 'done' && dayjs(t.deadline).isBefore(dayjs(), 'day')).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, active, overdue, percent };
  }, [tasks]);

  const handleSaveTask = useCallback((values: any) => {
    const taskData: Task = {
      ...values,
      deadline: values.deadline.format('YYYY-MM-DD'),
      id: editingTask ? editingTask.id : Math.random().toString(36).substr(2, 9),
      tags: values.tags || []
    };

    setTasks(prevTasks => {
      if (editingTask) {
        return prevTasks.map(t => t.id === editingTask.id ? taskData : t);
      }
      return [taskData, ...prevTasks];
    });

    message.success({ 
      content: editingTask ? 'Cập nhật thành công!' : 'Nhiệm vụ mới đã sẵn sàng!', 
      style: { marginTop: '10vh' }
    });
    setIsModalVisible(false);
    setEditingTask(null);
    form.resetFields();
  }, [editingTask, form]);

  const handleDeleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    message.error('Đã xóa nhiệm vụ');
  }, []);

  const showEditModal = useCallback((task: Task) => {
    setEditingTask(task);
    form.setFieldsValue({ 
      ...task, 
      deadline: dayjs(task.deadline), 
      tags: task.tags || [] 
    });
    setIsModalVisible(true);
  }, [form]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.setData("taskId", id);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: Task['status']) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("taskId") || draggedTaskId;
    if (id) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: targetStatus } : t));
    }
    setDraggedTaskId(null);
    setDropTargetStatus(null);
  };

  const DashboardView = () => (
    <div className="p-8 lg:p-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-8">
        <div className="max-w-2xl">
          <Badge status="processing" color="#e11d48" text={<Text className="text-rose-500 font-black uppercase tracking-[0.3em] text-[10px]">Hệ thống FocusFlow</Text>} />
          <Title level={1} className="m-0 mt-2 font-black text-slate-900 tracking-tight leading-tight">
            Hiệu suất làm việc <br /> <span className="text-rose-600">tăng gấp đôi</span> hôm nay.
          </Title>
        </div>
        <div className="bg-white p-6 rounded-[40px] shadow-[0_20px_50px_rgba(225,29,72,0.1)] flex items-center gap-8 border border-rose-50">
          <div className="relative">
            <Progress 
              type="circle" 
              percent={stats.percent} 
              width={85} 
              strokeColor={{ '0%': '#e11d48', '100%': '#fb7185' }} 
              trailColor="#fff1f2"
              strokeWidth={10}
              format={p => <span className="text-slate-900 font-black text-lg">{p}%</span>}
            />
          </div>
          <div>
            <Title level={4} className="m-0 font-black text-slate-900">{stats.completed} / {stats.total}</Title>
            <Text className="text-slate-400 font-medium">Nhiệm vụ hoàn tất</Text>
          </div>
        </div>
      </div>

      <Row gutter={[32, 32]}>
        {[
          { label: 'Tổng nhiệm vụ', val: stats.total, icon: <RocketOutlined />, bg: 'bg-rose-500', text: 'text-white' },
          { label: 'Đang triển khai', val: stats.active, icon: <FireOutlined />, bg: 'bg-white', text: 'text-rose-600' },
          { label: 'Hoàn thành', val: stats.completed, icon: <CheckCircleOutlined />, bg: 'bg-white', text: 'text-rose-600' },
          { label: 'Việc quá hạn', val: stats.overdue, icon: <ExclamationCircleOutlined />, bg: 'bg-white', text: 'text-rose-600' }
        ].map((item, idx) => (
          <Col xs={24} sm={12} md={6} key={idx}>
            <div className={`${item.bg} p-8 rounded-[38px] shadow-sm hover:shadow-xl hover:translate-y-[-5px] transition-all duration-300 border border-rose-50 group`}>
              <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${item.bg === 'bg-white' ? 'bg-rose-50 text-rose-600' : 'bg-white/20 text-white'}`}>
                  {item.icon}
                </div>
                <Text className={`font-bold text-[10px] uppercase tracking-widest ${item.bg === 'bg-white' ? 'text-slate-300' : 'text-rose-100'}`}>{item.label}</Text>
              </div>
              <Title level={2} className={`m-0 font-black ${item.text}`}>{item.val}</Title>
            </div>
          </Col>
        ))}
      </Row>

      <div className="mt-16">
        <div className="flex items-center justify-between mb-8">
          <Title level={3} className="m-0 text-slate-900 font-black flex items-center gap-3">
             Phòng điều hành <ArrowRightOutlined className="text-rose-600 text-sm" />
          </Title>
          <Button type="text" className="text-rose-600 font-bold">Xem báo cáo chi tiết</Button>
        </div>
        <Row gutter={[24, 24]}>
          {tasks.filter(t => t.priority === 'high' && t.status !== 'done').slice(0, 3).map(task => (
            <Col xs={24} md={8} key={task.id}>
              <Card 
                className="rounded-[32px] border-0 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(225,29,72,0.1)] transition-all cursor-pointer bg-white overflow-hidden group"
                onClick={() => showEditModal(task)}
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-600"></div>
                <div className="flex justify-between items-start mb-4">
                  <Tag color="volcano" className="rounded-lg border-0 px-3 font-black text-[9px] uppercase tracking-wider">High Priority</Tag>
                  <Text className="text-[11px] text-slate-400 font-bold font-mono">{task.deadline}</Text>
                </div>
                <Title level={5} className="mb-2 text-slate-800 group-hover:text-rose-600 transition-colors">{task.title}</Title>
                <Text type="secondary" className="text-xs line-clamp-2 leading-relaxed">{task.description || "Chưa có mô tả chi tiết."}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );

  const KanbanView = () => (
    <div className="p-8 lg:p-10 h-full bg-[#fafafa]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <Title level={2} className="m-0 font-black text-slate-900">Bảng tiến độ</Title>
          <Text className="text-slate-400 font-medium">Tối ưu hóa quy trình làm việc của bạn.</Text>
        </div>
        <div className="flex gap-4">
          <Input 
            prefix={<SearchOutlined className="text-rose-300" />} 
            placeholder="Tìm kiếm..." 
            className="rounded-2xl border-rose-100 w-64 h-12"
            onChange={e => setSearchText(e.target.value)}
          />
          <Button size="large" shape="round" type="primary" danger className="h-12 px-8 font-bold shadow-lg shadow-rose-100" icon={<PlusOutlined />} onClick={() => { setEditingTask(null); form.resetFields(); setIsModalVisible(true); }}>Tạo mới</Button>
        </div>
      </div>
      
      <div className="flex gap-8 overflow-x-auto pb-10">
        {(Object.entries(COLUMNS) as [Task['status'], ColumnConfig][]).map(([status, config]) => (
          <div 
            key={status} 
            className="flex-1 min-w-[320px] flex flex-col"
            onDragOver={(e) => { e.preventDefault(); setDropTargetStatus(status); }}
            onDrop={(e) => handleDrop(e, status)}
            onDragLeave={() => setDropTargetStatus(null)}
          >
            <div className="flex items-center justify-between mb-6 px-4 py-2 bg-white rounded-2xl shadow-sm border border-rose-50">
              <Space>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-rose-50 text-rose-600 text-sm">
                  {config.icon}
                </div>
                <Text strong className="text-[11px] uppercase tracking-[0.2em] text-slate-800">{config.title}</Text>
              </Space>
              <Badge count={tasks.filter(t => t.status === status).length} style={{ backgroundColor: '#be123c', color: '#fff', fontWeight: 'bold' }} />
            </div>

            <div className={`flex-grow rounded-[40px] p-3 transition-all duration-500 ${dropTargetStatus === status ? 'bg-rose-50/50 ring-2 ring-rose-200 ring-dashed' : ''}`}>
              {tasks.filter(t => t.status === status && t.title.toLowerCase().includes(searchText.toLowerCase())).map(task => (
                <div key={task.id} draggable onDragStart={(e) => handleDragStart(e, task.id)} className="mb-5">
                  <Card
                    hoverable
                    className="rounded-[28px] shadow-sm border-0 transition-all hover:translate-y-[-4px] hover:shadow-xl active:scale-95"
                    bodyStyle={{ padding: '24px' }}
                    onClick={() => showEditModal(task)}
                  >
                    <div className="flex justify-between items-start mb-4">
                       <div className="flex flex-wrap gap-2">
                        {task.tags?.map(tag => (
                          <span key={tag} className="text-[9px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md uppercase tracking-tighter">{tag}</span>
                        ))}
                      </div>
                      <Badge color={PRIORITY_THEME[task.priority].dot} />
                    </div>
                    <Title level={5} className="mb-4 text-[15px] leading-snug text-slate-800 font-bold">{task.title}</Title>
                    <Divider className="my-4 border-slate-50" />
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-slate-400">
                        <CalendarOutlined className="text-xs" />
                        <span className="text-[11px] font-bold font-mono">{dayjs(task.deadline).format('MMM DD')}</span>
                      </div>
                      <Avatar.Group maxCount={2}>
                        <Avatar size="small" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${task.id}`} />
                        <Avatar size="small" className="bg-rose-50 text-rose-400 text-[10px] font-bold">FF</Avatar>
                      </Avatar.Group>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Layout className="min-h-screen bg-white">
      <Sider width={280} theme="light" className="border-r border-slate-50 fixed h-full z-30">
        <div className="flex flex-col h-full py-10 px-8">
          <div className="flex items-center gap-4 mb-14">
            <div className="w-12 h-12 bg-rose-600 rounded-[18px] flex items-center justify-center shadow-xl shadow-rose-200 rotate-3">
              <HeartOutlined className="text-white text-2xl" />
            </div>
            <div>
              <Title level={4} className="m-0 font-black tracking-tighter text-slate-900 leading-none">FocusFlow</Title>
              <Text className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Premium UI</Text>
            </div>
          </div>
          
          <Menu 
            mode="inline" 
            selectedKeys={[currentView]} 
            onClick={({ key }) => setCurrentView(key)}
            className="border-0 flex-grow premium-menu"
            items={[
              { key: 'dashboard', icon: <DashboardOutlined />, label: 'Tổng quan' },
              { key: 'kanban', icon: <ProjectOutlined />, label: 'Bảng tiến độ' },
              { key: 'list', icon: <UnorderedListOutlined />, label: 'Tất cả việc' },
            ]}
          />

          <Card className="rounded-[32px] bg-slate-900 border-0 mt-auto overflow-hidden relative group">
             <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-rose-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
             <div className="relative z-10">
                <Avatar size={54} src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ginger" className="mb-4 border-2 border-rose-500 shadow-lg" />
                <Text strong className="block text-white text-sm">Quản trị viên</Text>
                <Text className="text-slate-400 text-[11px] block mb-4">Gemini Pro Workspace</Text>
                <Button type="primary" danger block shape="round" className="h-10 font-bold bg-rose-600 border-0 hover:bg-rose-500" onClick={() => { setEditingTask(null); form.resetFields(); setIsModalVisible(true); }}>
                  Tạo Task
                </Button>
             </div>
          </Card>
        </div>
      </Sider>

      <Layout className="ml-[280px] bg-white">
        <Header className="bg-white/80 backdrop-blur-xl px-12 flex items-center justify-between border-b border-slate-50 h-24 sticky top-0 z-20">
          <Title level={4} className="m-0 text-slate-900 font-black">
            {currentView === 'dashboard' ? 'Điều hành' : currentView === 'kanban' ? 'Tiến độ' : 'Danh sách'}
          </Title>
          <Space size="large">
            <Badge count={stats.overdue} size="small" className="cursor-pointer">
              <Button type="text" shape="circle" className="h-12 w-12 bg-slate-50" icon={<BellOutlined className="text-xl text-slate-400" />} />
            </Badge>
            <Divider type="vertical" className="h-8 border-slate-100" />
            <div className="text-right">
              <Text className="block text-[10px] font-black text-rose-500 uppercase tracking-widest leading-none mb-1">Thời gian thực</Text>
              <Text className="text-xs font-bold text-slate-400">{dayjs().format('DD MMMM, YYYY')}</Text>
            </div>
          </Space>
        </Header>
        
        <Content className="overflow-auto min-h-screen">
          {currentView === 'dashboard' && <DashboardView />}
          {currentView === 'kanban' && <KanbanView />}
          {currentView === 'list' && (
            <div className="p-12 animate-in fade-in duration-700">
               <div className="bg-white rounded-[40px] shadow-sm border border-slate-50 overflow-hidden">
                  <Table 
                    dataSource={tasks} 
                    rowKey="id" 
                    pagination={{ pageSize: 10 }}
                    className="premium-table"
                    columns={[
                      { title: 'Tên nhiệm vụ', dataIndex: 'title', render: (t: string) => <Text strong className="text-slate-800">{t}</Text> },
                      { title: 'Độ ưu tiên', dataIndex: 'priority', render: (p: Task['priority']) => <Tag color={p === 'high' ? 'volcano' : 'blue'} className="rounded-full border-0 px-4 font-bold text-[10px] uppercase tracking-wider">{PRIORITY_THEME[p].label}</Tag> },
                      { title: 'Trạng thái', dataIndex: 'status', render: (s: Task['status']) => <Tag color="default" className="rounded-lg border-0 bg-slate-50 text-slate-400 font-bold uppercase text-[9px]">{COLUMNS[s].title}</Tag> },
                      { title: 'Hạn chót', dataIndex: 'deadline', render: (d: string) => <Text className="font-mono text-xs font-bold text-slate-400">{d}</Text> },
                      { title: '', align: 'right', render: (_: any, r: Task) => (
                        <Space>
                          <Button type="text" shape="circle" icon={<MoreOutlined />} onClick={() => showEditModal(r)} />
                          <Button type="text" danger shape="circle" icon={<ExclamationCircleOutlined />} onClick={() => handleDeleteTask(r.id)} />
                        </Space>
                      )}
                    ]} 
                  />
               </div>
            </div>
          )}
        </Content>
      </Layout>

      <Modal
        title={null}
        visible={isModalVisible}
        onCancel={() => { setIsModalVisible(false); setEditingTask(null); }}
        footer={null}
        centered
        width={500}
        className="premium-modal"
      >
        <div className="py-4">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 text-2xl">
              {editingTask ? <RocketOutlined /> : <PlusOutlined />}
            </div>
            <div>
              <Title level={3} className="m-0 font-black text-slate-900">{editingTask ? "Cập nhật" : "Tạo nhiệm vụ"}</Title>
              <Text className="text-slate-400 font-medium">Hoàn thành các thông tin bên dưới.</Text>
            </div>
          </div>

          <Form form={form} layout="vertical" onFinish={handleSaveTask} initialValues={{ status: 'todo', priority: 'medium' }}>
            <Form.Item name="title" label={<Text strong className="text-[11px] uppercase text-slate-400 tracking-wider">Tiêu đề nhiệm vụ</Text>} rules={[{ required: true }]}>
              <Input placeholder="Ví dụ: Hoàn thành thiết kế UI..." className="h-12 rounded-2xl border-slate-100 focus:border-rose-300" />
            </Form.Item>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="status" label={<Text strong className="text-[11px] uppercase text-slate-400 tracking-wider">Trạng thái</Text>}>
                  <Select className="h-12 premium-select">
                    <Option value="todo">Chờ thực hiện</Option>
                    <Option value="doing">Đang triển khai</Option>
                    <Option value="done">Đã hoàn tất</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="priority" label={<Text strong className="text-[11px] uppercase text-slate-400 tracking-wider">Mức ưu tiên</Text>}>
                  <Select className="h-12 premium-select">
                    <Option value="high">Rất khẩn cấp</Option>
                    <Option value="medium">Quan trọng</Option>
                    <Option value="low">Bình thường</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="deadline" label={<Text strong className="text-[11px] uppercase text-slate-400 tracking-wider">Hạn định</Text>} rules={[{ required: true }]}>
                  <DatePicker className="w-full h-12 rounded-2xl border-slate-100" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="tags" label={<Text strong className="text-[11px] uppercase text-slate-400 tracking-wider">Phân loại</Text>}>
                  <Select mode="tags" placeholder="Nhập nhãn..." className="h-12 premium-select" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="description" label={<Text strong className="text-[11px] uppercase text-slate-400 tracking-wider">Ghi chú thêm</Text>}>
              <Input.TextArea rows={3} placeholder="Mô tả công việc chi tiết..." className="rounded-2xl border-slate-100" />
            </Form.Item>

            <div className="flex gap-4 mt-8">
              <Button block size="large" shape="round" className="h-14 border-0 bg-slate-100 text-slate-500 font-bold" onClick={() => setIsModalVisible(false)}>Hủy bỏ</Button>
              <Button block size="large" shape="round" type="primary" danger htmlType="submit" className="h-14 font-black bg-rose-600 shadow-xl shadow-rose-100">
                Xác nhận
              </Button>
            </div>
          </Form>
        </div>
      </Modal>

      <style dangerouslySetInnerHTML={{ __html: `
        .premium-menu .ant-menu-item {
          border-radius: 20px !important;
          margin-bottom: 8px !important;
          height: 56px !important;
          padding-left: 20px !important;
        }
        .premium-menu .ant-menu-item-selected {
          background-color: #fff1f2 !important;
          color: #e11d48 !important;
          font-weight: 900 !important;
        }
        .premium-menu .ant-menu-item:not(.ant-menu-item-selected):hover {
          background-color: #fafafa !important;
        }
        .premium-table .ant-table-thead > tr > th {
          background: #fafafa !important;
          color: #94a3b8 !important;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          border-bottom: 2px solid #f1f5f9 !important;
          padding: 24px !important;
        }
        .premium-table .ant-table-tbody > tr > td {
          padding: 20px 24px !important;
          border-bottom: 1px solid #f8fafc !important;
        }
        .premium-modal .ant-modal-content {
          border-radius: 48px !important;
          padding: 32px !important;
          box-shadow: 0 30px 60px rgba(0,0,0,0.1) !important;
        }
        .premium-select .ant-select-selector {
          border-radius: 16px !important;
          border-color: #f1f5f9 !important;
        }
        .ant-picker {
          border-radius: 16px !important;
        }
        .ant-input {
          border-radius: 16px !important;
        }
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-thumb {
          background: #f1f5f9;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #fda4af;
        }
      `}} />
    </Layout>
  );
}