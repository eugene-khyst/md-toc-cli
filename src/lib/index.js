const constants = require('fs').constants;
const fs = require('fs/promises');
const EOL = require('os').EOL;
const createHash = require('crypto').createHash;

/**
 * Insert the substring B into string A at a specific position, optionally deleting some characters from string A.
 * @param {string} str - The original string to insert into.
 * @param {number} start - The position to insert at.
 * @param {number} delCount - The number of characters in the original string to delete.
 * @param {string} substr - the substring to insert.
 * @returns
 */
function insert(str, start, delCount, substr) {
  return str.slice(0, start) + substr + str.slice(start + delCount);
}

module.exports = {
  defaults: {
    inPlace: false,
    tabWidth: 2,
    listItemSymbol: '-',
    noAttribution: false,
  },

  attribution:
    '<!-- Table of contents is made with https://github.com/evgeniy-khist/markdown-toc -->',

  /**
   * Insert or update a table of contents for a Markdown content.
   * @param {object} options - Configuration for the TOC.
   * @param {number} options.tabWidth - The number of spaces per indentation-level.
   * @param {number} options.listItemSymbol - Symbol used in front of line items to create an unordered list.
   * @param {boolean} options.noAttribution - Add or not an attribution "Table of contents is made with ...".
   * @returns {string} - The Markdown content with the inserted or updated TOC.
   */
  insertOrUpdateToc: function (content, options) {
    options = { ...this.defaults, ...options };

    const matches = Array.from(
      content.matchAll(/^(#{2,6})(\s+)(<a\s+.*><\/a>)?(.+)(\r?\n)?/gm)
    ).reverse();

    if (matches.length == 0) {
      throw 'No headings level 2-6 found';
    }

    const toc = [];

    for (const match of matches) {
      const level = match[1];
      const spaces = match[2];
      const anchor = match[3];
      const title = match[4];
      const hash = createHash('md5').update(title).digest('hex');
      content = insert(
        content,
        match.index + level.length + spaces.length,
        anchor ? anchor.length : 0,
        `<a id="${hash}"></a>`
      );
      toc.unshift(
        ' '.repeat(options.tabWidth * (level.length - 2)) +
          options.listItemSymbol +
          ` [${title}](#${hash})`
      );
    }

    const lines = content.split(/\r?\n/);

    // Remove TOC from content if exists
    let matched = false;
    let tocStart = -1;
    let tocEnd = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.match(/^\s*[-*+]\s+\[.+\]\(#\w+\)$/)) {
        if (!matched) {
          tocStart = i;
        }
        matched = true;
      } else if (matched) {
        if (line.match(/^\s*$/)) {
          tocEnd = i + 1;
        } else {
          tocEnd = i;
        }
        break;
      }
    }

    if (tocStart >= 0 && tocEnd > tocStart) {
      lines.splice(tocStart, tocEnd - tocStart);
    }

    // Remove attribution from content if exists
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line === this.attribution) {
        lines.splice(i, 2);
        break;
      }
    }

    content = lines.join(EOL);

    const match = /^#\s+.+(\r?\n)/.exec(content);
    let tocStartPos = 0;
    let tocStr = toc.join(EOL) + EOL;
    if (match) {
      tocStartPos = match.index + match[0].length;
      tocStr = EOL + tocStr;
    } else {
      tocStr = tocStr + EOL;
    }

    if (!options.noAttribution) {
      tocStr += EOL + this.attribution + EOL;
    }

    content = insert(content, tocStartPos, 0, tocStr);

    return content;
  },

  /**
   * Insert or update a table of content in a Markdown file.
   * @param {string} file - The path to a Markdown file.
   * @param {number} options.tabWidth - The number of spaces per indentation-level.
   * @param {number} options.listItemSymbol - Symbol used in front of line items to create an unordered list.
   * @param {boolean} options.noAttribution - Add or not an attribution "Table of contents is made with ...".
   * @param {boolean} options.inPlace - Edit files in place or print the result to console.
   * @param {string} options.suffix - The extension of a backup copy. If no extension is supplied, the original file is overwritten without making a backup.
   */
  insertOrUpdateTocInFile: async function (file, options) {
    options = { ...this.defaults, ...options };

    try {
      await fs.access(file, constants.W_OK);
    } catch {
      throw `No such file or no access: ${file}`;
    }
    if (!(await fs.stat(file)).isFile()) {
      throw `Expected file but found directory: ${file}`;
    }

    const originalContent = await fs.readFile(file, 'utf8');

    const newContent = this.insertOrUpdateToc(originalContent, options);

    if (options.inPlace) {
      if (options.suffix) {
        await fs.copyFile(file, file + '.' + options.suffix);
      }
      await fs.writeFile(file, newContent, 'utf8');
    } else {
      console.log(newContent);
    }
  },
};
