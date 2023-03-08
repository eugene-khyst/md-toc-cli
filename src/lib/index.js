import * as fs from 'fs/promises';
import { EOL } from 'os';

/**
 * Insert the substring B into string A at a specific position, optionally deleting some characters from string A.
 * @param {string} str - The original string to insert into.
 * @param {number} start - The position to insert at.
 * @param {number} delCount - The number of characters in the original string to delete.
 * @param {string} substr - the substring to insert.
 * @returns
 */
const insertSubstring = (str, start, delCount, substr) =>
  str.slice(0, start) + substr + str.slice(start + delCount);

const attribution =
  '<!-- Table of contents is made with https://github.com/evgeniy-khist/markdown-toc -->';

/**
 * The configuration for the TOC.
 * @typedef {Object} Options
 * @property {number} tabWidth - The number of spaces per indentation-level.
 * @property {number} listItemSymbol - Symbol used in front of line items to create an unordered list.
 * @property {boolean} noAttribution - Add or not an attribution "Table of contents is made with ...".
 * @property {boolean} inPlace - Edit files in place or print the result to console.
 * @property {string} suffix - The extension of a backup copy. If no extension is supplied, the original file is overwritten without making a backup.
 */
export const defaultOptions = {
  tabWidth: 2,
  listItemSymbol: '-',
  noAttribution: false,
  inPlace: false,
  suffix: null,
};

/**
 * Insert or update a table of contents for a Markdown content.
 * @param {string} content - A Markdown content
 * @param {Options} options - An {@link Options} object.
 * @returns {string} - The Markdown content with the inserted or updated TOC.
 */
export const insertOrUpdateToc = (content, options = {}) => {
  const { tabWidth, listItemSymbol, noAttribution } = {
    ...defaultOptions,
    ...options,
  };

  const toc = [];
  const result = [];
  const lines = content.split(/\r?\n/);

  let oldTocStart = -1;
  let oldTocEnd = -1;
  let attributionLineIndex = -1;

  let newTocStart = 0;

  const headingCounters = new Array(6).fill(0);

  const getHash = (headingLevel) => {
    let hash = `${headingCounters[0]}`;
    for (let i = 1; i <= headingLevel; i += 1) {
      hash += `-${headingCounters[headingLevel]}`;
    }
    return hash;
  };

  for (let i = 0; i < lines.length; i += 1) {
    let line = lines[i];

    if (oldTocEnd < 0) {
      if (line.match(/^\s*[-*+]\s+\[.+\]\(#[\w-]+\)$/)) {
        oldTocStart = oldTocStart < 0 ? i : oldTocStart;
      } else if (oldTocStart >= 0) {
        oldTocEnd = i;
      }
    }

    if (line === attribution) {
      attributionLineIndex = i;
    }

    const isOldTocLine =
      oldTocStart >= 0 &&
      i >= oldTocStart &&
      (oldTocEnd < 0 || (oldTocEnd > oldTocStart && i <= oldTocEnd));

    const isAttributionLine =
      attributionLineIndex >= 0 &&
      i >= attributionLineIndex &&
      i <= attributionLineIndex + 1;

    const skipLine = isOldTocLine || isAttributionLine;

    if (!skipLine) {
      const headingMatch = line.match(/^(#{1,6})(\s+)(<a\s+.*><\/a>)?(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1];
        const spaces = headingMatch[2];
        const anchor = headingMatch[3];
        const title = headingMatch[4];

        let hash = '0';

        if (level.length === 1) {
          newTocStart = i + 1;
        } else {
          const headingLevel = level.length - 2;
          headingCounters[headingLevel] += 1;
          headingCounters.fill(0, headingLevel + 1);

          hash = getHash(headingLevel);

          const paddingSize = tabWidth * headingLevel;
          const padding = ' '.repeat(paddingSize);
          const tocItem = `${padding}${listItemSymbol} [${title}](#${hash})`;
          toc.push(tocItem);
        }

        line = insertSubstring(
          line,
          level.length + spaces.length,
          anchor ? anchor.length : 0,
          `<a id="${hash}"></a>`
        );
      }
      result.push(line);
    }
  }

  if (toc.length) {
    if (newTocStart > 0) {
      toc.unshift('');
    }
    if (!noAttribution) {
      toc.push('', attribution);
      if (newTocStart === 0) {
        toc.push('');
      }
    }
    result.splice(newTocStart, 0, ...toc);
  }

  return result.join(EOL);
};

/**
 * Insert or update a table of content in a Markdown file.
 * @param {string} filename - The path to a Markdown file.
 * @param {Options} options - An {@link Options} object.
 */
export const insertOrUpdateTocInFile = async (filename, options = {}) => {
  const { inPlace, suffix } = { ...defaultOptions, ...options };

  const originalContent = await fs.readFile(filename, 'utf8');
  const newContent = insertOrUpdateToc(originalContent, options);

  if (inPlace) {
    if (suffix) {
      await fs.copyFile(filename, `${filename}.${suffix}`);
    }
    await fs.writeFile(filename, newContent, 'utf8');
  } else {
    console.log(newContent);
  }
};
