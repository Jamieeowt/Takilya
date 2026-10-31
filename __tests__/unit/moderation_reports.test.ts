import { submitReport } from '../../features/moderation/api';
import { REPORT_REASONS, ReportTargetType } from '../../features/moderation/types';
import { supabase } from '../../lib/supabase';
import {
  isCommentLengthValid,
  containsBannedWords,
  sanitizeCommentText,
  validateCommentSubmission,
  MAX_COMMENT_LENGTH,
} from '../../lib/moderation';

describe('Unit Tests: Content Moderation & Reporting (Prompt 5.2)', () => {
  describe('Report Reasons & Target Types', () => {
    it('defines standard community report reasons', () => {
      expect(REPORT_REASONS.length).toBeGreaterThanOrEqual(5);
      expect(REPORT_REASONS).toContain('Spam or misleading content');
      expect(REPORT_REASONS).toContain('Spoilers without warning tag');
      expect(REPORT_REASONS).toContain('Piracy or unauthorized streaming links');
    });

    it('submits reports with correctly formatted reason and details', async () => {
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'rep-123',
              reporter_id: 'u-1',
              target_type: 'trailer',
              target_id: 'tr-99',
              reason: 'Piracy or unauthorized streaming links: Camrip link in description',
              status: 'pending',
              created_at: new Date().toISOString(),
            },
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      });

      const res = await submitReport({
        reporterId: 'u-1',
        targetType: 'trailer',
        targetId: 'tr-99',
        reason: 'Piracy or unauthorized streaming links',
        details: 'Camrip link in description',
      });

      expect(mockInsert).toHaveBeenCalledWith({
        reporter_id: 'u-1',
        target_type: 'trailer',
        target_id: 'tr-99',
        reason: 'Piracy or unauthorized streaming links: Camrip link in description',
        status: 'pending',
      });

      expect(res.id).toBe('rep-123');
      expect(res.status).toBe('pending');
    });

    it('submits reports across all target types (trailer, review, comment, thread, user)', async () => {
      const targetTypes: ReportTargetType[] = ['trailer', 'review', 'comment', 'thread', 'user'];

      for (const targetType of targetTypes) {
        const mockInsert = jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: `rep-${targetType}`,
                reporter_id: 'u-1',
                target_type: targetType,
                target_id: `id-${targetType}`,
                reason: 'Spam or misleading content',
                status: 'pending',
                created_at: new Date().toISOString(),
              },
              error: null,
            }),
          }),
        });

        (supabase.from as jest.Mock).mockReturnValue({
          insert: mockInsert,
        });

        const res = await submitReport({
          reporterId: 'u-1',
          targetType,
          targetId: `id-${targetType}`,
          reason: 'Spam or misleading content',
        });

        expect(res.target_type).toBe(targetType);
      }
    });
  });

  describe('Comment Length & Profanity Moderation', () => {
    it('enforces 500-character max length limit', () => {
      expect(isCommentLengthValid('')).toBe(false);
      expect(isCommentLengthValid('A'.repeat(500))).toBe(true);
      expect(isCommentLengthValid('A'.repeat(501))).toBe(false);
    });

    it('detects banned words (piracy, camrip, spam, leaks)', () => {
      expect(containsBannedWords('Check out this camrip link')).toBe(true);
      expect(containsBannedWords('Free torrent download here')).toBe(true);
      expect(containsBannedWords('What a breathtaking film by Lino Brocka!')).toBe(false);
    });

    it('sanitizes comments replacing banned words with asterisks', () => {
      const text = 'Avoid this camrip and support cinema';
      const clean = sanitizeCommentText(text);
      expect(clean).toContain('******');
      expect(clean).not.toContain('camrip');
    });

    it('validates comment submission payload correctly', () => {
      const validRes = validateCommentSubmission({
        body: 'Brilliant acting by Nora Aunor in Himala.',
        threadId: 'thread-1',
      });
      expect(validRes.valid).toBe(true);

      const invalidLength = validateCommentSubmission({
        body: 'x'.repeat(MAX_COMMENT_LENGTH + 1),
        threadId: 'thread-1',
      });
      expect(invalidLength.valid).toBe(false);
      expect(invalidLength.error).toContain('exceeds maximum length');

      const invalidBanned = validateCommentSubmission({
        body: 'Download this torrent immediately',
        threadId: 'thread-1',
      });
      expect(invalidBanned.valid).toBe(false);
      expect(invalidBanned.error).toContain('prohibited terms');
    });
  });
});

