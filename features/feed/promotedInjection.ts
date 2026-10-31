/**
 * Promoted Slot Injection Pipeline Rules (Prompt 5.1 & AGENTS.md)
 * - Maximum ratio: At most 1 promoted item per 10 organic items.
 * - Strict exclusion from position 1: The initial video item (index 0) must ALWAYS be organic.
 * - Promoted items must NEVER influence or bias rating, score, or review rankings.
 */

export interface PromotedInjectionItem {
  id: string;
  is_promoted: boolean;
  [key: string]: any;
}

/**
 * Injects promoted items into an organic feed stream adhering strictly to AGENTS.md rules.
 */
export function injectPromotedSlots<T extends PromotedInjectionItem>(
  organicItems: T[],
  promotedSlots: any[]
): T[] {
  if (!organicItems || organicItems.length === 0) return [];
  if (!promotedSlots || promotedSlots.length === 0) return [...organicItems];

  const result: T[] = [];
  let organicCount = 0;
  let slotIndex = 0;

  for (let i = 0; i < organicItems.length; i++) {
    const item = organicItems[i];
    result.push({ ...item, is_promoted: false });
    organicCount++;

    // Strict Rule: After 10 organic items, inject at most 1 promoted item
    // Never at position 1 (i = 0)
    if (organicCount % 10 === 0 && slotIndex < promotedSlots.length) {
      const slot = promotedSlots[slotIndex % promotedSlots.length];
      const promotedItem = {
        ...slot,
        id: slot.id || `promoted-${slotIndex}`,
        is_promoted: true,
      } as T;

      result.push(promotedItem);
      slotIndex++;
    }
  }

  return result;
}

