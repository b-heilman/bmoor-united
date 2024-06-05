import {expect} from 'chai';

import {Schema} from '../schema';
import {types} from '../typing';
import {BuilderJSONSchema} from './jsonschema';

describe('@bmoor/schema :: FormatJSONSchema', function () {
	it('should properly generate a json schema', function () {
		const schemas = {
            's-1': new Schema({
                fields: [
                    {
                        path: 'foo',
                        info: {
                            type: 'string',
                        },
                    },
                    {
                        path: 'bar',
                        info: {
                            type: 'number',
                        },
                    },
                ],
            }),
            's-2': new Schema({
                fields: [
                    {
                        path: 'hello',
                        info: {
                            type: 'string',
                        },
                    },
                    {
                        path: 'world',
                        info: {
                            type: 'number',
                        },
                    },
                ],
            }),
            's-3': new Schema({
                fields: [
                    {
                        path: 'id',
                        info: {
                            use: 'primary',
                            type: 'string',
                        },
                    },
                    {
                        path: 'otherId',
                        info: {
                            type: 'string',
                        },
                    },
                    {
                        path: 'mount',
                        info: {
                            type: 'array'
                        }
                    },
                    {
                        path: 'parent',
                        info: {
                            type: 'object'
                        }
                    }
                ],
                relationships: [{

                }]
            })
        };

		const formatter = new BuilderJSONSchema({
			getValidator() {
				return () => Promise.resolve('fail');
			},
			getTyping(ref) {
				return types.getType(ref);
			},
			getSchema() {
				return schema;
			},
			getConnector() {
				return null;
			}
		});

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
					},
				},

				hello: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							world: {
								type: 'number',
							},
							otherWorld: {
								type: 'array',
								items: {
									type: 'string',
								},
							},
						},
					},
				},
			},
		});
	});
});