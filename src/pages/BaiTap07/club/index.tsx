import { ProTable } from '@ant-design/pro-components';
import { Button, Switch } from 'antd';
import { useState } from 'react';

export default () => {
  const [data, setData] = useState([
    { id: 1, name: 'CLB IT', active: true },
  ]);

  return (
    <ProTable
      rowKey="id"
      dataSource={data}
      columns={[
        { title: 'Tên CLB', dataIndex: 'name' },
        {
          title: 'Hoạt động',
          render: (_, r) => (
            <Switch
              checked={r.active}
              onChange={(val) =>
                setData((prev) =>
                  prev.map((i) =>
                    i.id === r.id ? { ...i, active: val } : i,
                  ),
                )
              }
            />
          ),
        },
        {
          title: 'Xóa',
          render: (_, r) => (
            <Button
              danger
              onClick={() =>
                setData((prev) => prev.filter((i) => i.id !== r.id))
              }
            >
              Xóa
            </Button>
          ),
        },
      ]}
    />
  );
};