import {expect} from 'chai';

import {Schema} from './schema.ts';
import {SchemaContext} from './schema/context.ts';
import {TypingJSON} from './typing.interface.ts';
import {types} from './typing.ts';
import {validations} from './validator.ts';

describe('bmoor-schema :: schema', function () {
	let ctx;

	beforeEach(function () {
		ctx = new SchemaContext<TypingJSON>(types, validations);
	});

	describe('implode', function () {
		it('should work', function () {
			const schema = new Schema(ctx, {
				info: {
					'f-1': {
						type: 'string',
					},
					'f-2': {
						type: 'number',
					},
					'f-3': {
						type: 'number',
					},
					'f-4': {
						type: 'string',
					},
				},
				structure: [
					{
						ref: 'f-1',
						path: 'foo.bar',
					},
					{
						ref: 'f-2',
						path: 'foo.bar2',
					},
					{
						ref: 'f-3',
						path: 'hello[].world',
					},
					{
						ref: 'f-4',
						path: 'hello[].otherWorld[]',
					},
				],
			});

			const res = schema.implode({
				foo: {
					bar: 'a-1',
					bar2: 2,
				},
				hello: [
					{
						world: 3,
						otherWorld: ['a-4'],
					},
				],
			});

			expect(res).to.deep.equal({
				'f-1': 'a-1',
				'f-2': 2,
				'f-3': [3],
				'f-4': [['a-4']],
			});
		});
	});

	describe('explode', function () {
		it('should work', function () {
			const schema = new Schema(ctx, {
				info: {
					'f-1': {
						type: 'string',
					},
					'f-2': {
						type: 'number',
					},
					'f-3': {
						type: 'number',
					},
					'f-4': {
						type: 'string',
					},
				},
				structure: {
					foo: {
						bar: 'f-1',
						bar2: 'f-2',
					},
					hello: [
						{
							world: 'f-3',
							otherWorld: ['f-4'],
						},
					],
				},
			});

			const res = schema.explode({
				'f-1': 'a-1',
				'f-2': 2,
				'f-3': [3],
				'f-4': [['a-4']],
			});

			expect(res).to.deep.equal({
				foo: {
					bar: 'a-1',
					bar2: 2,
				},
				hello: [
					{
						world: 3,
						otherWorld: ['a-4'],
					},
				],
			});
		});
	});
});
