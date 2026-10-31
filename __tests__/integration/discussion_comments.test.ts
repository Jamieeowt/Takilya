import {
  MAX_COMMENT_LENGTH,
  isCommentLengthValid,
  containsBannedWords,
  validateCommentSubmission,
  sanitizeCommentText,
} from '../../lib/moderation';

describe('Integration Test: Discussion Comment Posting Flow (Prompt 5.1 & AGENTS.md)', () => {
  const THREAD_ID = 'thread-himala-symbolism-uuid';
  const PARENT_COMMENT_ID = 'comment-parent-uuid';

  it('enforces strict 500-character limit on comment submission', () => {
    expect(MAX_COMMENT_LENGTH).toBe(500);

    const validText = 'A'.repeat(500);
    expect(isCommentLengthValid(validText)).toBe(true);

    const invalidTooLongText = 'A'.repeat(501);
    expect(isCommentLengthValid(invalidTooLongText)).toBe(false);

    const result = validateCommentSubmission({
      body: invalidTooLongText,
      threadId: THREAD_ID,
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('exceeds maximum length of 500');
  });

  it('detects and rejects banned words and piracy links', () => {
    const piracyComment = 'Watch the camrip leak on torrent now!';
    expect(containsBannedWords(piracyComment)).toBe(true);

    const validation = validateCommentSubmission({
      body: piracyComment,
      threadId: THREAD_ID,
    });
    expect(validation.valid).toBe(false);
    expect(validation.error).toContain('prohibited terms');
  });

  it('sanitizes banned words appropriately', () => {
    const spamComment = 'This is a spam message';
    expect(sanitizeCommentText(spamComment)).toBe('This is a **** message');
  });

  it('validates parent/reply chaining for nested threaded comments', () => {
    // Top-level comment
    const topLevel = validateCommentSubmission({
      body: 'What did everyone think of the ending monologue?',
      threadId: THREAD_ID,
      parentCommentId: null,
    });
    expect(topLevel.valid).toBe(true);

    // Threaded nested reply
    const reply = validateCommentSubmission({
      body: 'I agree, Nora Aunor delivered the lines with chilling conviction.',
      threadId: THREAD_ID,
      parentCommentId: PARENT_COMMENT_ID,
    });
    expect(reply.valid).toBe(true);
    expect(reply.sanitizedText).toContain('Nora Aunor');
  });

  it('rejects blank or whitespace-only comments', () => {
    const blank = validateCommentSubmission({
      body: '    ',
      threadId: THREAD_ID,
    });
    expect(blank.valid).toBe(false);
    expect(blank.error).toContain('cannot be empty');
  });
});

