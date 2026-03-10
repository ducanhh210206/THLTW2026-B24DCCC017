import React, { useState } from "react";
import {Card,Button,Table,Row,Col,Statistic,Tag,Typography,Space,Divider,} from "antd";
import type { ColumnsType } from "antd/es/table";

const { Title } = Typography;

const choices = ["Kéo", "Búa", "Bao"];

interface GameHistory {
    key: number;
    round: number;
    player: string;
    computer: string;
    result: string;
}

interface Stats {
  win: number;
  lose: number;
  draw: number;
}

const KeoBuaBao: React.FC = () => {
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [player, setPlayer] = useState<string>("");
  const [computer, setComputer] = useState<string>("");
  const [result, setResult] = useState<string>("");

  const [stats, setStats] = useState<Stats>({
    win: 0,
    lose: 0,
    draw: 0,
  });

  const randomChoice = (): string => {
    const index = Math.floor(Math.random() * 3);
    return choices[index];
  };

  const getResult = (p: string, c: string): string => {
    if (p === c) return "Hòa";

    if (
      (p === "Kéo" && c === "Bao") ||
      (p === "Búa" && c === "Kéo") ||
      (p === "Bao" && c === "Búa")
    ) {
      return "Thắng";
    }

    return "Thua";
  };

  const play = (choice: string) => {
    const computerChoice = randomChoice();
    const gameResult = getResult(choice, computerChoice);

    setPlayer(choice);
    setComputer(computerChoice);
    setResult(gameResult);

    const newRound: GameHistory = {
      key: history.length + 1,
      round: history.length + 1,
      player: choice,
      computer: computerChoice,
      result: gameResult,
    };

    setHistory([newRound, ...history]);

    if (gameResult === "Thắng") {
      setStats({ ...stats, win: stats.win + 1 });
    } else if (gameResult === "Thua") {
      setStats({ ...stats, lose: stats.lose + 1 });
    } else {
      setStats({ ...stats, draw: stats.draw + 1 });
    }
  };

  const resetGame = () => {
    setHistory([]);
    setStats({ win: 0, lose: 0, draw: 0 });
    setPlayer("");
    setComputer("");
    setResult("");
  };

  const columns: ColumnsType<GameHistory> = [
    {
      title: "Ván",
      dataIndex: "round",
      width: 80,
    },
    {
      title: "Người chơi",
      dataIndex: "player",
    },
    {
      title: "Máy tính",
      dataIndex: "computer",
    },
    {
      title: "Kết quả",
      dataIndex: "result",
      render: (text: string) => {
        if (text === "Thắng") return <Tag color="green">Thắng</Tag>;
        if (text === "Thua") return <Tag color="red">Thua</Tag>;
        return <Tag color="gold">Hòa</Tag>;
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>🎮 Game Kéo Búa Bao</Title>

      {/* Thống kê */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Thắng"
              value={stats.win}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card>
            <Statistic
              title="Thua"
              value={stats.lose}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card>
            <Statistic title="Hòa" value={stats.draw} />
          </Card>
        </Col>
      </Row>

      {/* Khu vực chơi */}
      <Card style={{ marginBottom: 20 }}>
        <Title level={4}>Chọn nước đi</Title>

        <Space size="large">
          <Button type="primary" size="large" onClick={() => play("Kéo")}>
            ✌️ Kéo
          </Button>

          <Button type="primary" size="large" onClick={() => play("Búa")}>
            ✊ Búa
          </Button>

          <Button type="primary" size="large" onClick={() => play("Bao")}>
            ✋ Bao
          </Button>

          <Button danger onClick={resetGame}>
            Reset
          </Button>
        </Space>

        <Divider />

        <Row gutter={16}>
          <Col span={8}>
            <Card>
              <Statistic title="Bạn chọn" value={player || "-"} />
            </Card>
          </Col>

          <Col span={8}>
            <Card>
              <Statistic title="Máy chọn" value={computer || "-"} />
            </Card>
          </Col>

          <Col span={8}>
            <Card>
              <Statistic title="Kết quả" value={result || "-"} />
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Lịch sử */}
      <Card title="📜 Lịch sử ván đấu">
        <Table<GameHistory>
          columns={columns}
          dataSource={history}
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  );
};

export default KeoBuaBao;