module.exports = {
	parserOptions: {
		project: './tsconfig.eslint.json'
	},
	extends: [
		'@thingbound/eslint-config-typescript'
	],
	rules: {
		'import/extensions': [ 'error', 'always' ],
	}
}
