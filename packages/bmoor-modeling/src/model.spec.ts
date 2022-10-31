import {expect} from 'chai';

import {Model} from './model';
import {factory} from './model/field/set';

describe('@bmoor-modeling::Model', function () {
	describe('::toTypeScript()', function () {
		it('should correctly create a typescript format', function () {
			const model = new Model({
				ref: 'junk',
				fields: factory(
					{
						external: 'key',
						internal: 'id',
						usage: 'key',
						jsonType: 'number'
					},
					{
						external: 'field1',
						internal: 'field1',
						jsonType: 'string'
					},
					{
						external: 'other.field2',
						internal: 'field2',
						jsonType: 'number'
					}
				)
			});

			const ts = model.toTypescript();
			const expected = `
				export interface ExternalRead{
					key: number,
					field1: string,
					other: {
							field2: number
					}
				}
				export interface ExternalReference{
						key: number
				}
				export interface ExternalCreate{
						field1: string,
						other: {
								field2: number
						}
				}
				export interface ExternalUpdate{
						field1?: string,
						other: {
								field2?: number
						}
				}
				export interface ExternalSearch{
				
				}
				export interface InternalRead{
						id: number,
						field1: string,
						field2: number
				}
				export interface InternalReference{
						id: number
				}
				export interface InternalCreate{
						field1: string,
						field2: number
				}
				export interface InternalUpdate{
						field1?: string,
						field2?: number
				}
				export interface InternalSearch{
				
				}
			`;

			expect(ts.replace(/\s+/g, '')).to.equal(
				expected.replace(/\s+/g, '')
			);
		});
	});
});
