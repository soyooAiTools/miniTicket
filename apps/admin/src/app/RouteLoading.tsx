import { Spin, Typography } from 'antd';

type RouteLoadingProps = {
  fullscreen?: boolean;
};

export function RouteLoading({ fullscreen = false }: RouteLoadingProps) {
  return (
    <div
      className={`admin-route-loading${fullscreen ? ' admin-route-loading--fullscreen' : ''}`}
      role='status'
      aria-live='polite'
    >
      <Spin size='large' />
      <Typography.Text className='admin-route-loading__text'>
        正在加载页面...
      </Typography.Text>
    </div>
  );
}
