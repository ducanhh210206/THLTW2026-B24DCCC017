import { Link } from 'umi';
import { Card, Row, Col } from 'antd';

export default function Index() {
  const menus = [
    { title: 'Khám phá', path: '/baitap08/home' },
    { title: 'Lập lịch', path: '/baitap08/planner' },
    { title: 'Ngân sách', path: '/baitap08/budget' },
    { title: 'Quản lý', path: '/baitap08/admin' },
    { title: 'Dashboard', path: '/baitap08/dashboard' },
  ];

  return (
    <Row gutter={16}>
      {menus.map(m => (
        <Col span={8} key={m.path}>
          <Card hoverable>
            <Link to={m.path}>{m.title}</Link>
          </Card>
        </Col>
      ))}
    </Row>
  );
}