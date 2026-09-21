# Q&A

Status: current

## Purpose

Organize contextual questions and answers to resolve developers' knowledge
gaps.

## Business rules

- A question starts `OPEN` and may become `CLOSED`; an answer has no separate
  editorial lifecycle.
- A closed question accepts no new answers. Closing or reopening does not
  remove the accepted answer.
- Each answer belongs to one question, and at most one answer is accepted per
  question.
- `SOLVED` is derived from the existence of an accepted answer and may coexist
  with an open or closed question.
- Creation requires an author. After creation, questions and answers have no
  content editing in the current domain.
- Hiding and deletion are independent facts; hiding or deleting an accepted
  answer removes its acceptance consistently.
- Answers inherit the question's taxonomy context and have no own tags.
- Account purge may anonymize authorship without destroying thread structure.

## Capabilities

- Create, list, and view public questions.
- Create an eligible answer and accept or remove an accepted answer.
- Close and reopen a question.
- Delete a question or answer.
- List own contributions and view the moderation surface.
