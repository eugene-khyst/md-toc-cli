const { describe, it, before, after } = require('mocha');
const expect = require('chai').expect;
const fs = require('fs/promises');
const path = require('path');
const os = require('os');
const markdownToc = require('../src/lib');

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

  it('should insert or update TOC in file', async () => {
    const content = `# Heading 1

## Heading 2a

### Heading 3aa

#### Heading 4a

##### Heading 5a

###### Heading 6a

### Heading 3ab

## Heading 2b

### Heading 3b

#### Heading 4b

## Heading 2c

### Heading 3c
`;

    const contentWithToc = `# Heading 1

- [Heading 2a](#62bae9069304b425d6174518f6e08820)
  - [Heading 3aa](#9faaae3ddf5880387d6abbd7854997a8)
    - [Heading 4a](#3cbd898c604d920d4ce96821528c8b1a)
      - [Heading 5a](#cf5e1d8b5dd85fa053ec416763f6bebd)
        - [Heading 6a](#eab2de38622860a06fe06ad545aaf6de)
  - [Heading 3ab](#ce97d28cdc95ab9f084992b83358ae06)
- [Heading 2b](#4fd8e2d675f1736846acf45b5bcd5db1)
  - [Heading 3b](#c8ec0f1c9a499a10aa077fef74fe2d55)
    - [Heading 4b](#937661bf28aaa176c9d101c6453ad1c5)
- [Heading 2c](#2f26fb85484044281e7a9d848c8b4eac)
  - [Heading 3c](#190610646bd9620804f17518443a4d54)

<!-- Table of contents is made with https://github.com/evgeniy-khist/markdown-toc -->

## <a id="62bae9069304b425d6174518f6e08820"></a>Heading 2a

### <a id="9faaae3ddf5880387d6abbd7854997a8"></a>Heading 3aa

#### <a id="3cbd898c604d920d4ce96821528c8b1a"></a>Heading 4a

##### <a id="cf5e1d8b5dd85fa053ec416763f6bebd"></a>Heading 5a

###### <a id="eab2de38622860a06fe06ad545aaf6de"></a>Heading 6a

### <a id="ce97d28cdc95ab9f084992b83358ae06"></a>Heading 3ab

## <a id="4fd8e2d675f1736846acf45b5bcd5db1"></a>Heading 2b

### <a id="c8ec0f1c9a499a10aa077fef74fe2d55"></a>Heading 3b

#### <a id="937661bf28aaa176c9d101c6453ad1c5"></a>Heading 4b

## <a id="2f26fb85484044281e7a9d848c8b4eac"></a>Heading 2c

### <a id="190610646bd9620804f17518443a4d54"></a>Heading 3c
`;
    const tempFile = path.join(tempDir, 'test.md');
    await fs.writeFile(tempFile, content, 'utf8');
    await markdownToc.insertOrUpdateTocInFile(tempFile, {
      inPlace: true,
      suffix: 'orig',
    });
    const oldContent = await fs.readFile(tempFile + '.orig', 'utf8');
    const newContent = await fs.readFile(tempFile, 'utf8');
    console.log(newContent);
    expect(oldContent).equals(content);
    expect(newContent).equals(contentWithToc);
  });
});
