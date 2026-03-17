// FULL UPGRADED VERSION - LOGIC CHUẨN THEO ĐỀ
import {
  Layout,
  Menu,
  Table,
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  message,
  Card,
  Tag,
  Space,
  Rate,
} from "antd";
import {
  UserOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  BarChartOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import { storage } from "@/utils/storage";
import { history } from "umi";

const { Header, Sider, Content } = Layout;

export default () => {
  const user = storage.get("user");
  const role = user?.role;

  const [menu, setMenu] = useState("appointment");

  const [staffs, setStaffs] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    if (!user) history.push("/login");
  }, []);

  const logout = () => {
    storage.remove("user");
    history.push("/login");
  };

  // ===== STAFF =====
  const addStaff = (v: any) => {
    setStaffs([
      ...staffs,
      {
        ...v,
        id: Date.now(),
      },
    ]);
  };

  // ===== SERVICE =====
  const addService = (v: any) => {
    setServices([
      ...services,
      {
        ...v,
        id: Date.now(),
      },
    ]);
  };

  // ===== CHECK =====
  const checkValid = (v: any) => {
    const staff = staffs.find((s) => s.id === v.staffId);
    const service = services.find((s) => s.id === v.serviceId);

    if (!staff || !service) return false;

    const start = v.date.toDate();
    const end = new Date(start.getTime() + service.duration * 60000);

    // check working day
    const day = start.getDay();
    if (!staff.workDays?.includes(day)) {
      message.error("Nhân viên không làm ngày này");
      return false;
    }

    // check working hour
    if (start.getHours() < staff.start || start.getHours() >= staff.end) {
      message.error("Ngoài giờ làm việc");
      return false;
    }

    // check limit per day
    const dateStr = v.date.format("YYYY-MM-DD");
    const count = appointments.filter(
      (a) => a.staffId === staff.id && a.date === dateStr
    ).length;

    if (count >= staff.limit) {
      message.error("Đã đủ khách/ngày");
      return false;
    }

    // check conflict
    const conflict = appointments.some(
      (a) =>
        a.staffId === staff.id &&
        start < new Date(a.end) &&
        end > new Date(a.start)
    );

    if (conflict) {
      message.error("Trùng lịch");
      return false;
    }

    return { start, end, dateStr };
  };

  // ===== ADD APPOINTMENT =====
  const addAppointment = (v: any) => {
    const check = checkValid(v);
    if (!check) return;

    setAppointments([
      ...appointments,
      {
        id: Date.now(),
        ...v,
        ...check,
        customerId: user.id,
        status: "Chờ duyệt",
      },
    ]);
  };

  // ===== REVIEW =====
  const addReview = (id: number, rating: number) => {
    setReviews([...reviews, { appointmentId: id, rating, reply: "" }]);
  };

  const replyReview = (id: number, reply: string) => {
    setReviews(
      reviews.map((r) =>
        r.appointmentId === id ? { ...r, reply } : r
      )
    );
  };

  const getAvg = (staffId: number) => {
    const list = reviews.filter((r) => {
      const a = appointments.find((x) => x.id === r.appointmentId);
      return a?.staffId === staffId;
    });
    if (!list.length) return 0;
    return (
      list.reduce((s, r) => s + r.rating, 0) / list.length
    ).toFixed(1);
  };

  // ===== FILTER =====
  const filteredAppointments =
    role === "staff"
      ? appointments.filter((a) => a.staffId === user.id)
      : role === "customer"
      ? appointments.filter((a) => a.customerId === user.id)
      : appointments;

  const getStaff = (id: number) => staffs.find((s) => s.id === id)?.name;
  const getService = (id: number) => services.find((s) => s.id === id)?.name;

  // ===== STATS =====
  const stats: any = {};
  appointments.forEach((a) => {
    stats[a.date] = (stats[a.date] || 0) + 1;
  });

  // ===== UI =====
  const renderContent = () => {
    switch (menu) {
      case "staff":
        return (
          <Card title="Nhân viên">
            <Form layout="inline" onFinish={addStaff}>
              <Form.Item name="name" rules={[{ required: true }]}>
                <Input placeholder="Tên" />
              </Form.Item>
              <Form.Item name="limit">
                <InputNumber placeholder="Khách/ngày" />
              </Form.Item>
              <Form.Item name="start">
                <InputNumber placeholder="Giờ bắt đầu" />
              </Form.Item>
              <Form.Item name="end">
                <InputNumber placeholder="Giờ kết thúc" />
              </Form.Item>
              <Form.Item name="workDays">
                <Select mode="multiple" placeholder="Ngày làm">
                  <Select.Option value={5}>Thứ 6</Select.Option>
                </Select>
              </Form.Item>
              <Button type="primary" htmlType="submit">Thêm</Button>
            </Form>

            <Table
              rowKey="id"
              dataSource={staffs}
              columns={[
                { title: "Tên", dataIndex: "name" },
                { title: "Rating", render: (_, r) => getAvg(r.id) },
              ]}
            />
          </Card>
        );

      case "service":
        return (
          <Card title="Dịch vụ">
            <Form layout="inline" onFinish={addService}>
              <Form.Item name="name" rules={[{ required: true }]}>
                <Input placeholder="Tên" />
              </Form.Item>
              <Form.Item name="duration">
                <InputNumber placeholder="Phút" />
              </Form.Item>
              <Form.Item name="price">
                <InputNumber placeholder="Giá" />
              </Form.Item>
              <Button type="primary" htmlType="submit">Thêm</Button>
            </Form>

            <Table
              rowKey="id"
              dataSource={services}
              columns={[{ title: "Tên", dataIndex: "name" }]}
            />
          </Card>
        );

      case "appointment":
        return (
          <>
            {role === "customer" && (
              <Card title="Đặt lịch" style={{ marginBottom: 20 }}>
                <Form layout="inline" onFinish={addAppointment}>
                  <Form.Item name="staffId" rules={[{ required: true }]}>
                    <Select placeholder="Nhân viên" style={{ width: 150 }}>
                      {staffs.map((s) => (
                        <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item name="serviceId" rules={[{ required: true }]}>
                    <Select placeholder="Dịch vụ" style={{ width: 150 }}>
                      {services.map((s) => (
                        <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item name="date" rules={[{ required: true }]}>
                    <DatePicker showTime />
                  </Form.Item>

                  <Button type="primary" htmlType="submit">Đặt</Button>
                </Form>
              </Card>
            )}

            <Card title="Lịch hẹn">
              <Table
                rowKey="id"
                dataSource={filteredAppointments}
                columns={[
                  { title: "Nhân viên", render: (_, r) => getStaff(r.staffId) },
                  { title: "Dịch vụ", render: (_, r) => getService(r.serviceId) },
                  { title: "Trạng thái", dataIndex: "status" },
                  {
                    title: "Đánh giá",
                    render: (_, r) =>
                      r.status === "Hoàn thành" && (
                        <>
                          {role === "customer" && (
                            <Rate onChange={(val) => addReview(r.id, val)} />
                          )}
                          {role === "staff" && (
                            <Input
                              placeholder="Reply"
                              onPressEnter={(e) => replyReview(r.id, e.currentTarget.value)}
                            />
                          )}
                        </>
                      ),
                  },
                ]}
              />
            </Card>
          </>
        );

      case "stats":
        return (
          <Card title="Thống kê">
            {Object.keys(stats).map((d) => (
              <div key={d}>{d}: {stats[d]} lịch</div>
            ))}
          </Card>
        );
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider>
        <Menu theme="dark" onClick={(e) => setMenu(e.key)}>
          {role === "admin" && <Menu.Item key="staff">Nhân viên</Menu.Item>}
          {role === "admin" && <Menu.Item key="service">Dịch vụ</Menu.Item>}
          <Menu.Item key="appointment">Lịch hẹn</Menu.Item>
          {role === "admin" && <Menu.Item key="stats">Thống kê</Menu.Item>}
        </Menu>
      </Sider>

      <Layout>
        <Header style={{ background: "#fff", textAlign: "right" }}>
          <Space>
            <Tag color="blue">{role}</Tag>
            <Button danger icon={<LogoutOutlined />} onClick={logout}>Logout</Button>
          </Space>
        </Header>

        <Content style={{ margin: 20 }}>{renderContent()}</Content>
      </Layout>
    </Layout>
  );
};
