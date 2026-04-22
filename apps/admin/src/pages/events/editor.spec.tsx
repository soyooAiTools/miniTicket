import { act, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { getAdminEventEditorDetail } from '../../services/admin-events';
import { EventEditorPage } from './editor';

vi.mock('../../services/admin-events', () => ({
  createAdminEvent: vi.fn(),
  getAdminEventDetail: vi.fn(),
  getAdminEventEditorDetail: vi.fn(),
  publishAdminEvent: vi.fn(),
  unpublishAdminEvent: vi.fn(),
  updateAdminEvent: vi.fn(),
}));

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((nextResolve) => {
    resolve = nextResolve;
  });

  return { promise, resolve };
}

type EditorDetailFixture = Awaited<ReturnType<typeof getAdminEventEditorDetail>>;

function buildEditorDetail(overrides: Partial<EditorDetailFixture> = {}): EditorDetailFixture {
  return {
    city: '上海',
    coverImageUrl: 'https://example.com/cover.jpg',
    description: '运营活动说明',
    id: 'event_001',
    published: false,
    sessions: [
      {
        endsAt: '2026-05-01T13:30:00.000Z',
        id: 'session_001',
        name: '2026-05-01 19:30',
        saleEndsAt: '2026-05-01T11:00:00.000Z',
        saleStartsAt: '2026-04-18T02:00:00.000Z',
        startsAt: '2026-05-01T11:30:00.000Z',
        tiers: [
          {
            id: 'tier_vip',
            inventory: 120,
            name: 'VIP Standing',
            price: 799,
            purchaseLimit: 4,
            refundable: true,
            refundDeadlineAt: '2026-04-29T16:00:00.000Z',
            requiresRealName: true,
            sortOrder: 1,
            ticketType: 'E_TICKET',
          },
        ],
      },
    ],
    title: 'Beta Livehouse Night',
    venueAddress: '上海市徐汇区龙腾大道3000号',
    venueName: 'West Bund Arena',
    ...overrides,
  };
}

describe('EventEditorPage', () => {
  it('keeps edit mode locked on load failure and shows retry state', async () => {
    vi.mocked(getAdminEventEditorDetail).mockRejectedValue(
      new Error('网络异常'),
    );

    render(
      <MemoryRouter initialEntries={['/events/event_broken/edit']}>
        <Routes>
          <Route
            element={<EventEditorPage mode='edit' />}
            path='/events/:eventId/edit'
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText('网络异常')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '淇濆瓨鑽夌' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '重试加载' })).toBeInTheDocument();
  });

  it('keeps edit actions hidden until preload completes', async () => {
    const deferred = createDeferred<ReturnType<typeof buildEditorDetail>>();
    vi.mocked(getAdminEventEditorDetail).mockReturnValueOnce(deferred.promise);

    render(
      <MemoryRouter initialEntries={['/events/event_001/edit']}>
        <Routes>
          <Route
            element={<EventEditorPage mode='edit' />}
            path='/events/:eventId/edit'
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      screen.queryByRole('button', { name: '保存草稿' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('正在加载活动信息...')).toBeInTheDocument();

    await act(async () => {
      deferred.resolve(buildEditorDetail());
    });

    expect(
      await screen.findByRole('button', { name: '保存草稿' }),
    ).toBeInTheDocument();
  });

  it('preloads admin venue address in edit mode', async () => {
    vi.mocked(getAdminEventEditorDetail).mockResolvedValue(
      buildEditorDetail(),
    );

    render(
      <MemoryRouter initialEntries={['/events/event_001/edit']}>
        <Routes>
          <Route
            element={<EventEditorPage mode='edit' />}
            path='/events/:eventId/edit'
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      await screen.findByDisplayValue('上海市徐汇区龙腾大道3000号'),
    ).toBeInTheDocument();
  });

  it('falls back to default sessions for legacy events without sessions', async () => {
    vi.mocked(getAdminEventEditorDetail).mockResolvedValue(
      buildEditorDetail({ sessions: [] }),
    );

    render(
      <MemoryRouter initialEntries={['/events/event_legacy/edit']}>
        <Routes>
          <Route
            element={<EventEditorPage mode='edit' />}
            path='/events/:eventId/edit'
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      await screen.findByDisplayValue('上海市徐汇区龙腾大道3000号'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('场次名称')).toBeInTheDocument();
  });

  it('renders Chinese regional-tier fields in create mode', () => {
    render(
      <MemoryRouter>
        <EventEditorPage mode='create' />
      </MemoryRouter>,
    );

    expect(screen.getByText('区域票档')).toBeInTheDocument();
    expect(screen.getByLabelText('区域名称')).toBeInTheDocument();
    expect(screen.getByLabelText('每单限购')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '保存草稿' })).toBeInTheDocument();
  });
});
