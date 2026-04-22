import { Tag, Typography } from 'antd';
import { useParams } from 'react-router-dom';

type AdminPageShellProps = {
  description: string;
  tag?: string;
  title: string;
};

function AdminPageShell({ description, tag, title }: AdminPageShellProps) {
  return (
    <div className='admin-page'>
      <header className='admin-page__header'>
        <div>
          <Typography.Title className='admin-page__title' level={2}>
            {title}
          </Typography.Title>
          <Typography.Paragraph className='admin-page__subtitle'>
            {description}
          </Typography.Paragraph>
        </div>
        {tag ? <Tag color='blue'>{tag}</Tag> : null}
      </header>

      <section className='admin-page__empty'>
        这里先保留一个轻量占位页，后续可以在这个路由入口继续接入真实业务视图。
      </section>
    </div>
  );
}

export function AdminDashboardPage() {
  return (
    <AdminPageShell
      description='快速查看运营概况、关键告警和最近操作。'
      tag='概览'
      title='运营概览'
    />
  );
}

export function AdminSectionPage({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return <AdminPageShell description={description} title={title} />;
}

export function AdminDetailPage({
  kind,
  mode,
  paramKey,
}: {
  kind: string;
  mode: 'detail' | 'editor';
  paramKey: 'eventId' | 'orderId' | 'refundId' | 'userId';
}) {
  const params = useParams();
  const id = params[paramKey] ?? '未命名';
  const title = mode === 'editor' ? `${kind}编辑器` : `${kind}详情`;

  return (
    <AdminPageShell
      description={`当前 ${kind} 编号：${id}，此处先保留后续编辑/详情页面入口。`}
      tag={mode === 'editor' ? '编辑器' : '详情'}
      title={title}
    />
  );
}
