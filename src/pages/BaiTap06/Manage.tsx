import { Button, Tag } from 'antd';
import { useModel } from '@umijs/max';
import {
  ProTable,
  ModalForm,
  ProFormText,
  ProFormSelect,
} from '@ant-design/pro-components';

export default function Manage() {
  const { vanBangs, addVanBang, revokeVanBang, fields, quyetDinhs } =
    useModel('useDiploma');

  return (
    <ProTable
      rowKey="id"
      dataSource={vanBangs}
      columns={[
        { title: 'Số vào sổ', dataIndex: 'soVaoSo' },
        { title: 'Số hiệu', dataIndex: 'soHieu' },
        { title: 'Họ tên', dataIndex: 'hoTen' },
        {
          title: 'Trạng thái',
          render: (_, row) =>
            row.status === 'active' ? (
              <Tag color="green">Hoạt động</Tag>
            ) : (
              <Tag color="red">Thu hồi</Tag>
            ),
        },
        {
          title: 'Action',
          render: (_, row) => (
            <Button danger onClick={() => revokeVanBang(row.id)}>
              Thu hồi
            </Button>
          ),
        },
      ]}
      toolBarRender={() => [
        <ModalForm
          title="Cấp văn bằng"
          trigger={<Button type="primary">+ Cấp bằng</Button>}
          onFinish={async (values) => {
            const extra: any = {};
            fields.forEach((f) => {
              extra[f.name] = values[f.name];
              delete values[f.name];
            });
            addVanBang({ ...values, extra });
            return true;
          }}
        >
          <ProFormText name="soHieu" label="Số hiệu" />
          <ProFormText name="msv" label="MSV" />
          <ProFormText name="hoTen" label="Họ tên" />
          <ProFormText name="ngaySinh" label="Ngày sinh" />

          <ProFormSelect
            name="quyetDinhId"
            label="Quyết định"
            options={quyetDinhs.map((q) => ({
              label: q.soQD,
              value: q.id,
            }))}
          />

          {fields.map((f) => (
            <ProFormText key={f.id} name={f.name} label={f.name} />
          ))}
        </ModalForm>,
      ]}
    />
  );
}