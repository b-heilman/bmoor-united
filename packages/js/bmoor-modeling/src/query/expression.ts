import {Compiler} from '@bmoor/compiler';

import {QueryExpressionPatternAccessor} from './expression/pattern/accessor.ts';
import {QueryExpressionPatternBlock} from './expression/pattern/block.ts';
import {QueryExpressionPatternNumber} from './expression/pattern/number.ts';
import {QueryExpressionPatternOperation} from './expression/pattern/operation.ts';
import {QueryExpressionPatternReference} from './expression/pattern/reference.ts';
import {QueryExpressionPatternString} from './expression/pattern/string.ts';
import {QueryExpressionPatternVariable} from './expression/pattern/variable.ts';

// REFERENCE: @bmoor/path.parser
export class Parser extends Compiler {
	constructor() {
		super({
			tokenizer: [
				new QueryExpressionPatternReference(),
				new QueryExpressionPatternAccessor(),
				new QueryExpressionPatternBlock(),
				new QueryExpressionPatternNumber(),
				new QueryExpressionPatternString(),
				new QueryExpressionPatternOperation(),
				new QueryExpressionPatternVariable(),
			],
			reducer: [],
		});
	}
}
/**
const {Token} = require('bmoor-data/src/expression/Token.js');
const {Compound} = require('bmoor-data/src/expression/Compound.js');
const {Compiler} = require('bmoor-data/src/expression/Compiler.js');

const {StatementExpression, joiners} = require('../expression.js');
const {StatementVariable} = require('../variable.js');
**/

/**
const composites = new Config({
	compareRight: new ConfigObject({
		tokens: ['reference', 'accessor', 'operation', 'constant'],
		factory: function (tokens) {
			return new Compound(
				'exp',
				new StatementVariable(
					tokens[0].value,
					tokens[1].value,
					tokens[3].value,
					tokens[2].value
				)
			);
		}
	}),
	compareLeft: new ConfigObject({
		tokens: ['constant', 'operation', 'reference', 'accessor'],
		factory: function (tokens) {
			return new Compound(
				'exp',
				new StatementVariable(
					tokens[2].value,
					tokens[3].value,
					tokens[0].value,
					tokens[1].value
				)
			);
		}
	})
});

const expressions = null;

const compiler = new Compiler(parsings, expressions, composites);

function buildExpression(str) {
	str = str.replace(/[\s]/g, ''); // remove all white space

	const tokens = compiler.tokenize(str)[0].tokens;

	let hasAnd = false;
	const sets = tokens.reduce(
		(agg, token) => {
			if (token.type === 'block') {
				agg[agg.length - 1].push(buildExpression(token.value));
			} else if (token.type === 'operation') {
				if (token.value === '|') {
					agg.push([]);
				} else {
					hasAnd = true;
				}
			} else {
				// exp
				agg[agg.length - 1].push(token.value);
			}

			return agg;
		},
		[[]]
	);

	let rtn = null;
	if (sets.length === 1) {
		// everything is part of one `and` statement
		rtn = new StatementExpression();
		rtn.setJoin(joiners.and);

		sets[0].forEach((exp) => {
			rtn.addExpressable(exp);
		});
	} else {
		rtn = new StatementExpression();
		rtn.setJoin(joiners.or);

		if (hasAnd) {
			sets.forEach((orSet) => {
				if (orSet.length > 1) {
					const inside = new StatementExpression();
					inside.setJoin(joiners.and);

					orSet.forEach((exp) => {
						inside.addExpressable(exp);
					});

					rtn.addExpressable(inside);
				} else {
					rtn.addExpressable(orSet[0]);
				}
			});
		} else {
			// everything is part of one `or` statement
			sets.flat().forEach((exp) => {
				rtn.addExpressable(exp);
			});
		}
	}

	return rtn;
}

module.exports = {
	compiler,
	buildExpression
};
**/
