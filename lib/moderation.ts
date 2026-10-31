/**
 * Discussion Comment Moderation & Validation Rules (Prompt 5.1)
 */

export const MAX_COMMENT_LENGTH = 500;

export const BANNED_WORDS = [
  'spam',
  'scam',
  'piracy',
  'torrent',
  'camrip',
  'leak',
  'offensive_slur',
];

export interface ValidateCommentResult {
  valid: boolean;
  error?: string;
  sanitizedText?: string;
}

/**
 * Checks if a comment text exceeds the 500-character limit
 */
export function isCommentLengthValid(text: string): boolean {
  if (!text) return false;
  const trimmed = text.trim();
  return trimmed.length > 0 && trimmed.length <= MAX_COMMENT_LENGTH;
}

/**
 * Checks if text contains banned words/slurs
 */
export function containsBannedWords(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return BANNED_WORDS.some((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(lower);
  });
}

/**
 * Sanitizes comment by censoring banned words with asterisks
 */
export function sanitizeCommentText(text: string): string {
  if (!text) return '';
  let sanitized = text;
  BANNED_WORDS.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    sanitized = sanitized.replace(regex, '*'.repeat(word.length));
  });
  return sanitized;
}

/**
 * Validates a comment submission payload
 */
export function validateCommentSubmission(payload: {
  body: string;
  threadId: string;
  parentCommentId?: string | null;
}): ValidateCommentResult {
  const trimmed = payload.body ? payload.body.trim() : '';

  if (trimmed.length === 0) {
    return { valid: false, error: 'Comment cannot be empty.' };
  }

  if (trimmed.length > MAX_COMMENT_LENGTH) {
    return {
      valid: false,
      error: `Comment exceeds maximum length of ${MAX_COMMENT_LENGTH} characters (currently ${trimmed.length}).`,
    };
  }

  if (containsBannedWords(trimmed)) {
    return {
      valid: false,
      error: 'Comment contains prohibited terms or piracy links.',
    };
  }

  if (!payload.threadId) {
    return { valid: false, error: 'Thread ID is required.' };
  }

  return {
    valid: true,
    sanitizedText: sanitizeCommentText(trimmed),
  };
}

