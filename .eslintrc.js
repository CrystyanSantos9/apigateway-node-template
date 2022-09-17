module.exports = {
    env: {
        commonjs: true,
        es2021: true,
        es6: true,
        node: true
    },
    extends: [
        'standard',
        'prettier'
    ],
    parserOptions: {
        ecmaFeatures: {
            jsx: true, // Allows for the parsing of JSX
            tsx: true, // Allows for the parsing of TSX ???
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    plugins: [
        'sort-keys-fix',
        'eslint-plugin-unicorn',
    ],
    rules: {
        indent: ['error', 4],
        quotes: ['error', 'single'],
        semi: ['error', 'always'],
        'sort-keys': ['error', 'asc', { caseSensitive: true, natural: false }],
        'sort-keys-fix/sort-keys-fix': 'warn',
        'unicorn/consistent-destructuring': 'off',
        'unicorn/consistent-function-scoping': 'off',
        'unicorn/no-array-callback-reference': 'off',
        'unicorn/no-array-for-each': 'off',
        'unicorn/no-array-reduce': 'off',
        'unicorn/no-fn-reference-in-iterator': 'off',
        'unicorn/no-null': 'off',
        'unicorn/no-useless-undefined': 'off',
        'unicorn/prefer-spread': 'off',
        'unicorn/prevent-abbreviations': [
            'error',
            {
                allowList: { Param: true, Req: true, Res: true }
            }
        ],
    },
};
