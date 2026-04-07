import { Card, Alert } from 'antd';
import { Pie } from '@ant-design/plots';
import { useStore } from './store';

export default function Budget() {
  const { getPlan, calcTotal } = useStore();

  const total = calcTotal(getPlan());
  const limit = 1000;

  return (
    <Card>
      {total > limit && <Alert type="error" message="Vượt ngân sách!" />}

      <Pie
        data={[
          { type: 'Ăn', value: total * 0.2 },
          { type: 'Di chuyển', value: total * 0.3 },
          { type: 'Lưu trú', value: total * 0.5 },
        ]}
        angleField="value"
        colorField="type"
      />

      <h3>{total}$</h3>
    </Card>
  );
}