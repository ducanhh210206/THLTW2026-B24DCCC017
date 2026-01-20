import React from 'react';
import { Modal, Form, Input, InputNumber, Button } from 'antd';

const ProductForm = ({ open, onCancel, onSubmit }) => {
  const [form] = Form.useForm();

  const handleFinish = (values) => {
    onSubmit(values);
    form.resetFields();
  };

  return (
    <Modal
      title="Thêm sản phẩm mới"
      open={open}
      onCancel={onCancel}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
      >
        <Form.Item
          label="Tên sản phẩm"
          name="name"
          rules={[
            { required: true, message: 'Vui lòng nhập tên sản phẩm' },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Giá"
          name="price"
          rules={[
            { required: true, message: 'Vui lòng nhập giá' },
            { type: 'number', min: 1, message: 'Giá phải là số dương' },
          ]}
        >
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="Số lượng"
          name="quantity"
          rules={[
            { required: true, message: 'Vui lòng nhập số lượng' },
            {
              type: 'number',
              min: 1,
              message: 'Số lượng phải là số nguyên dương',
            },
          ]}
        >
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Thêm
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProductForm;
