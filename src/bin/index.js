#!/usr/bin/env node

import * as fs from 'fs/promises';
import yargs from 'yargs/yargs';
import { defaultOptions, insertOrUpdateTocInFile } from '../lib/index.js';

const getVersion = async () => {
  try {
    const pkg = JSON.parse(
      await fs.readFile(new URL('../../package.json', import.meta.url), 'utf8')
    );
    return pkg.version;
  } catch (e) {
    return false;
  }
};

yargs(process.argv.slice(2))
  .command(
    ['$0 [file]'],
    'Automatically insert or update a clickable table of contents (TOC) into your Markdown documents based on its headings (levels 2-6).',
    /* eslint-disable no-shadow */
    (yargs) => {
      yargs
        .positional('file', {
          describe:
            'Markdown file for inserting or updating table of contents in',
          type: 'string',
          default: 'README.md',
        })
        .option('i', {
          alias: 'in-place',
          default: defaultOptions.inPlace,
          describe: 'Edit file in place',
          type: 'boolean',
        })
        .option('s', {
          alias: 'suffix',
          describe:
            'The extension of a backup copy. If no extension is supplied, the original file is overwritten without making a backup. This option implies -i.',
          implies: 'i',
          type: 'string',
        })
        .option('t', {
          alias: 'tab-width',
          default: defaultOptions.tabWidth,
          describe: 'The number of spaces per indentation-level',
          type: 'number',
        })
        .option('l', {
          alias: 'list-item-symbol',
          choices: ['-', '*', '+'],
          default: defaultOptions.listItemSymbol,
          describe:
            'Symbol used in front of line items to create an unordered list',
          type: 'string',
        })
        .option('n', {
          alias: 'no-attribution',
          default: defaultOptions.noAttribution,
          describe:
            'Do not add an attribution "Table of contents is made with ..."',
          type: 'boolean',
        });
    },
    async (argv) => {
      await insertOrUpdateTocInFile(argv.file, argv);
    }
  )
  .version(await getVersion())
  .help()
  .parse();
