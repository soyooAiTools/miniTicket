import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { EventEditorPage } from './editor';

describe('EventEditorPage', () => {
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
