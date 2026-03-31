import { ProTable } from '@ant-design/pro-components';
import { Button, Modal, Input, message, Space } from 'antd';
import { useState } from 'react';
import { STATUS } from '@/utils/constants';

export default () => {
  const [data, setData] = useState([
    { id: 1, name: 'Nguyễn A', status: STATUS.PENDING },
    { id: 2, name: 'Trần B', status: STATUS.PENDING },
  ]);

  const [selected, setSelected] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [history, setHistory] = useState<any[]>([]);

  // 🔥 duyệt
  const approve = () => {
    if (!selected.length) return message.warning('Chọn bản ghi');

    setData((prev) =>
      prev.map((item) =>
        selected.some((s) => s.id === item.id)
          ? { ...item, status: STATUS.APPROVED }
          : item,
      ),
    );

    setHistory((prev) => [
      ...prev,
      ...selected.map((i) => ({
        name: i.name,
        action: 'Approved',
        time: new Date().toLocaleString(),
      })),
    ]);

    message.success('Duyệt thành công');
    setSelected([]);
  };

  // 🔥 từ chối
  const reject = () => {
    if (!reason) return message.error('Nhập lý do!');
    if (!selected.length) return message.warning('Chọn bản ghi');

    setData((prev) =>
      prev.map((item) =>
        selected.some((s) => s.id === item.id)
          ? { ...item, status: STATUS.REJECTED, reason }
          : item,
      ),
    );

    setHistory((prev) => [
      ...prev,
      ...selected.map((i) => ({
        name: i.name,
        action: 'Rejected',
        reason,
        time: new Date().toLocaleString(),
      })),
    ]);

    setOpen(false);
    setReason('');
    setSelected([]);
    message.success('Đã từ chối');
  };

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={approve}>
          Duyệt ({selected.length})
        </Button>
        <Button danger onClick={() => setOpen(true)}>
          Từ chối ({selected.length})
        </Button>
      </Space>

      <ProTable
        rowKey="id"
        dataSource={data}
        search={{ labelWidth: 80 }}
        columns={[
          { title: 'Tên', dataIndex: 'name' },
          {
            title: 'Trạng thái',
            dataIndex: 'status',
            valueEnum: {
              Pending: { text: 'Pending', status: 'Default' },
              Approved: { text: 'Approved', status: 'Success' },
              Rejected: { text: 'Rejected', status: 'Error' },
            },
          },
        ]}
        rowSelection={{
          selectedRowKeys: selected.map((i) => i.id),
          onChange: (_, rows) => setSelected(rows),
        }}
      />

      <Modal
        title="Nhập lý do từ chối"
        open={open}
        onOk={reject}
        onCancel={() => setOpen(false)}
      >
        <Input.TextArea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </Modal>
    </>
  );
};