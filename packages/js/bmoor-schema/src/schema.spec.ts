import {expect} from 'chai';

import {Schema} from './schema';

describe('bmoor-schema :: schema', function () {
	describe('implode', function () {
		it('should work', function () {
			const schema = new Schema({
				fields: [
					{
						ref: 'f-1',
						path: 'foo.bar',
						info: {
							type: 'string',
						},
					},
					{
						ref: 'f-2',
						path: 'foo.bar2',
						info: {
							type: 'number',
						},
					},
					{
						ref: 'f-3',
						path: 'hello[].world',
						info: {
							type: 'number',
						},
					},
					{
						ref: 'f-4',
						path: 'hello[].otherWorld[]',
						info: {
							type: 'string',
						},
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
			const schema = new Schema({
				fields: [
					{
						ref: 'f-1',
						path: 'foo.bar',
						info: {
							type: 'string',
						},
					},
					{
						ref: 'f-2',
						path: 'foo.bar2',
						info: {
							type: 'number',
						},
					},
					{
						ref: 'f-3',
						path: 'hello[].world',
						info: {
							type: 'number',
						},
					},
					{
						ref: 'f-4',
						path: 'hello[].otherWorld[]',
						info: {
							type: 'string',
						},
					},
				],
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
