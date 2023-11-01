/**
 * The configuration for the TOC.
 * @typedef {Object} Options
 * @property {number} tabWidth The number of spaces per indentation-level.
 * @property {number} listItemSymbol Symbol used in front of line items to create an unordered list.
 * @property {boolean} noAttribution Add or not an attribution "Table of contents is made with ...".
 * @property {boolean} inPlace Edit files in place or print the result to console.
 * @property {string} suffix The extension of a backup copy. If no extension is supplied, the original file is overwritten without making a backup.
 */
/**
 * @constant
 * @type {Options}
 * @default
 */
export const defaultOptions: Options;
export function insertOrUpdateToc(content: string, options?: Options): string;
export function insertOrUpdateTocInFile(
  filename: string,
  options?: Options
): Promise<void>;
/**
 * The configuration for the TOC.
 */
export type Options = {
  /**
   * The number of spaces per indentation-level.
   */
  tabWidth: number;
  /**
   * Symbol used in front of line items to create an unordered list.
   */
  listItemSymbol: number;
  /**
   * Add or not an attribution "Table of contents is made with ...".
   */
  noAttribution: boolean;
  /**
   * Edit files in place or print the result to console.
   */
  inPlace: boolean;
  /**
   * The extension of a backup copy. If no extension is supplied, the original file is overwritten without making a backup.
   */
  suffix: string;
};
//# sourceMappingURL=index.d.ts.map
