import { EvalAstFactory, Parser } from '@umbraco-cms/backoffice/external/jexpr';
import type { Expression, Scope } from '@umbraco-cms/backoffice/external/jexpr';

const astFactory = new EvalAstFactory();
const expressionCache = new Map<string, Expression | undefined>();

const bindingRegex = /(?<!\\){{(.*?)(?:(?<!\\)}})/g;

export function labelTemplate(template: string, value: any): string {
	const functions = {
		reverse: (s: string) => s.split('').reverse().join(''),
		lowercase: (s: string) => s.toLocaleLowerCase(),
		uppercase: (s: string) => s.toLocaleUpperCase(),
		Number: Number,
		JSON: JSON,
	};

	const scope: Scope = { ...value, ...functions };

	const strings = template.split(bindingRegex);

	for (let i = 1; i < strings.length; i += 2) {
		const expression = strings[i];

		let ast = expressionCache.get(expression);
		if (ast === undefined) {
			ast = new Parser(expression, astFactory).parse();
			expressionCache.set(expression, ast);
		}

		if (ast) {
			strings[i] = ast.evaluate(scope);
		}
	}

	return strings.join('');
}
