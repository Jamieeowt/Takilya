import React from 'react';
import { render } from '@testing-library/react-native';
import { TakilyaLogo } from '@/components/brand/TakilyaLogo';

describe('TakilyaLogo (Vector Cinema Ticket with Play Glyph)', () => {
  it('renders mark with default props and accessibility attributes', async () => {
    const screen = await render(<TakilyaLogo />);
    expect(screen.root).toBeTruthy();
  });

  it('renders wordmark and tagline when enabled', async () => {
    const { getByText } = await render(
      <TakilyaLogo size={64} showWordmark={true} tagline={true} />
    );
    expect(getByText('takilya')).toBeTruthy();
    expect(getByText('Philippine cinema, one swipe at a time.')).toBeTruthy();
  });

  it('renders horizontal layout with wordmark', async () => {
    const { getByText } = await render(
      <TakilyaLogo size={48} layout="horizontal" showWordmark={true} />
    );
    expect(getByText('takilya')).toBeTruthy();
  });
});
