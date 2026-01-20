import React from 'react';
import { Table, Button, Popconfirm } from 'antd';

const ProductTable = ({ data, onDelete }) => {
  const columns = [
    {
      title: 'STT',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      render: (price) => price.toLocaleString() + ' VNĐ',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
    },
    {
      title: 'Thao tác',
      render: (_, record) => (
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa?"
          onConfirm={() => onDelete(record.id)}
        >
          <Button danger>Xóa</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
    />
  );
};

export default ProductTable;
