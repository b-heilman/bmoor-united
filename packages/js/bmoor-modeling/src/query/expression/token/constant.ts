import {
	//	CompilerInterface,
	Expressable,
	//	ExpressableUsages,
	//	ExpressorExpressSettings,
	Token,
} from '@bmoor/compiler';

export class QueryExpressionTokenConstant extends Token {
	toExpressable() /*
        compiler?: CompilerInterface, 
        settings?: ExpressorExpressSettings
        */
	: Expressable {
		return null;
	}
}
