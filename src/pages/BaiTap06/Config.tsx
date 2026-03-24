import { Button, Card, Space } from 'antd';
import { useModel } from '@umijs/max';
import {
  ProTable,
  ModalForm,
  ProFormText,
  ProFormSelect,
} from '@ant-design/pro-components';

export default function Config() {
  const { fields, addField, deleteField } = useModel('useDiploma');

  return (
    <Card>
      <ProTable
        rowKey="id"
        dataSource={fields}
        search={false}
        columns={[
          { title: 'Tên', dataIndex: 'name' },
          { title: 'Kiểu', dataIndex: 'type' },
          {
            title: 'Action',
            render: (_, row) => (
              <Button danger onClick={() => deleteField(row.id)}>
                Xóa
              </Button>
            ),
          },
        ]}
        toolBarRender={() => [
          <ModalForm
            title="Thêm Field"
            onFinish={async (values) => {
              addField(values);
              return true;
            }}
            trigger={<Button type="primary">+ Field</Button>}
          >
            <ProFormText name="name" label="Tên" />
            <ProFormSelect
              name="type"
              label="Kiểu"
              options={[
                { label: 'String', value: 'string' },
                { label: 'Number', value: 'number' },
                { label: 'Date', value: 'date' },
              ]}
            />
          </ModalForm>,
        ]}
      />
    </Card>
  );
}