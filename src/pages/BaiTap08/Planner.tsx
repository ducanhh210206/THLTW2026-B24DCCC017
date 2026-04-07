import { Button, Card, Alert } from 'antd';
import { useState, useEffect } from 'react';
import { useStore } from './store';

export default function Planner() {
  const { getPlan, savePlan, getDestinations, calcDay } = useStore();

  const [plan, setPlan] = useState(getPlan());
  const destinations = getDestinations();

  useEffect(() => {
    savePlan(plan);
  }, [plan]);

  const addDay = () => {
    setPlan([...plan, { date: `Ngày ${plan.length + 1}`, places: [] }]);
  };

  const addPlace = (i: number, p: any) => {
    const newPlan = [...plan];

    // ❌ không cho trùng
    if (newPlan[i].places.find(x => x.id === p.id)) return;

    newPlan[i].places.push(p);
    setPlan(newPlan);
  };

  const removePlace = (i: number, id: number) => {
    const newPlan = [...plan];
    newPlan[i].places = newPlan[i].places.filter(p => p.id !== id);
    setPlan(newPlan);
  };

  return (
    <div>
      <Button onClick={addDay}>+ Ngày</Button>

      {plan.map((d, i) => {
        const { time, cost } = calcDay(d.places);

        return (
          <Card key={i} title={d.date}>
            {time > 8 && <Alert type="warning" message="Quá 8h/ngày!" />}

            {d.places.map(p => (
              <div key={p.id}>
                {p.name} - {p.price}$ - {p.duration}h
                <Button danger onClick={() => removePlace(i, p.id)}>x</Button>
              </div>
            ))}

            {destinations.map(p => (
              <Button key={p.id} onClick={() => addPlace(i, p)}>
                + {p.name}
              </Button>
            ))}

            <p>⏱ {time}h | 💰 {cost}$</p>
          </Card>
        );
      })}
    </div>
  );
}