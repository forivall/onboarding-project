/** @type {Partial<import('eslint').Linter.RulesRecord>} */
const rules = {
  curly: ['error', 'multi-line'],
  eqeqeq: ['error', 'smart'],
  'capitalized-comments': ['off'],
  'no-eq-null': ['off'],
};
/** @type {{ rules: import('eslint').Linter.RulesRecord, extends: string[] }} */
const tsOverrideConfig = {
  extends: ['xo', 'xo-typescript', 'prettier', 'plugin:prettier/recommended'],
  rules: {
    ...rules,
    '@typescript-eslint/consistent-indexed-object-style': [
      'error',
      'index-signature',
    ],
    '@typescript-eslint/padding-line-between-statements': ['off'],
    '@typescript-eslint/ban-types': ['error', {}],
  },
};

/** @type {import('eslint').Linter.Config} */
const config = {
  extends: ['xo', 'prettier', 'plugin:prettier/recommended'],
  rules,
  overrides: [
    {
      files: ['photo-backend/src/**/*.ts'],
      parserOptions: {
        project: 'photo-backend/src/tsconfig.json',
      },
      ...tsOverrideConfig,
    },
    {
      files: ['photo-uploader/**/*.ts'],
      parserOptions: {
        project: 'photo-uploader/tsconfig.json',
      },
      ...tsOverrideConfig,
      rules: {
        ...tsOverrideConfig.rules,
        'new-cap': ['off'],
      },
    },
    {
      files: ['*.conf{,ig}.js'],
      rules: {
        'unicorn/prefer-module': 'off',
      },
    },
  ],
};
module.exports = config;
