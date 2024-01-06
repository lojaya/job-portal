module.exports = {
	extends: [
		'airbnb-base',
		'airbnb-typescript/base',
		'plugin:@typescript-eslint/recommended',
		'plugin:import/typescript',
		'prettier',
	],

	parserOptions: {
		tsconfigRootDir: __dirname,
		project: './tsconfig.eslint.json',
	},

	env: { es2021: true, node: true },

	ignorePatterns: ['node_modules', 'dist', '!.*.js', '!.*.cjs', '!.*.mjs'],

	rules: {
		// enforce curly brace usage
		curly: ['error', 'all'],

		// allow class methods which do not use this
		'class-methods-use-this': 'off',

		'no-void': 'off',
		'import/no-cycle': 'off',

		// Allow use of ForOfStatement - no-restricted-syntax does not allow us to turn off a rule. This block overrides the airbnb rule entirely
		// https://github.com/airbnb/javascript/blob/7152396219e290426a03e47837e53af6bcd36bbe/packages/eslint-config-airbnb-base/rules/style.js#L257-L263
		'no-restricted-syntax': [
			'error',
			{
				selector: 'ForInStatement',
				message:
					'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
			},
			{
				selector: 'LabeledStatement',
				message:
					'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
			},
			{
				selector: 'WithStatement',
				message:
					'`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
			},
		],

		// underscore dangle will be handled by @typescript-eslint/naming-convention
		'no-underscore-dangle': 'off',

		// enforce consistent sort order
		'sort-imports': ['error', { ignoreCase: true, ignoreDeclarationSort: true }],

		// enforce convention in import order
		'import/order': [
			'error',
			{
				'newlines-between': 'never',
				groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
				alphabetize: { order: 'asc', caseInsensitive: true },
			},
		],

		// ensure consistent array typings
		'@typescript-eslint/array-type': 'error',

		// ban ts-comment except with description
		'@typescript-eslint/ban-ts-comment': [
			'error',
			{
				'ts-expect-error': 'allow-with-description',
				'ts-ignore': 'allow-with-description',
				'ts-nocheck': true,
				'ts-check': false,
			},
		],

		// prefer type imports and exports
		'@typescript-eslint/consistent-type-exports': [
			'error',
			{ fixMixedExportsWithInlineTypeSpecifier: true },
		],
		'@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],

		// enforce consistent order of class members
		'@typescript-eslint/member-ordering': 'error',

		// set up naming convention rules
		'@typescript-eslint/naming-convention': [
			'error',
			// camelCase for everything not otherwise indicated
			{ selector: 'default', format: ['camelCase'] },
			// allow known default exclusions
			{
				selector: 'default',
				filter: { regex: '^(_id|__v)$', match: true },
				format: null,
			},
			// allow variables to be camelCase or UPPER_CASE
			{ selector: 'variable', format: ['camelCase', 'UPPER_CASE'] },
			// allow known variable exclusions
			{
				selector: 'variable',
				filter: { regex: '^(_id|__v)$', match: true },
				format: null,
			},
			{
				// variables ending in Model should be PascalCase
				selector: ['import', 'variable'],
				filter: { regex: '^.*Model$', match: true },
				format: ['PascalCase'],
			},
			// do not enforce format on property names
			{ selector: 'property', format: null },
			// PascalCase for classes and TypeScript keywords
			{
				selector: ['typeLike'],
				format: ['PascalCase'],
			},
		],

		// ensure unused variables are treated as an error
		// overrides @typescript-eslint/recommended -- '@typescript-eslint/no-unused-vars': 'warn'
		// https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/configs/recommended.ts
		'@typescript-eslint/no-unused-vars': 'warn',
	},

	overrides: [
		{
			files: ['**/*.ts'],
			extends: ['plugin:@typescript-eslint/recommended-requiring-type-checking'],
			rules: {
				// disable rules turned on by @typescript-eslint/recommended-requiring-type-checking which are too noisy
				// https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/configs/recommended-requiring-type-checking.ts
				'@typescript-eslint/no-unsafe-argument': 'off',
				'@typescript-eslint/no-unsafe-assignment': 'off',
				'@typescript-eslint/no-unsafe-call': 'off',
				'@typescript-eslint/no-unsafe-member-access': 'off',
				'@typescript-eslint/no-unsafe-return': 'off',
				'@typescript-eslint/no-misused-promises': 'off',
				'@typescript-eslint/restrict-template-expressions': 'off',
				'@typescript-eslint/unbound-method': 'off',
				'import/prefer-default-export': 'off',

				// force explicit member accessibility modifiers
				'@typescript-eslint/explicit-member-accessibility': [
					'error',
					{ accessibility: 'no-public' },
				],

				// enforce return types on module boundaries
				'@typescript-eslint/explicit-module-boundary-types': 'error',

				// allow empty functions
				'@typescript-eslint/no-empty-function': 'off',
			},
		},

		{
			files: ['**/index.ts'],
			rules: {
				// prefer named exports for certain file types
				'import/no-default-export': 'error',
			},
		},

		{
			files: ['./.*.js', './*.js'],
			rules: {
				// allow requires in config files
				'@typescript-eslint/no-var-requires': 'off',
			},
		},

		{
			files: ['**/*.d.ts'],
			rules: {
				// allow tests to create multiple classes
				'max-classes-per-file': 'off',
				'@typescript-eslint/naming-convention': 'off',

				'lines-between-class-members': 'off',
				'@typescript-eslint/lines-between-class-members': 'off',
				'@typescript-eslint/member-ordering': 'off',
				'@typescript-eslint/ban-types': 'off',
				'@typescript-eslint/no-explicit-any': 'off',
			},
		},
	],
};
