import { defineConfig, globalIgnores } from 'eslint/config'
import pluginJs from '@eslint/js'
import neostandard from 'neostandard'
import pluginReact from 'eslint-plugin-react'
import typescriptEslint from 'typescript-eslint'
import pluginPromise from 'eslint-plugin-promise'
import pluginFunctional from 'eslint-plugin-functional'
import pluginPrettier from 'eslint-plugin-prettier/recommended'
import pluginTailwind from 'eslint-plugin-tailwindcss'
import importPlugin from 'eslint-plugin-import'
import reactHooks from 'eslint-plugin-react-hooks'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const eslintConfig = defineConfig([
  pluginJs.configs.recommended,
  ...neostandard(),
  importPlugin.flatConfigs.recommended,
  reactHooks.configs.flat['recommended-latest'],
  typescriptEslint.configs.eslintRecommended,
  typescriptEslint.configs.recommendedTypeChecked,
  pluginPromise.configs['flat/recommended'],
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat['jsx-runtime'], // Enable JSX runtime for React 17+

  {
    files: ['./src/**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    languageOptions: {
      parserOptions: {
        /** Indicates to ask TypeScript's type checking service for each source file's type information
         *
         * @link https://typescript-eslint.io/getting-started/typed-linting/
         */
        projectService: true,
        /** Tells our parser the absolute path of your project's root directory (see Parser > tsconfigRootDir).
         *
         * @link https://typescript-eslint.io/getting-started/typed-linting/
         */
        tsconfigRootDir: import.meta.dirname,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      functional: pluginFunctional
    },
    settings: {
      'import/external-module-folders': ['.yarn'],
      'import/resolver': {
        typescript: true
      },
      react: { version: '19' }
    },
    rules: {
      /**
       * Disabled or Special Cases
       */
      /** disable due to conflict between prettier-standard and eslint-config-standard
       * - applies to all 3 rules `indent`, `react/jsx-curly-newline`, `react/jsx-indent`
       */
      indent: 'off',
      'react/jsx-curly-newline': 'off',
      'react/jsx-indent': 'off',

      /** Custom Function Spacing Rule
       * - override standard
       *    - allows `function foo() {}` instead of `function foo () {}`
       */
      '@stylistic/space-before-function-paren': [
        'error',
        {
          anonymous: 'never',
          named: 'never',
          asyncArrow: 'always'
        }
      ],

      /**
       * General JavaScript Rules
       *
       * @link https://eslint.org/docs/rules/
       */
      'prefer-const': [
        'error',
        {
          destructuring: 'any',
          ignoreReadBeforeAssign: false
        }
      ],
      /** Allows "e" for event, "_" for useless parameter, and "t" for translations */
      'id-length': ['error', { properties: 'never', exceptions: ['e', '_', 't'] }],
      /** Overrides standard
       * - allows using `my 'string'` instead of "my 'string'" or 'my \'string\''
       */
      quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
      'no-else-return': 'error',
      /** Allow `void asyncFn()` as a statement to suppress floating-promise warnings
       * without disabling @typescript-eslint/no-floating-promises entirely.
       */
      'no-void': ['error', { allowAsStatement: true }],
      'no-shadow': 'warn',
      'no-use-before-define': 'off',
      'no-param-reassign': 'warn',
      'no-invalid-this': 'warn',

      /** Disables multiline-ternary rule
       * for both general eslint rule and stylistic rule
       * - It was also causing issues with prettier-standard
       */
      'multiline-ternary': [0],
      '@stylistic/multiline-ternary': [0],

      /**
       * TypeScript Rules
       *
       * @link https://typescript-eslint.io/rules/
       */
      /** Allows unused variables with `_` prefix */
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true
        }
      ],
      '@typescript-eslint/array-type': ['error', { default: 'array' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/explicit-member-accessibility': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-use-before-define': [
        'error',
        {
          functions: false,
          classes: false,
          variables: false,
          typedefs: false
        }
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/member-delimiter-style': 'off',

      /**
       * Complexity Rules
       * Ensure small functions and no nested/callback hell.
       * If you need more, consider extracting some logic.
       * Also you have cool destructuring feature, use it.
       *
       * @link https://eslint.org/docs/rules/
       */
      complexity: ['warn', { max: 7 }],
      'max-params': ['warn', 3],
      'max-statements': ['warn', 30],
      'max-statements-per-line': ['warn', { max: 1 }],
      'max-nested-callbacks': ['warn', { max: 3 }],
      'max-depth': ['warn', { max: 4 }],
      'max-lines': [
        'error',
        {
          max: 300,
          skipBlankLines: true,
          skipComments: true
        }
      ],
      'max-lines-per-function': [
        'warn',
        {
          max: 200,
          skipBlankLines: true,
          skipComments: true
        }
      ],

      /**
       * Functional Programming Rules
       *
       * Migrated from `eslint-plugin-fp` (unmaintained) to `eslint-plugin-functional`.
       *
       * @link https://github.com/eslint-functional/eslint-plugin-functional/tree/main/docs/rules
       */
      // Equivalent of `fp/no-mutating-methods` — forbids Array/Object mutating methods
      // (push, pop, shift, unshift, splice, reverse, sort, copyWithin, fill,
      // Object.assign, Object.defineProperty, Object.setPrototypeOf, etc.).
      'functional/immutable-data': [
        'warn',
        {
          ignoreClasses: true,
          ignoreImmediateMutation: true,
          ignoreAccessorPattern: ['**.mutable*.**', '**.displayName']
        }
      ],

      /**
       * Import Rules
       *
       * @link https://github.com/import-js/eslint-plugin-import/tree/main/docs/rules
       */
      'import/order': [
        'error',
        {
          groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index']],
          'newlines-between': 'always'
        }
      ],

      /**
       * React Rules
       *
       * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules
       */
      'react/jsx-fragments': ['warn', 'syntax'],
      'react/jsx-closing-bracket-location': ['error', 'line-aligned'],
      'react/no-multi-comp': ['error', { ignoreStateless: true }],
      'react/sort-comp': [
        'error',
        {
          order: [
            'static-methods',
            'instance-variables',
            'lifecycle',
            'getters',
            'setters',
            '/^on.+$/',
            '/^handle.+$/',
            '/^(get|set)(?!(InitialState$|DefaultProps$|ChildContext$)).+$/',
            'instance-methods',
            'everything-else',
            'rendering'
          ],
          groups: {
            lifecycle: [
              'displayName',
              'propTypes',
              'contextTypes',
              'childContextTypes',
              'mixins',
              'statics',
              'defaultProps',
              'constructor',
              'getDefaultProps',
              'getInitialState',
              'state',
              'getChildContext',
              'componentWillMount',
              'componentDidMount',
              'componentWillReceiveProps',
              'shouldComponentUpdate',
              'componentWillUpdate',
              'componentDidUpdate',
              'componentWillUnmount'
            ],
            rendering: ['/^render.+$/', 'render']
          }
        }
      ],
      'react/jsx-props-no-spreading': [
        'off',
        {
          explicitSpread: 'ignore',
          html: 'ignore'
        }
      ],
      'react/display-name': ['error', { ignoreTranspilerName: true }],

      /**
       * React Hooks Rules
       *
       * Replaces `eslint-plugin-react-hooks`- it only provides these two rules
       * @link https://react.dev/reference/rules/rules-of-hooks
       */
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn'
    }
  },
  /** Disabled Type-Aware Linting for JavaScript Files
   *
   * @link https://typescript-eslint.io/getting-started/typed-linting/#how-can-i-disable-type-aware-linting-for-a-subset-of-files
   */
  {
    files: ['**/*.js'],
    extends: [typescriptEslint.configs.disableTypeChecked]
  },
  pluginTailwind.configs.recommended,
  {
    settings: {
      tailwindcss: {
        cssConfigPath: dirname(fileURLToPath(import.meta.url)) + '/src/globals.css',
        // Tailwind v4 has no tailwind.config.js — point the plugin at the CSS entry file.
        config: 'src/globals.css',
        cssFiles: ['src/globals.css'],
        // Check classnames inside these utility functions
        callees: ['cn', 'clsx', 'cva', 'cx']
      }
    },
    rules: {
      // prettier-plugin-tailwindcss is the single source of truth for class
      // ordering — keeping this rule active would duplicate enforcement.
      'tailwindcss/classnames-order': 'off'
    }
  },
  /**
   * Shadcn/ui Component Overrides
   *
   * Components in `src/components/ui/` are vendored via the shadcn CLI.
   * They are not hand-written to our code standards and are updated via
   * `yarn dlx shadcn@latest add <component>` — enforcing house style on
   * them is high friction with no benefit.
   *
   * Rules that conflict with shadcn-generated code are disabled here.
   */
  {
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'react/jsx-no-literals': 'off',
      'react/no-multi-comp': 'off',
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      complexity: 'off',
      'max-params': 'off',
      'functional/immutable-data': 'off',
      'react/display-name': 'off',
      // shadcn imports from 'radix-ui' which the TS resolver cannot trace in PnP
      'import/no-unresolved': 'off',
      // vendored code uses patterns that trip unsafe-* rules
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      // tailwindcss rules — shadcn-generated code uses patterns that trip these
      'tailwindcss/no-custom-classname': 'off',
      'tailwindcss/no-unnecessary-arbitrary-value': 'off'
    }
  },
  /**
   * Prettier Integration for ESLint
   *
   * Disables multiple rules to prevent conflicts between Prettier and other configurations.
   * This plugin ships with a `eslint-plugin-prettier/recommended` configuration that sets up
   * both `eslint-plugin-prettier` and `eslint-config-prettier` in one go.
   *
   * For flat configuration:
   * - Import `eslint-plugin-prettier/recommended` and add it as the last item in the configuration array
   *   in your `eslint.config.js` file to ensure `eslint-config-prettier` can override other configs.
   *
   * @link https://github.com/prettier/eslint-plugin-prettier?tab=readme-ov-file#configuration-new-eslintconfigjs
   */
  pluginPrettier,
  // Override default ignores.
  globalIgnores([
    'out/**',
    'build/**',
    '.pnp.cjs',
    'build/**',
    '.yarn/**',
    'prettierrc.mjs',
    'eslint.config.mjs',
    '.pnp.loader.mjs',
    '.prettierrc.mjs'
  ])
])

export default eslintConfig
