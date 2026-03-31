import { ProTable } from '@ant-design/pro-components';
import { Button, Modal, Select, message } from 'antd';
import { useState } from 'react';

export default () => {
  const [data, setData] = useState([
    { id: 1, name: 'Nguyễn A', club: 'IT' },
  ]);

  const [selected, setSelected] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [club, setClub] = useState('');

  const transfer = () => {
    if (!club) return message.error('Chọn CLB');

    setData((prev) =>
      prev.map((i) =>
        selected.some((s) => s.id === i.id)
          ? { ...i, club }
          : i,
      ),
    );

    setOpen(false);
    setSelected([]);
    message.success('Đã chuyển CLB');
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Chuyển CLB ({selected.length})
      </Button>

      <ProTable
        rowKey="id"
        dataSource={data}
        columns={[
          { title: 'Tên', dataIndex: 'name' },
          { title: 'CLB', dataIndex: 'club' },
        ]}
        rowSelection={{
          onChange: (_, rows) => setSelected(rows),
        }}
      />

      <Modal open={open} onOk={transfer} onCancel={() => setOpen(false)}>
        <Select
          style={{ width: '100%' }}
          onChange={setClub}
          options={[
            { label: 'IT', value: 'IT' },
            { label: 'Media', value: 'Media' },
          ]}
        />
      </Modal>
    </>
  );
};