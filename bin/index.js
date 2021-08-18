#!/usr/bin/env node

import yargs from 'yargs';
import createMarkdownToc from '../lib/index.js';

yargs(process.argv.slice(2))
  .command(
    ['$0 [file]'],
    'Automatically insert or update a clickable table of contents (TOC) into your Markdown documents based on its headings (levels 2-6).',
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
          default: false,
          describe: 'Edit files in place',
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
          default: 2,
          describe: 'The number of spaces per indentation-level',
          type: 'number',
        })
        .option('l', {
          alias: 'list-item-sign',
          choices: ['-', '*', '+'],
          default: '-',
          describe: 'Sign used front of line items to create an unordered list',
          type: 'string',
        })
        .option('n', {
          alias: 'no-attribution',
          default: false,
          describe:
            'Do not add an attribution "Table of contents is made with ..."',
          type: 'boolean',
        });
    },
    async function (argv) {
      await createMarkdownToc(argv);
    }
  )
  .help().argv;
