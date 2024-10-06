import {Pattern, TokenizerState} from '@bmoor/compiler';

import { isVariable } from './reference';
import {QueryExpressionTokenAccessor} from '../token/accessor';

// REFERENCE: @bmoor/path.pattern.dot
export class QueryExpressionPatternAccessor extends Pattern {
    // .path
    open(str, pos) {
        if (str[pos] === '.') {
            return new TokenizerState(pos + 1);
        }

        return null;
    }

    close(master, pos, state: TokenizerState) {
        const ch = master[pos];

        if (isVariable.test(ch)) {
            return null;
        }

        return pos - 1;
    }

    toToken(content: string, state: TokenizerState) {
        return new QueryExpressionTokenAccessor(
            content, 
            state
            /*, {series}*/
        );
    }
}