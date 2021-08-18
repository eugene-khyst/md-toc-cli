import { constants } from 'fs';
import * as fs from 'fs/promises';
import { EOL } from 'os';
import { createHash } from 'crypto';

function insert(str, start, delCount, newSubStr) {
  return str.slice(0, start) + newSubStr + str.slice(start + delCount);
}

const attribution =
  '<!-- Table of contents is made with https://github.com/evgeniy-khist/markdown-toc -->';

export default async function (options) {
  try {
    await fs.access(options.file, constants.W_OK);
  } catch {
    throw `No such file or no access: ${options.file}`;
  }
  if (!(await fs.stat(options.file)).isFile()) {
    throw `Expected file but found directory: ${options.file}`;
  }

  let data = await fs.readFile(options.file, 'utf8');
  const matches = Array.from(
    data.matchAll(/^(#{2,6})(\s+)(<a\s+.*><\/a>)?(.+)(\r?\n)?/gm)
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
    data = insert(
      data,
      match.index + level.length + spaces.length,
      anchor ? anchor.length : 0,
      `<a id="${hash}"></a>`
    );
    toc.unshift(
      ' '.repeat(options.tabWidth * (level.length - 2)) +
        options.listItemSign +
        ` [${title}](#${hash})`
    );
  }

  const lines = data.split(/\r?\n/);
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

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line === attribution) {
      lines.splice(i, 2);
      break;
    }
  }

  data = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    data += line + EOL;
  }

  const match = /^#\s+.+(\r?\n)/.exec(data);
  let tocStartPos = 0;
  let tocStr = toc.join(EOL) + EOL;
  if (match) {
    tocStartPos = match.index + match[0].length;
    tocStr = EOL + tocStr;
  } else {
    tocStr = tocStr + EOL;
  }

  if (!options.noAttribution) {
    tocStr += EOL + attribution + EOL;
  }

  data = insert(data, tocStartPos, 0, tocStr);

  if (options.inPlace) {
    if (options.suffix) {
      await fs.copyFile(options.file, options.file + '.' + options.suffix);
    }
    await fs.writeFile(options.file, data, 'utf8');
  } else {
    console.log(data);
  }
}
