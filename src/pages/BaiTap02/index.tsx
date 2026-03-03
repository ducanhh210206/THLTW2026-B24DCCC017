import React, { useEffect, useState } from 'react';
import {
  Layout,
  Card,
  Button,
  Modal,
  Form,
  Input,
  List,
  Space,
  message,
  DatePicker,
  InputNumber,
  Select,
  Progress,
  Tag,
  Typography,
  Popconfirm,
} from 'antd';
import moment from 'moment';

const { Header, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

type Subject = {
  id: string;
  name: string;
};

type StudySession = {
  id: string;
  subjectId: string;
  date: string;
  duration: number;
  content: string;
  note: string;
};

type Goal = {
  id: string;
  month: string;
  subjectId?: string;
  totalDuration: number;
};

const STORAGE_KEY = 'BaiTap02_Final';

export default function BaiTap02() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  const [openSubject, setOpenSubject] = useState(false);
  const [openSession, setOpenSession] = useState(false);
  const [openGoal, setOpenGoal] = useState(false);

  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const [formSubject] = Form.useForm();
  const [formSession] = Form.useForm();
  const [formGoal] = Form.useForm();

  /* ================= LOAD LOCAL ================= */

  useEffect(() => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      setSubjects(parsed.subjects || []);
      setSessions(parsed.sessions || []);
      setGoals(parsed.goals || []);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ subjects, sessions, goals }),
    );
  }, [subjects, sessions, goals]);

  /* ================= SUBJECT ================= */

  const isDuplicateSubject = (name: string) => {
    return subjects.some(
      s =>
        s.name.trim().toLowerCase() === name.trim().toLowerCase() &&
        s.id !== editingSubject?.id,
    );
  };

  const saveSubject = (values: any) => {
    if (isDuplicateSubject(values.name)) {
      message.error('Môn học đã tồn tại!');
      return;
    }

    if (editingSubject) {
      setSubjects(prev =>
        prev.map(s =>
          s.id === editingSubject.id ? { ...s, name: values.name } : s,
        ),
      );
      message.success('Cập nhật môn thành công');
    } else {
      setSubjects([
        ...subjects,
        { id: Date.now().toString(), name: values.name },
      ]);
      message.success('Thêm môn thành công');
    }

    setEditingSubject(null);
    setOpenSubject(false);
    formSubject.resetFields();
  };

  const deleteSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
    setSessions(sessions.filter(s => s.subjectId !== id));
    setGoals(goals.filter(g => g.subjectId !== id));
    message.success('Đã xóa môn và dữ liệu liên quan');
  };

  /* ================= SESSION ================= */

  const saveSession = (values: any) => {
    if (!subjects.length) {
      message.error('Vui lòng tạo môn học trước!');
      return;
    }

    if (values.date.isAfter(moment())) {
      message.error('Không được chọn ngày tương lai!');
      return;
    }

    if (values.duration <= 0) {
      message.error('Thời lượng phải > 0');
      return;
    }

    const newSession: StudySession = {
      id: editingSession ? editingSession.id : Date.now().toString(),
      subjectId: values.subjectId,
      date: values.date.toISOString(),
      duration: Number(values.duration),
      content: values.content,
      note: values.note || '',
    };

    if (editingSession) {
      setSessions(prev =>
        prev.map(s => (s.id === editingSession.id ? newSession : s)),
      );
      message.success('Cập nhật lịch học thành công');
    } else {
      setSessions([...sessions, newSession]);
      message.success('Thêm lịch học thành công');
    }

    setEditingSession(null);
    setOpenSession(false);
    formSession.resetFields();
  };

  const deleteSession = (id: string) => {
    setSessions(sessions.filter(s => s.id !== id));
    message.success('Đã xóa lịch học');
  };

  /* ================= GOAL ================= */

  const isDuplicateGoal = (month: string, subjectId?: string) => {
    return goals.some(
      g =>
        g.month === month &&
        g.subjectId === subjectId &&
        g.id !== editingGoal?.id,
    );
  };

  const saveGoal = (values: any) => {
    const month = values.month.format('YYYY-MM');

    if (values.totalDuration <= 0) {
      message.error('Mục tiêu phải > 0');
      return;
    }

    if (isDuplicateGoal(month, values.subjectId)) {
      message.error('Mục tiêu tháng này đã tồn tại!');
      return;
    }

    const newGoal: Goal = {
      id: editingGoal ? editingGoal.id : Date.now().toString(),
      month,
      subjectId: values.subjectId,
      totalDuration: Number(values.totalDuration),
    };

    if (editingGoal) {
      setGoals(prev =>
        prev.map(g => (g.id === editingGoal.id ? newGoal : g)),
      );
      message.success('Cập nhật mục tiêu thành công');
    } else {
      setGoals([...goals, newGoal]);
      message.success('Thêm mục tiêu thành công');
    }

    setEditingGoal(null);
    setOpenGoal(false);
    formGoal.resetFields();
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
    message.success('Đã xóa mục tiêu');
  };

  /* ================= TÍNH TOÁN ================= */

  const getMonthlyTotal = (month: string) =>
    sessions
      .filter(s => moment(s.date).format('YYYY-MM') === month)
      .reduce((sum, s) => sum + s.duration, 0);

  const getMonthlySubjectTotal = (month: string, subjectId: string) =>
    sessions
      .filter(
        s =>
          moment(s.date).format('YYYY-MM') === month &&
          s.subjectId === subjectId,
      )
      .reduce((sum, s) => sum + s.duration, 0);

  const calculatePercent = (total: number, target: number) => {
    if (target === 0) return 0;
    return Math.min((total / target) * 100, 100);
  };

  /* ================= UI ================= */

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#a8071a', color: '#fff' }}>
        📚 Study Manager - Fixed
      </Header>

      <Content style={{ padding: 30 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* SUBJECT */}
          <Card
            title="Danh mục môn học"
            extra={<Button danger type="primary" onClick={() => setOpenSubject(true)}>Thêm môn</Button>}
          >
            <List
              bordered
              dataSource={subjects}
              renderItem={item => (
                <List.Item
                  actions={[
                    <a onClick={() => {
                      setEditingSubject(item);
                      formSubject.setFieldsValue(item);
                      setOpenSubject(true);
                    }}>Sửa</a>,
                    <Popconfirm title="Xóa môn?" onConfirm={() => deleteSubject(item.id)}>
                      <a>Xóa</a>
                    </Popconfirm>,
                  ]}
                >
                  {item.name}
                </List.Item>
              )}
            />
          </Card>

          {/* SESSION */}
          <Card
            title="Lịch học"
            extra={<Button danger type="primary" onClick={() => setOpenSession(true)}>Thêm lịch</Button>}
          >
            <List
              bordered
              dataSource={sessions}
              renderItem={item => (
                <List.Item
                  actions={[
                    <a onClick={() => {
                      setEditingSession(item);
                      formSession.setFieldsValue({
                        ...item,
                        date: moment(item.date),
                      });
                      setOpenSession(true);
                    }}>Sửa</a>,
                    <Popconfirm title="Xóa lịch?" onConfirm={() => deleteSession(item.id)}>
                      <a>Xóa</a>
                    </Popconfirm>,
                  ]}
                >
                  <div>
                    <b>{subjects.find(s => s.id === item.subjectId)?.name}</b>
                    <br />📅 {moment(item.date).format('DD/MM/YYYY HH:mm')}
                    <br />⏱ {item.duration} giờ
                  </div>
                </List.Item>
              )}
            />
          </Card>

          {/* GOAL */}
          <Card
            title="Mục tiêu tháng"
            extra={<Button danger type="primary" onClick={() => setOpenGoal(true)}>Thêm mục tiêu</Button>}
          >
            {goals.map(goal => {
              const total = goal.subjectId
                ? getMonthlySubjectTotal(goal.month, goal.subjectId)
                : getMonthlyTotal(goal.month);

              const percent = calculatePercent(total, goal.totalDuration);
              const done = total >= goal.totalDuration;

              return (
                <Card key={goal.id} style={{ marginBottom: 20 }}>
                  <Title level={5}>
                    {goal.subjectId
                      ? subjects.find(s => s.id === goal.subjectId)?.name
                      : 'Tổng tất cả môn'}
                  </Title>
                  <p>Tháng: {goal.month}</p>
                  <Progress percent={Number(percent.toFixed(1))} />
                  <Tag color={done ? 'green' : 'red'}>
                    {done ? 'Hoàn thành' : 'Chưa đạt'}
                  </Tag>
                  <br /><br />
                  <Space>
                    <Button size="small" onClick={() => {
                      setEditingGoal(goal);
                      formGoal.setFieldsValue({
                        ...goal,
                        month: moment(goal.month, 'YYYY-MM'),
                      });
                      setOpenGoal(true);
                    }}>Sửa</Button>
                    <Popconfirm title="Xóa mục tiêu?" onConfirm={() => deleteGoal(goal.id)}>
                      <Button danger size="small">Xóa</Button>
                    </Popconfirm>
                  </Space>
                </Card>
              );
            })}
          </Card>
        </Space>
      </Content>

      {/* MODALS */}

      <Modal
        visible={openSubject}
        title={editingSubject ? 'Sửa môn' : 'Thêm môn'}
        onOk={() => formSubject.submit()}
        onCancel={() => { setOpenSubject(false); setEditingSubject(null); formSubject.resetFields(); }}
      >
        <Form form={formSubject} onFinish={saveSubject}>
          <Form.Item name="name" label="Tên môn" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        visible={openSession}
        title={editingSession ? 'Sửa lịch học' : 'Thêm lịch học'}
        onOk={() => formSession.submit()}
        onCancel={() => { setOpenSession(false); setEditingSession(null); formSession.resetFields(); }}
      >
        <Form form={formSession} layout="vertical" onFinish={saveSession}>
          <Form.Item name="subjectId" label="Môn học" rules={[{ required: true }]}>
            <Select>{subjects.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}</Select>
          </Form.Item>
          <Form.Item name="date" label="Ngày học" rules={[{ required: true }]}>
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="duration" label="Thời lượng" rules={[{ required: true }]}>
            <InputNumber min={0.5} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        visible={openGoal}
        title={editingGoal ? 'Sửa mục tiêu' : 'Thêm mục tiêu'}
        onOk={() => formGoal.submit()}
        onCancel={() => { setOpenGoal(false); setEditingGoal(null); formGoal.resetFields(); }}
      >
        <Form form={formGoal} layout="vertical" onFinish={saveGoal}>
          <Form.Item name="month" label="Tháng" rules={[{ required: true }]}>
            <DatePicker picker="month" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="subjectId" label="Môn (để trống = tổng)">
            <Select allowClear>
              {subjects.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="totalDuration" label="Mục tiêu giờ" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}