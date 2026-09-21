import assert from 'node:assert/strict';
import { test } from 'vitest';
import { createPageMetadata } from '../../../src/shared/ui/metadata/page-metadata.util.ts';

test('page metadata is normalized at the layout boundary', () => {
  assert.deepEqual(
    createPageMetadata({
      author: '  DevHub  ',
      title: '  Article  ',
      description: '  Description  ',
      keywords: '  devhub, article  ',
    }),
    {
      author: 'DevHub',
      title: 'Article',
      description: 'Description',
      keywords: 'devhub, article',
    },
  );
});
