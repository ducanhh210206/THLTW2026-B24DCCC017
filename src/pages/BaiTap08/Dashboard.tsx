import { Card, Statistic } from 'antd';
import { Column } from '@ant-design/plots';
import { useStore } from './store';

export default function Dashboard() {
  const { getPlan, calcTotal } = useStore();

  const plan = getPlan();
  const total = calcTotal(plan);

  const map: any = {};
  plan.flatMap(d => d.places).forEach(p => {
    map[p.name] = (map[p.name] || 0) + 1;
  });

  const data = Object.keys(map).map(name => ({
    name,
    value: map[name]
  }));

  return (
    <div>
      <Card><Statistic title="Tổng chi" value={total} /></Card>
      <Card><Column data={data} xField="name" yField="value" /></Card>
    </div>
  );
}