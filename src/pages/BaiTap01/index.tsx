import { useState } from 'react';
import {
  Card,
  Input,
  Button,
  Typography,
  Space,
  List,
  Tag,
  message,
  Divider,
} from 'antd';

const { Title, Text } = Typography;

type LichSuItem = {
  value: number;
  result: 'higher' | 'lower' | 'correct';
};

const BaiTap01 = () => {
  const [soNgauNhien, setSoNgauNhien] = useState(
    Math.floor(Math.random() * 100) + 1
  );
  const [soDoan, setSoDoan] = useState<string>('');
  const [ketQua, setKetQua] = useState('');
  const [lichSu, setLichSu] = useState<LichSuItem[]>([]);
  const [soLanDoan, setSoLanDoan] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const xuLyDoan = () => {
    const so = Number(soDoan);

    if (!soDoan) {
      message.warning('Vui lòng nhập số!');
      return;
    }

    if (so < 1 || so > 100) {
      message.error('Số phải từ 1 đến 100!');
      return;
    }

    setSoLanDoan((prev) => prev + 1);

    let result: LichSuItem['result'];

    if (so === soNgauNhien) {
      result = 'correct';
      setKetQua('🎉 Bạn đã đoán đúng!');
      setGameOver(true);
      message.success('Chúc mừng!');
    } else if (so > soNgauNhien) {
      result = 'higher';
      setKetQua('🔻 Số nhỏ hơn');
    } else {
      result = 'lower';
      setKetQua('🔺 Số lớn hơn');
    }

    setLichSu((prev) => [{ value: so, result }, ...prev]);
    setSoDoan('');
  };

  const choiLai = () => {
    setSoNgauNhien(Math.floor(Math.random() * 100) + 1);
    setSoDoan('');
    setKetQua('');
    setLichSu([]);
    setSoLanDoan(0);
    setGameOver(false);
  };

  const renderResultTag = (item: LichSuItem) => {
    switch (item.result) {
      case 'higher':
        return <Tag color="red">Lớn hơn</Tag>;
      case 'lower':
        return <Tag color="orange">Nhỏ hơn</Tag>;
      case 'correct':
        return <Tag color="green">Đúng</Tag>;
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f0f2f5',
        padding: 40,
      }}
    >
      <Card
        title={
          <Title level={4} style={{ margin: 0, color: '#cf1322' }}>
            🎯 BÀI TẬP 01 - GAME ĐOÁN SỐ
          </Title>
        }
        style={{
          maxWidth: 650,
          margin: '0 auto',
          borderTop: '4px solid #cf1322',
        }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Text type="secondary">
            Hãy đoán một số từ <b>1 đến 100</b>
          </Text>

          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={soDoan}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*$/.test(value)) {
                setSoDoan(value);
              }
            }}
            disabled={gameOver}
            size="large"
            placeholder="Nhập số bạn đoán..."
          />

          <Button
            type="primary"
            danger
            size="large"
            block
            onClick={xuLyDoan}
            disabled={gameOver}
            style={{ fontWeight: 600 }}
          >
            ĐOÁN NGAY
          </Button>

          {ketQua && (
            <Text strong style={{ fontSize: 16 }}>
              {ketQua}
            </Text>
          )}

          <Divider />

          <Text>
            📌 Số lần đoán:{' '}
            <Tag color="red" style={{ fontSize: 14 }}>
              {soLanDoan}
            </Tag>
          </Text>

          {lichSu.length > 0 && (
            <>
              <Title level={5} style={{ color: '#cf1322' }}>
                📜 LỊCH SỬ ĐOÁN
              </Title>

              <List
                bordered
                dataSource={lichSu}
                renderItem={(item, index) => (
                  <List.Item
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>
                      Lần {soLanDoan - index} - Bạn đoán:{' '}
                      <Tag color="geekblue">{item.value}</Tag>
                    </span>

                    {renderResultTag(item)}
                  </List.Item>
                )}
                style={{
                  borderRadius: 8,
                }}
              />
            </>
          )}

          {gameOver && (
            <Button
              block
              onClick={choiLai}
              style={{
                marginTop: 10,
              }}
            >
              🔄 Chơi lại
            </Button>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default BaiTap01;