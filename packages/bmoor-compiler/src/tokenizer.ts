import {Protoken} from './tokenizer/protoken';
import {Token} from './tokenizer/token';

export class Tokenizer {
	rules: Protoken[];

	constructor(rules: Protoken[]) {
		this.rules = rules;
	}

	tokenize(str: string): Token[] {
		const rtn: Token[] = [];

		let pos = 0;

		while (pos < str.length) {
			let found: Token = null;

			for (let i = 0, c = this.rules.length; !found && i < c; i++) {
				found = this.rules[i].match(str, pos);
			}

			if (found) {
				pos = found.getNextPosition();
				rtn.push(found);
			} else {
				pos++;
			}
		}

		return rtn;
	}
}
