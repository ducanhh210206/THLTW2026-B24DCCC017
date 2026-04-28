import React, { useState } from 'react';
import { 
  Layout, Menu, Card, Row, Col, Statistic, Table, Tag, Button, Modal, 
  Form, Input, InputNumber, Select, DatePicker, Popconfirm, Space, 
  Progress, Drawer, Typography, ConfigProvider
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  DashboardOutlined,
  HistoryOutlined,
  HeartOutlined,
  BulbOutlined,
  BookOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FireOutlined
} from '@ant-design/icons';
// @ts-ignore - Bỏ qua lỗi thiếu type definition của recharts nếu chưa cài @types/recharts
import {
  CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis
} from 'recharts';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

// --- Interfaces & Types ---

interface Workout {
  id: string;
  date: string;
  type: string;
  duration: number;
  calories: number;
  note?: string;
  status: 'Hoàn thành' | 'Bỏ lỡ';
}

interface HealthMetric {
  id: string;
  date: string;
  weight: number;
  height: number;
  heartRate?: number;
  sleepHours?: number;
}

interface Goal {
  id: string;
  name: string;
  type: string;
  target: number;
  current: number;
  deadline: string;
  status: 'Đang thực hiện' | 'Đã đạt' | 'Đã hủy';
}

interface Exercise {
  id: string;
  name: string;
  muscles: string;
  difficulty: string;
  caloriesPerHour: number;
  description?: string;
}

// --- Dữ liệu ban đầu ---

const initialWorkouts: Workout[] = [
  { id: '1', date: '2023-10-20', type: 'Cardio', duration: 45, calories: 400, note: 'Chạy bộ công viên', status: 'Hoàn thành' },
  { id: '2', date: '2023-10-21', type: 'Sức mạnh', duration: 60, calories: 300, note: 'Tập ngực và tay sau', status: 'Hoàn thành' },
];

const initialHealthMetrics: HealthMetric[] = [
  { id: '1', date: '2023-10-01', weight: 75, height: 175, heartRate: 70, sleepHours: 7 },
];

const initialGoals: Goal[] = [
  { id: '1', name: 'Giảm cân đón Tết', type: 'Giảm cân', target: 70, current: 73.5, deadline: '2023-12-31', status: 'Đang thực hiện' },
];

const initialExercises: Exercise[] = [
  { id: '1', name: 'Chống đẩy (Push-ups)', muscles: 'Ngực', difficulty: 'Trung bình', caloriesPerHour: 300, description: 'Chống đẩy cơ bản.' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  const [workouts, setWorkouts] = useState<Workout[]>(initialWorkouts);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>(initialHealthMetrics);
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);

  // States quản lý UI - Sử dụng visible thay vì open để tương thích bản cũ
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState<boolean>(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [isMetricModalOpen, setIsMetricModalOpen] = useState<boolean>(false);
  const [editingMetric, setEditingMetric] = useState<HealthMetric | null>(null);
  const [isGoalDrawerOpen, setIsGoalDrawerOpen] = useState<boolean>(false);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState<boolean>(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  const [workoutForm] = Form.useForm();
  const [metricForm] = Form.useForm();
  const [goalForm] = Form.useForm();
  const [exerciseForm] = Form.useForm();

  // --- Helpers ---
  const calculateBMI = (w: number, h: number): string => {
    if (!w || !h) return "0";
    const heightInMeters = h / 100;
    return (w / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getBMITag = (bmiStr: string) => {
    const bmiVal = parseFloat(bmiStr);
    if (bmiVal < 18.5) return <Tag color="blue">Thiếu cân</Tag>;
    if (bmiVal < 25) return <Tag color="green">Bình thường</Tag>;
    if (bmiVal < 30) return <Tag color="orange">Thừa cân</Tag>;
    return <Tag color="red">Béo phì</Tag>;
  };

  // --- Handlers ---
  const handleSaveWorkout = (values: any) => {
    const formattedData: Workout = {
      ...values,
      id: editingWorkout ? editingWorkout.id : Date.now().toString(),
      date: values.date.format('YYYY-MM-DD'),
    };
    if (editingWorkout) {
      setWorkouts(workouts.map(w => w.id === editingWorkout.id ? formattedData : w));
    } else {
      setWorkouts([formattedData, ...workouts]);
    }
    setIsWorkoutModalOpen(false);
    setEditingWorkout(null);
    workoutForm.resetFields();
  };

  const handleSaveMetric = (values: any) => {
    const formattedData: HealthMetric = {
      ...values,
      id: editingMetric ? editingMetric.id : Date.now().toString(),
      date: values.date.format('YYYY-MM-DD'),
    };
    if (editingMetric) {
      setHealthMetrics(healthMetrics.map(m => m.id === editingMetric.id ? formattedData : m));
    } else {
      setHealthMetrics([formattedData, ...healthMetrics]);
    }
    setIsMetricModalOpen(false);
    setEditingMetric(null);
    metricForm.resetFields();
  };

  const handleSaveGoal = (values: any) => {
    const formattedData: Goal = {
      ...values,
      id: Date.now().toString(),
      current: values.current || 0,
      deadline: values.deadline.format('YYYY-MM-DD'),
      status: 'Đang thực hiện'
    };
    setGoals([...goals, formattedData]);
    setIsGoalDrawerOpen(false);
    goalForm.resetFields();
  };

  const handleSaveExercise = (values: any) => {
    const formattedData: Exercise = {
      ...values,
      id: editingExercise ? editingExercise.id : Date.now().toString(),
    };
    if (editingExercise) {
      setExercises(exercises.map(e => e.id === editingExercise.id ? formattedData : e));
    } else {
      setExercises([...exercises, formattedData]);
    }
    setIsExerciseModalOpen(false);
    setEditingExercise(null);
    exerciseForm.resetFields();
  };

  // --- Sub-Components ---

  const Dashboard = () => {
    const totalCalories = workouts.reduce((sum, w) => sum + (w.status === 'Hoàn thành' ? w.calories : 0), 0);
    const weightData = healthMetrics
      .map(m => ({ date: m.date, weight: m.weight }))
      .sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix());

    return (
      <div className="space-y-6">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm border-0 border-l-4 border-red-600">
              <Statistic title="Buổi tập tháng này" value={workouts.length} prefix={<HistoryOutlined />} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm border-0 border-l-4 border-red-500">
              <Statistic title="Calo tiêu thụ" value={totalCalories} prefix={<FireOutlined />} suffix="kcal" />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={12}>
            <Card title="Xu hướng cân nặng" className="shadow-sm">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                    <RechartsTooltip />
                    <Line type="monotone" dataKey="weight" stroke="#dc2626" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  const WorkoutLog = () => {
    const columns: ColumnsType<Workout> = [
      { title: 'Ngày', dataIndex: 'date', key: 'date' },
      { title: 'Loại bài', dataIndex: 'type', key: 'type' },
      { title: 'Thời lượng', dataIndex: 'duration', key: 'duration', render: (t: number) => `${t} phút` },
      { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (s: string) => (
        <Tag color={s === 'Hoàn thành' ? 'red' : 'default'}>{s}</Tag>
      )},
      { title: 'Thao tác', key: 'actions', fixed: 'right' as const, width: 100, render: (_: any, record: Workout) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => {
            setEditingWorkout(record);
            workoutForm.setFieldsValue({ ...record, date: dayjs(record.date) });
            setIsWorkoutModalOpen(true);
          }} />
          <Popconfirm title="Xóa?" onConfirm={() => setWorkouts(workouts.filter(w => w.id !== record.id))}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )},
    ];

    return (
      <Card title="Nhật ký tập luyện" extra={<Button type="primary" danger icon={<PlusOutlined />} onClick={() => setIsWorkoutModalOpen(true)}>Thêm</Button>}>
        <Table columns={columns} dataSource={workouts} rowKey="id" scroll={{ x: 600 }} />
      </Card>
    );
  };

  const HealthMetricsView = () => {
    const columns: ColumnsType<HealthMetric> = [
      { title: 'Ngày', dataIndex: 'date', key: 'date' },
      { title: 'Cân nặng', dataIndex: 'weight', key: 'weight', render: (w: number) => `${w} kg` },
      { title: 'BMI', key: 'bmi', render: (_: any, r: HealthMetric) => {
        const bmi = calculateBMI(r.weight, r.height);
        return <Space>{bmi} {getBMITag(bmi)}</Space>
      }},
      { title: 'Thao tác', key: 'actions', render: (_: any, record: HealthMetric) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => {
            setEditingMetric(record);
            metricForm.setFieldsValue({ ...record, date: dayjs(record.date) });
            setIsMetricModalOpen(true);
          }} />
          <Popconfirm title="Xóa?" onConfirm={() => setHealthMetrics(healthMetrics.filter(m => m.id !== record.id))}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )},
    ];
    return (
      <Card title="Chỉ số sức khỏe" extra={<Button type="primary" danger icon={<PlusOutlined />} onClick={() => setIsMetricModalOpen(true)}>Cập nhật</Button>}>
        <Table columns={columns} dataSource={healthMetrics} rowKey="id" scroll={{ x: 600 }} />
      </Card>
    );
  };

  const GoalManagement = () => {
    return (
      <Row gutter={[16, 16]}>
        <Col span={24} className="flex justify-between items-center bg-white p-4 rounded shadow-sm mb-4">
          <Title level={5} style={{margin: 0}}>Mục tiêu cá nhân</Title>
          <Button type="primary" danger icon={<PlusOutlined />} onClick={() => setIsGoalDrawerOpen(true)}>Thêm mục tiêu</Button>
        </Col>
        {goals.map(goal => {
          const progress = Math.round((goal.current / goal.target) * 100);
          return (
            <Col xs={24} md={12} lg={8} key={goal.id}>
              <Card className="shadow-sm">
                <div className="flex justify-between items-start">
                  <Title level={5}>{goal.name}</Title>
                  <Tag color="red">{goal.type}</Tag>
                </div>
                <Progress percent={progress} strokeColor="#dc2626" />
                <div className="flex justify-between mt-2">
                  <Text type="secondary">Hiện tại: {goal.current}</Text>
                  <Text strong>Đích: {goal.target}</Text>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    );
  };

  const ExerciseLibrary = () => {
    return (
      <Row gutter={[16, 16]}>
        <Col span={24} className="mb-4">
          <Button type="primary" danger icon={<PlusOutlined />} onClick={() => setIsExerciseModalOpen(true)}>Thêm bài tập mẫu</Button>
        </Col>
        {exercises.map(ex => (
          <Col xs={24} sm={12} lg={8} key={ex.id}>
            <Card 
              hoverable 
              actions={[
                <EditOutlined key="edit" onClick={() => { setEditingExercise(ex); exerciseForm.setFieldsValue(ex); setIsExerciseModalOpen(true); }} />,
                <DeleteOutlined key="delete" onClick={() => setExercises(exercises.filter(e => e.id !== ex.id))} />
              ]}
            >
              <Tag color="red" className="mb-2">{ex.muscles}</Tag>
              <Title level={5}>{ex.name}</Title>
              <Text type="secondary" className="block h-12 overflow-hidden">{ex.description}</Text>
              <div className="mt-2 text-red-600 font-bold"><FireOutlined /> {ex.caloriesPerHour} kcal/h</div>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <ConfigProvider>
      <Layout className="min-h-screen">
        <Sider breakpoint="lg" collapsedWidth="0" theme="light" className="border-r border-gray-100">
          <div className="h-16 flex items-center justify-center border-b font-bold text-red-600 text-lg uppercase px-2">
            FitTracker <HeartOutlined />
          </div>
          <Menu
            mode="inline"
            selectedKeys={[activeTab]}
            onClick={({ key }) => setActiveTab(key.toString())}
            items={[
              { key: 'dashboard', icon: <DashboardOutlined />, label: 'Tổng quan' },
              { key: 'workouts', icon: <HistoryOutlined />, label: 'Lịch sử tập' },
              { key: 'health', icon: <HeartOutlined />, label: 'Chỉ số cơ thể' },
              { key: 'goals', icon: <BulbOutlined />, label: 'Mục tiêu' },
              { key: 'library', icon: <BookOutlined />, label: 'Thư viện bài' },
            ]}
          />
        </Sider>

        <Layout>
          <Header className="bg-white px-6 flex items-center border-b">
            <Title level={4} style={{ margin: 0 }}>
              {activeTab === 'dashboard' && 'Bảng điều khiển'}
              {activeTab === 'workouts' && 'Nhật ký tập luyện'}
              {activeTab === 'health' && 'Thông số sức khỏe'}
              {activeTab === 'goals' && 'Mục tiêu của bạn'}
              {activeTab === 'library' && 'Thư viện bài tập'}
            </Title>
          </Header>

          <Content className="p-4 sm:p-8 bg-gray-50/50">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'workouts' && <WorkoutLog />}
            {activeTab === 'health' && <HealthMetricsView />}
            {activeTab === 'goals' && <GoalManagement />}
            {activeTab === 'library' && <ExerciseLibrary />}
          </Content>
        </Layout>

        {/* Modal Buổi tập */}
        <Modal 
          title="Ghi nhận buổi tập" 
          visible={isWorkoutModalOpen} 
          onCancel={() => { setIsWorkoutModalOpen(false); setEditingWorkout(null); workoutForm.resetFields(); }} 
          footer={null}
        >
          <Form form={workoutForm} layout="vertical" onFinish={handleSaveWorkout}>
            <Form.Item name="date" label="Ngày" rules={[{ required: true }]}><DatePicker className="w-full" /></Form.Item>
            <Form.Item name="type" label="Loại hình" rules={[{ required: true }]}><Select><Option value="Cardio">Cardio</Option><Option value="Sức mạnh">Sức mạnh</Option><Option value="Yoga">Yoga</Option></Select></Form.Item>
            <Row gutter={16}>
              <Col span={12}><Form.Item name="duration" label="Phút" rules={[{ required: true }]}><InputNumber className="w-full" /></Form.Item></Col>
              <Col span={12}><Form.Item name="calories" label="Calo" rules={[{ required: true }]}><InputNumber className="w-full" /></Form.Item></Col>
            </Row>
            <Form.Item name="status" label="Trạng thái" initialValue="Hoàn thành"><Select><Option value="Hoàn thành">Hoàn thành</Option><Option value="Bỏ lỡ">Bỏ lỡ</Option></Select></Form.Item>
            <Button type="primary" danger htmlType="submit" block>Lưu</Button>
          </Form>
        </Modal>

        {/* Modal Chỉ số */}
        <Modal 
          title="Cập nhật thông số" 
          visible={isMetricModalOpen} 
          onCancel={() => { setIsMetricModalOpen(false); setEditingMetric(null); metricForm.resetFields(); }} 
          footer={null}
        >
          <Form form={metricForm} layout="vertical" onFinish={handleSaveMetric}>
            <Form.Item name="date" label="Ngày đo" rules={[{ required: true }]}><DatePicker className="w-full" /></Form.Item>
            <Row gutter={16}>
              <Col span={12}><Form.Item name="weight" label="Cân nặng (kg)" rules={[{ required: true }]}><InputNumber className="w-full" step={0.1} /></Form.Item></Col>
              <Col span={12}><Form.Item name="height" label="Chiều cao (cm)" rules={[{ required: true }]}><InputNumber className="w-full" /></Form.Item></Col>
            </Row>
            <Button type="primary" danger htmlType="submit" block>Lưu</Button>
          </Form>
        </Modal>

        {/* Drawer Mục tiêu */}
        <Drawer 
          title="Mục tiêu mới" 
          visible={isGoalDrawerOpen} 
          onClose={() => setIsGoalDrawerOpen(false)} 
          width={window.innerWidth < 500 ? '100%' : 400}
        >
          <Form form={goalForm} layout="vertical" onFinish={handleSaveGoal}>
            <Form.Item name="name" label="Tên mục tiêu" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="type" label="Loại" rules={[{ required: true }]}><Select><Option value="Giảm cân">Giảm cân</Option><Option value="Tăng cơ">Tăng cơ</Option></Select></Form.Item>
            <Form.Item name="target" label="Mục tiêu con số" rules={[{ required: true }]}><InputNumber className="w-full" /></Form.Item>
            <Form.Item name="deadline" label="Hạn" rules={[{ required: true }]}><DatePicker className="w-full" /></Form.Item>
            <Button type="primary" danger htmlType="submit" block size="large">Bắt đầu</Button>
          </Form>
        </Drawer>

        {/* Modal Bài tập (Fix lỗi biến không sử dụng) */}
        <Modal
          title="Thêm bài tập"
          visible={isExerciseModalOpen}
          onCancel={() => { setIsExerciseModalOpen(false); setEditingExercise(null); exerciseForm.resetFields(); }}
          footer={null}
        >
          <Form form={exerciseForm} layout="vertical" onFinish={handleSaveExercise}>
            <Form.Item name="name" label="Tên bài tập" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="muscles" label="Nhóm cơ" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="caloriesPerHour" label="Calo/Giờ" rules={[{ required: true }]}><InputNumber className="w-full" /></Form.Item>
            <Button type="primary" danger htmlType="submit" block>Lưu</Button>
          </Form>
        </Modal>
      </Layout>
    </ConfigProvider>
  );
}