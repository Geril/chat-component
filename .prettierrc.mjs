/** Prettier configuration file
 * @link https://prettier.io/docs/en/options
 */
export default {
  /** Specify the line length that the printer will wrap on. */
  printWidth: 120,
  /** Specify the number of spaces per indentation-level. */
  tabWidth: 2,
  /** Indent lines with tabs instead of spaces. */
  useTabs: false,
  /** Print semicolons at the ends of statements. */
  semi: false,
  /** Use single quotes instead of double quotes. */
  singleQuote: true,
  /** Use single quotes instead of double quotes in JSX. */
  jsxSingleQuote: true,
  /** Print trailing commas wherever possible
   * in multi-line comma-separated syntactic structures.
   * (A single-line array, for example, never gets trailing commas.)
   */
  trailingComma: 'none',
  /** Print spaces between brackets in object literals. */
  bracketSpacing: true,
  /** Put the `>` of a multi-line HTML (HTML, JSX, Vue, Angular) element
   * at the end of the last line instead of being alone on the next line
   * - Does not apply to self closing elements.
   * - Previously known as `jsxBracketSameLine`.
   */
  bracketSameLine: false,
  /** Include parentheses around a sole arrow function parameter. */
  arrowParens: 'avoid',
  /** Tailwind CSS class sorting.
   * `tailwindStylesheet` is required for Tailwind v4 (no tailwind.config.ts).
   * Must be last in the plugins array.
   * @link https://github.com/tailwindlabs/prettier-plugin-tailwindcss
   */
  tailwindStylesheet: './src/globals.css',
  /** Import the plugin module directly — Yarn PnP cannot resolve plugin names
   * passed as strings because Prettier uses its own module resolution that
   * bypasses the PnP loader.
   */
  plugins: [await import('prettier-plugin-tailwindcss')]
}
