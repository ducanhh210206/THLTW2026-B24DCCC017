import { Timeline } from 'antd';

export default ({ data }: any) => {
  return (
    <Timeline>
      {data?.map((i: any, idx: number) => (
        <Timeline.Item key={idx}>
          {i.name} - {i.action} - {i.time}
        </Timeline.Item>
      ))}
    </Timeline>
  );
};