#!/usr/bin/env node

import yargs from 'yargs'
import createMarkdownToc from '../lib/index.js'

yargs(process.argv.slice(2))
  .command(['$0 [file]'], 'Automatically insert or update a clickable table of contents (TOC) into your Markdown documents based on its headings (levels 2-6).', (yargs) => {
    yargs.positional('file', {
      describe: 'Markdown file for inserting or updating table of contents in',
      type: 'string',
      default: 'README.md'
    }).option('i', {
      alias: 'in-place',
      default: false,
      describe: 'Edit files in place',
      type: 'boolean'
    }).option('s', {
      alias: 'suffix',
      describe: 'The extension of a backup copy. If no extension is supplied, the original file is overwritten without making a backup. This option implies -i.',
      implies: 'i',
      type: 'string'
    });
  },
    async function (argv) {
      await createMarkdownToc(argv.file, argv.inPlace, argv.suffix);
    })
  .help()
  .argv