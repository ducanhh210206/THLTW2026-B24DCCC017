import { useState } from 'react';
import { Table, Button, Input, InputNumber, Select } from 'antd';
import { useStore } from './store';

export default function Admin() {
  const { getDestinations, saveDestinations } = useStore();

  const [data, setData] = useState(getDestinations());
  const [form, setForm] = useState<any>({});

  const add = () => {
    if (!form.name || !form.price || !form.duration) return;

    const newData = [...data, { ...form, id: Date.now() }];
    setData(newData);
    saveDestinations(newData);
  };

  return (
    <div>
      <Input placeholder="Tên" onChange={e => setForm({ ...form, name: e.target.value })} />
      <InputNumber placeholder="Giá" onChange={v => setForm({ ...form, price: v })} />
      <InputNumber placeholder="Giờ" onChange={v => setForm({ ...form, duration: v })} />

      <Select onChange={v => setForm({ ...form, type: v })}>
        <Select.Option value="biển">Biển</Select.Option>
        <Select.Option value="núi">Núi</Select.Option>
      </Select>

      <Button onClick={add}>Thêm</Button>

      <Table dataSource={data} rowKey="id" />
    </div>
  );
}