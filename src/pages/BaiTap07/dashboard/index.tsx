import { Column } from '@ant-design/plots';

export default () => {
  const data = [
    { club: 'IT', type: 'Pending', value: 10 },
    { club: 'IT', type: 'Approved', value: 20 },
    { club: 'IT', type: 'Rejected', value: 5 },
    { club: 'Media', type: 'Pending', value: 8 },
  ];

  return (
    <Column
      data={data}
      xField="club"
      yField="value"
      seriesField="type"
      isGroup
      label={{ position: 'middle' }}
    />
  );
};