import { Modal, Form, Input } from 'antd';

export default ({ open, onCancel }: any) => {
  return (
    <Modal open={open} onCancel={onCancel} onOk={onCancel}>
      <Form>
        <Form.Item label="Tên CLB">
          <Input />
        </Form.Item>
        <Form.Item label="Mô tả">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};