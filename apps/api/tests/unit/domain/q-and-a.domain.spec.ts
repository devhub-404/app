import { describe, expect, it } from 'vitest';
import { Answer, Question } from '@/modules/q-and-a/domain';

describe('Q&A domain', () => {
  const date = new Date('2026-01-01T00:00:00.000Z');
  const question = () =>
    Question.create({ id: 'q1', authorAccountId: 'author-1', title: 'How?', content: 'How does this work?' }, date);
  const answer = (id = 'a1', questionId = 'q1') =>
    Answer.create({ id, questionId, authorAccountId: 'author-2', content: 'Like this.' }, date);

  it('QA-RN-001 — creates immutable-authored Question and Answer with required authors/content', () => {
    expect(question().value).toMatchObject({ status: 'open', acceptedAnswerId: null });
    expect(answer().value).toMatchObject({ questionId: 'q1', acceptedAt: null });
    expect(() => Question.create({ id: 'q', authorAccountId: '', title: 'How?', content: 'x' }, date)).toThrow(
      'QUESTION_AUTHOR_REQUIRED',
    );
    expect(() => Answer.create({ id: 'a', questionId: 'q1', authorAccountId: 'a', content: ' ' }, date)).toThrow(
      'ANSWER_INVALID_CONTENT',
    );
  });

  it('QA-RN-002/003/004 — blocks answers when closed and supports accepted-answer replacement', () => {
    const q = question();
    const accepted = answer();
    q.acceptAnswer(accepted, date);
    q.close();
    expect(q.value.acceptedAnswerId).toBe('a1');
    expect(() => q.addAnswer(answer('a2'))).toThrow('QUESTION_CLOSED');
    q.reopen();
    expect(q.value.acceptedAnswerId).toBe('a1');
    const replacement = answer('a3');
    q.replaceAcceptedAnswer(accepted, replacement, date);
    expect(q.value.acceptedAnswerId).toBe('a3');
    expect(accepted.value.acceptedAt).toBeNull();
    expect(replacement.value.acceptedAt).toBe(date.toISOString());
  });

  it('QA-RN-003 — keeps Answers inside their Question thread', () => {
    const q = question();
    expect(() => q.addAnswer(answer('a1', 'q2'))).toThrow('ANSWER_WRONG_QUESTION');
    expect(() => q.acceptAnswer(answer('a2', 'q2'), date)).toThrow('ANSWER_WRONG_QUESTION');
  });

  it('QA-RN-005/006 — hidden or deleted accepted Answers lose acceptance while Question lifecycle remains independent', () => {
    const q = question();
    const a = answer();
    q.acceptAnswer(a, date);
    q.hideAnswer(a, date);
    expect(q.value.acceptedAnswerId).toBeNull();
    expect(a.value.acceptedAt).toBeNull();
    a.unhide();
    q.acceptAnswer(a, date);
    q.deleteAnswer(a, date);
    expect(q.value.acceptedAnswerId).toBeNull();
    expect(q.value.status).toBe('open');
  });

  it('QA-RN-005 — hiding is orthogonal to Question status and prevents public interactions', () => {
    const q = question();
    q.hide(date);
    expect(q.value.status).toBe('open');
    expect(() => q.addAnswer(answer())).toThrow('QUESTION_HIDDEN');
    q.unhide();
    q.delete(date);
    expect(q.value.acceptedAnswerId).toBeNull();
    expect(() => q.reopen()).toThrow('QUESTION_DELETED');
  });

  it('QA-RN-006 — Answer cannot be restored after deletion', () => {
    const a = answer();
    a.delete(date);
    expect(() => a.hide()).toThrow('ANSWER_DELETED');
    expect(() => a.unhide()).toThrow('ANSWER_DELETED');
    expect(() => a.delete()).toThrow('ANSWER_DELETED');
  });
});
