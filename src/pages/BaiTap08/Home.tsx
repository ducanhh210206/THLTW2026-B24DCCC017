import { Row, Col, Card, Input } from 'antd';
import { useState } from 'react';
import { useStore } from './store';

export default function Home() {
  const { get } = useStore();
  const [search, setSearch] = useState('');

  const data = get("destinations", []);

  const filtered = data.filter((d: any) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Input placeholder="Search..." onChange={e => setSearch(e.target.value)} />

      <Row gutter={16}>
        {filtered.map((item: any) => (
          <Col span={8} key={item.id}>
            <Card hoverable>
              <h3>{item.name}</h3>
              <p>{item.price}$</p>
              <p>⏱ {item.duration}h</p>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}