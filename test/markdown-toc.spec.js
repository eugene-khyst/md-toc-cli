import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { insertOrUpdateTocInFile } from '../src/lib/index.js';

describe('Markdown TOC', () => {
  let tempDir;

  before(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'md-toc-cli-'));
  });

  after(async () => {
    if (tempDir) {
      fs.rm(tempDir, { recursive: true, force: true });
    }
  });

  [
    { original: './test/sample.md', expected: './test/sample-with-toc.md' },
    {
      original: './test/sample-with-outdated-toc.md',
      expected: './test/sample-with-toc.md',
    },
    {
      original: './test/sample-no-h1.md',
      expected: './test/sample-no-h1-with-toc.md',
    },
  ].forEach(({ original, expected }) => {
    it(`should insert or update TOC in the file ${original}`, async () => {
      const content = await fs.readFile(original, 'utf8');
      const contentWithToc = await fs.readFile(expected, 'utf8');

      const tempFile = path.join(tempDir, 'test.md');
      await fs.writeFile(tempFile, content, 'utf8');

      await insertOrUpdateTocInFile(tempFile, {
        inPlace: true,
        suffix: 'orig',
      });

      const oldContent = await fs.readFile(`${tempFile}.orig`, 'utf8');
      const newContent = await fs.readFile(tempFile, 'utf8');

      expect(oldContent).equals(content);
      expect(newContent).equals(contentWithToc);
    });
  });

  ['./test/sample-with-toc.md', './test/sample-no-headings.md'].forEach(
    (file) => {
      it(`should not change the file ${file}`, async () => {
        const contentWithToc = await fs.readFile(file, 'utf8');

        const tempFile = path.join(tempDir, 'test.md');
        await fs.writeFile(tempFile, contentWithToc, 'utf8');

        await insertOrUpdateTocInFile(tempFile, {
          inPlace: true,
        });

        const newContent = await fs.readFile(tempFile, 'utf8');

        expect(newContent).equals(contentWithToc);
      });
    }
  );
});
