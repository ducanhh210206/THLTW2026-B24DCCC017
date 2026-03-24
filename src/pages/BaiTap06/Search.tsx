import { Button, Form, Input, Table, message } from 'antd';
import { useModel } from '@umijs/max';
import { useState } from 'react';

export default function Search() {
  const { search } = useModel('useDiploma');
  const [data, setData] = useState([]);

  return (
    <>
      <Form
        onFinish={(values) => {
          const filled = Object.values(values).filter(Boolean);

          if (filled.length < 2) {
            message.error('Nhập ít nhất 2 điều kiện');
            return;
          }

          setData(search(values));
        }}
      >
        <Input name="soHieu" placeholder="Số hiệu" />
        <Input name="msv" placeholder="MSV" />
        <Input name="hoTen" placeholder="Họ tên" />
        <Button htmlType="submit">Tra cứu</Button>
      </Form>

      <Table
        rowKey="id"
        dataSource={data}
        columns={[
          { title: 'Số vào sổ', dataIndex: 'soVaoSo' },
          { title: 'Số hiệu', dataIndex: 'soHieu' },
          { title: 'Họ tên', dataIndex: 'hoTen' },
        ]}
      />
    </>
  );
}