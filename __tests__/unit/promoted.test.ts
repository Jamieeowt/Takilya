import {
  injectPromotedSlots,
  PromotedInjectionItem,
} from '../../features/feed/promotedInjection';

describe('Unit Test: Promoted Slot Injection Rules (Prompt 5.1 & AGENTS.md)', () => {
  const createMockOrganicItems = (count: number): PromotedInjectionItem[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `organic-${i + 1}`,
      title: `Filipino Film ${i + 1}`,
      is_promoted: false,
    }));
  };

  const MOCK_PROMOTED_SLOTS = [
    {
      id: 'promo-slot-1',
      sponsor_name: 'TBA Studios',
      film_id: 'film-promo-1',
    },
    {
      id: 'promo-slot-2',
      sponsor_name: 'Black Sheep',
      film_id: 'film-promo-2',
    },
  ];

  it('strictly excludes promoted items from position 1 (index 0)', () => {
    const organic10 = createMockOrganicItems(10);
    const stream = injectPromotedSlots(organic10, MOCK_PROMOTED_SLOTS);

    expect(stream[0].is_promoted).toBe(false);
    expect(stream[0].id).toBe('organic-1');
  });

  it('injects at most 1 promoted item per 10 organic items', () => {
    // 25 organic items should get 2 promoted items (at 10 and 20)
    const organic25 = createMockOrganicItems(25);
    const stream = injectPromotedSlots(organic25, MOCK_PROMOTED_SLOTS);

    const promotedItems = stream.filter((item) => item.is_promoted);
    expect(promotedItems.length).toBe(2);

    // Total length is 25 organic + 2 promoted = 27
    expect(stream.length).toBe(27);

    // Promoted item 1 appears after 10 organic items (at index 10)
    expect(stream[10].is_promoted).toBe(true);
    expect(stream[10].id).toBe('promo-slot-1');

    // Promoted item 2 appears after 20 organic items (at index 21)
    expect(stream[21].is_promoted).toBe(true);
    expect(stream[21].id).toBe('promo-slot-2');
  });

  it('does not inject promoted slots if organic count is less than 10', () => {
    const organic5 = createMockOrganicItems(5);
    const stream = injectPromotedSlots(organic5, MOCK_PROMOTED_SLOTS);

    const promotedItems = stream.filter((item) => item.is_promoted);
    expect(promotedItems.length).toBe(0);
    expect(stream.length).toBe(5);
  });

  it('handles empty inputs without errors', () => {
    expect(injectPromotedSlots([], MOCK_PROMOTED_SLOTS)).toEqual([]);
    const organic3 = createMockOrganicItems(3);
    expect(injectPromotedSlots(organic3, [])).toEqual(organic3);
  });
});

