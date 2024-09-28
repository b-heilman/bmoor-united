import {Pattern, TokenizerState} from '@bmoor/compiler';

import { isVariable } from './reference';
import {QueryExpressionTokenConstant} from '../token/constant';

export class QueryExpressionPatternVariable extends Pattern {
    open(str, pos) {
        const ch = str[pos];

        if (isVariable.test(ch)) {
            return new TokenizerState(pos);
        }

        return null;
    }

    close(str, pos, state: TokenizerState) {
        const ch = str[pos];

        if (isVariable.test(ch)) {
            return null;
        }

        return pos-1;
    }

    toToken(content: string, state: TokenizerState) {
        const lowerCase = content.toLowerCase();

        let value;
        if (lowerCase === 'true') {
            value = true;
        } else if (lowerCase === 'false') {
            value = false;
        } else if (lowerCase === 'null') {
            value = null;
        } else {
            value = undefined;
        }

        return new QueryExpressionTokenConstant(
            value, 
            state
            /*, {series}*/
        );
    }
}