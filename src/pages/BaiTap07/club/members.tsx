import { ProTable } from '@ant-design/pro-components';

export default () => {
  return (
    <ProTable
      rowKey="id"
      columns={[{ title: 'Tên', dataIndex: 'name' }]}
      request={async () => ({
        data: [{ id: 1, name: 'Member A' }],
      })}
    />
  );
};