import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FilmReviewsSection } from '../../components/film/FilmReviewsSection';
import { FilmReviewItem } from '../../features/films/types';

describe('Unit Test: Spoiler Blur & Mask Logic (Prompt 5.1 & AGENTS.md)', () => {
  const MOCK_REVIEWS: FilmReviewItem[] = [
    {
      id: 'rev-spoiler-1',
      film_id: 'film-1',
      user_id: 'u-1',
      user_name: 'Cinephile User',
      user_username: 'cinephile',
      user_role: 'user',
      rating: 4.5,
      title: 'Shocking Ending',
      body: 'Elsa reveals the secret atop the hill in the final scene.',
      has_spoilers: true,
      is_critic_review: false,
      created_at: new Date().toISOString(),
    },
    {
      id: 'rev-clean-2',
      film_id: 'film-1',
      user_id: 'u-2',
      user_name: 'Normal Viewer',
      user_username: 'normal_viewer',
      user_role: 'user',
      rating: 4.0,
      title: 'Great cinematography',
      body: 'The desert lighting in Cupang is magnificent.',
      has_spoilers: false,
      is_critic_review: false,
      created_at: new Date().toISOString(),
    },
  ];

  it('renders blurred spoiler mask initially for reviews marked with has_spoilers = true', async () => {
    const { getByText, queryByText } = await render(
      <FilmReviewsSection
        reviews={MOCK_REVIEWS}
        filmTitle="Himala"
        onWriteReview={jest.fn()}
      />
    );

    // Clean review is visible directly
    expect(getByText('The desert lighting in Cupang is magnificent.')).toBeTruthy();

    // Spoiler review body is hidden behind the mask
    expect(
      queryByText('Elsa reveals the secret atop the hill in the final scene.')
    ).toBeNull();

    // Spoiler mask warning text is shown
    expect(getByText('Contains spoilers. Tap to reveal review.')).toBeTruthy();
  });

  it('reveals spoiler content when user taps the spoiler mask toggle', async () => {
    const { getByText, queryByText } = await render(
      <FilmReviewsSection
        reviews={MOCK_REVIEWS}
        filmTitle="Himala"
        onWriteReview={jest.fn()}
      />
    );

    const spoilerMaskButton = getByText('Contains spoilers. Tap to reveal review.');
    await fireEvent.press(spoilerMaskButton);

    // Now the spoiler review text should be visible
    expect(
      getByText('Elsa reveals the secret atop the hill in the final scene.')
    ).toBeTruthy();

    // The mask warning is no longer shown for this review
    expect(
      queryByText('Contains spoilers. Tap to reveal review.')
    ).toBeNull();
  });
});

