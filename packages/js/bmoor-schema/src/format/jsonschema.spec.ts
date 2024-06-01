import {expect} from 'chai';

import {Schema} from '../schema';
import {types} from '../typing';
import {FormatJSONSchema} from './jsonschema';

describe('@bmoor/schema :: FormatJSONSchema', function () {
	it('should properly generate a json schema', function () {
		const schema = new Schema({
			fields: [
				{
					path: 'foo.bar',
					info: {
						type: 'string',
					},
				},
				{
					path: 'foo.bar2',
					info: {
						type: 'number',
					},
				},
				{
					path: 'hello[].world',
					info: {
						type: 'number',
					},
				},
				{
					path: 'hello[].otherWorld[]',
					info: {
						type: 'string',
					},
				},
			],
		});

		const formatter = new FormatJSONSchema(types);

		formatter.addSchema(schema);

        expect(formatter.toJSON()).to.deep.equal({
			type: 'object',
			properties: {
				foo: {
					type: 'object',
                    properties: {
                        bar: {
                            type: 'string',
                        },
                        bar2: {
                            type: 'number',
                        },
                    }
				},
				
				hello: {
					type: 'array',
					items: {
						type: 'object',
                        properties: {
                            world: {
                                type: 'number'
                            },
                            otherWorld: {
                                type: 'array',
                                items: {
                                    type: 'string'
                                }
                            },
                        }
					},
				},
			},
		});
	});
});
