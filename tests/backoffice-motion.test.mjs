import {it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {rawMotion} from './motion.test.mjs';

// The back office moves on the same motion tokens as src/: no raw durations or easings in its layout CSS.
it('backoffice CSS uses only the motion tokens', () => {
  expect(rawMotion(readFileSync('backoffice/src/layout.css', 'utf8'))).toEqual([]);
});
