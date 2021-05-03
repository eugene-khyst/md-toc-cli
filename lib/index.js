import { constants } from 'fs';
import * as fs from 'fs/promises';
import { EOL } from 'os';
import { createHash } from 'crypto';

function insert(str, start, delCount, newSubStr) {
  return str.slice(0, start) + newSubStr + str.slice(start + delCount);
};

export default async function (filename, inPlace, suffix) {
  try {
    await fs.access(filename, constants.W_OK);
  } catch {
    throw `No such file or no access: ${filename}`;
  }
  if (!(await fs.stat(filename)).isFile()) {
    throw `Expected file but found directory: ${filename}`;
  }

  let data = await fs.readFile(filename, 'utf8');
  const matches = Array.from(data.matchAll(/(#{2,6})(\s+)(<a\s+.*><\/a>)?(.+)(\r?\n)?/g)).reverse();

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
    data = insert(data, match.index + level.length + spaces.length, anchor ? anchor.length : 0, `<a id="${hash}"></a>`);
    toc.unshift(`${' '.repeat(4 * (level.length - 2))}* [${title}](#${hash})`); // tab as 4 spaces
  }

  const lines = data.split(/\r?\n/);
  let matched = false;
  let tocStart = -1;
  let tocEnd = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.match(/^\s*\*\s+\[.+\]\(#\w+\)$/)) {
      if (!matched) {
        tocStart = i;
      }
      matched = true;
    } else {
      if (matched) {
        if (line.match(/^\s*$/)) {
          tocEnd = i + 1;
        } else {
          tocEnd = i;
        }
        break;
      }
    }
    i++;
  }

  lines.splice(tocStart, tocEnd - tocStart);

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

  data = insert(data, tocStartPos, 0, tocStr);

  if (inPlace) {
    if (suffix) {
      await fs.copyFile(filename, filename + '.' + suffix);
    }
    await fs.writeFile(filename, data, 'utf8');
  } else {
    console.log(data);
  }
}