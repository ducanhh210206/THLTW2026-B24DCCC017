import { Form, Input, Button, Card, message } from "antd";
import { history } from "umi";
import { storage } from "@/utils/storage";

export default () => {
  const onFinish = (values: any) => {
    const { username } = values;

    let user;

    if (username === "admin") {
      user = { id: 1, role: "admin", name: "Admin" };
    } else if (username === "staff") {
      user = { id: 2, role: "staff", name: "Nhân viên" };
    } else {
      user = { id: 3, role: "customer", name: "Khách" };
    }

    storage.set("user", user);
    message.success("Đăng nhập thành công");
    history.push("/BaiTap05");
  };

  return (
    <Card title="Login" style={{ width: 400, margin: "100px auto" }}>
      <Form onFinish={onFinish}>
        <Form.Item name="username" rules={[{ required: true }]}>
          <Input placeholder="admin / staff / customer" />
        </Form.Item>

        <Form.Item name="password">
          <Input.Password placeholder="nhập gì cũng được" />
        </Form.Item>

        <Button type="primary" htmlType="submit" block>
          Login
        </Button>
      </Form>
    </Card>
  );
};