import React, { useState } from 'react';
import { Button, Input, Space, message } from 'antd';
import ProductTable from './components/ProductTable';
import ProductForm from './components/ProductForm';

const ProductPage = () => {

    const [products, setProducts] = useState([
        { id: 1, name: 'Laptop Dell XPS 13', price: 25000000, quantity: 10 },
        { id: 2, name: 'iPhone 15 Pro Max', price: 30000000, quantity: 15 },
        { id: 3, name: 'Samsung Galaxy S24', price: 22000000, quantity: 20 },
        { id: 4, name: 'iPad Air M2', price: 18000000, quantity: 12 },
        { id: 5, name: 'MacBook Air M3', price: 28000000, quantity: 8 },
    ]);

    const [open, setOpen] = useState(false);
    const [searchText, setSearchText] = useState('');

    const handleAddProduct = (values) => {
        const newProduct = {
            id: Date.now(),
            ...values,
        };
        setProducts([...products, newProduct]);
        message.success('Thêm sản phẩm thành công');
        setOpen(false);
    };

    const handleDeleteProduct = (id) => {
        setProducts(products.filter((item) => item.id !== id));
        message.success('Xóa sản phẩm thành công');
    };

    const filteredProducts = products.filter((item) =>
        item.name.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div style={{ padding: 24 }}>
            <h2>Quản lý Sản phẩm</h2>
            <Space style={{ marginBottom: 16 }}>
                <Input.Search
                    placeholder="Tìm kiếm sản phẩm"
                    allowClear
                    onChange={(e) => setSearchText(e.target.value)}
                />
                <Button type="primary" onClick={() => setOpen(true)}>
                    Thêm sản phẩm
                </Button>
            </Space>
            <ProductTable
                data={filteredProducts}
                onDelete={handleDeleteProduct}
            />

            <ProductForm
                open={open}
                onCancel={() => setOpen(false)}
                onSubmit={handleAddProduct}
            />
        </div>
    );
};

export default ProductPage;
