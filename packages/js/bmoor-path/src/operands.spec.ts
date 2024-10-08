import {expect} from 'chai';

import {Expressable} from '@bmoor/compiler';

import {OperandIndex, indexExpressables} from './operands';
import {Parser} from './parser';
import {ParserModes} from './parser.interface';

describe('@bmoor/path - operands', function () {
	const pathParser = new Parser();

	describe('indexExpressables', function () {
		it('basic object path', function () {
			const path: Expressable[] = pathParser.express('foo.bar.value', {
				mode: ParserModes.read,
			});
			const index = new OperandIndex('root');

			indexExpressables('junk', path, index);

			expect(index.toJSON()).to.deep.equal({
				ref: 'root',
				array: [],
				next: {
					foo: {
						ref: 'junk_0',
						array: [],
						next: {
							bar: {
								ref: 'junk_1',
								array: [],
								next: {
									value: {
										ref: 'junk',
										array: [],
										next: null,
									},
								},
							},
						},
					},
				},
			});
		});

		it('merging basic object paths', function () {
			const path1: Expressable[] = pathParser.express('foo.bar.value1', {
				mode: ParserModes.read,
			});
			const path2: Expressable[] = pathParser.express('foo.bar.value2', {
				mode: ParserModes.read,
			});
			const index = new OperandIndex('root');

			indexExpressables('v1', path1, index);
			indexExpressables('v2', path2, index);

			expect(index.toJSON()).to.deep.equal({
				ref: 'root',
				array: [],
				next: {
					foo: {
						ref: 'v1_0',
						array: [],
						next: {
							bar: {
								ref: 'v1_1',
								array: [],
								next: {
									value1: {
										ref: 'v1',
										array: [],
										next: null,
									},
									value2: {
										ref: 'v2',
										array: [],
										next: null,
									},
								},
							},
						},
					},
				},
			});
		});

		it('array as leafs', function () {
			const path1: Expressable[] = pathParser.express('foo.bar[]', {
				mode: ParserModes.read,
			});
			const index = new OperandIndex('root');

			const stats1 = indexExpressables('v1', path1, index);

			expect(index.toJSON()).to.deep.equal({
				ref: 'root',
				array: [],
				next: {
					foo: {
						ref: 'v1_0',
						array: [],
						next: {
							bar: {
								ref: 'v1_1',
								array: [
									{
										ref: 'v1_2',
										leafRef: 'v1',
										sources: null,
									},
								],
								next: null,
							},
						},
					},
				},
			});

			expect(stats1.arrays).to.deep.equal(['v1_2']);
		});

		describe('merging basic array paths', function () {
			it('should work normal', function () {
				const path1: Expressable[] = pathParser.express(
					'foo.bar[].value1',
					{mode: ParserModes.read},
				);
				const path2: Expressable[] = pathParser.express(
					'foo.bar[].value2',
					{mode: ParserModes.read},
				);
				const index = new OperandIndex('root');

				const stats1 = indexExpressables('v1', path1, index);
				const stats2 = indexExpressables('v2', path2, index);

				expect(stats1).to.deep.equal({
					ref: 'v1',
					arrays: ['v1_2'],
				});
				expect(stats2).to.deep.equal({
					ref: 'v2',
					arrays: ['v1_2'],
				});

				expect(index.toJSON()).to.deep.equal({
					ref: 'root',
					array: [],
					next: {
						foo: {
							ref: 'v1_0',
							array: [],
							next: {
								bar: {
									ref: 'v1_1',
									array: [
										{
											ref: 'v1_2',
											leafRef: null,
											sources: null,
										},
									],
									next: {
										value1: {
											ref: 'v1',
											filter: 'v1_2',
											array: [],
											next: null,
										},
										value2: {
											ref: 'v2',
											filter: 'v1_2',
											array: [],
											next: null,
										},
									},
								},
							},
						},
					},
				});
			});

			it('should work for leaves', function () {
				// this is a big of a non-sensical test, but it does cover
				// a few edge cases

				const path1: Expressable[] = pathParser.express('foo.bar[]', {
					mode: ParserModes.read,
				});
				const path2: Expressable[] = pathParser.express('foo.bar[]', {
					mode: ParserModes.read,
				});
				const path3: Expressable[] = pathParser.express(
					'foo.bar[].value',
					{mode: ParserModes.write},
				);
				const path4: Expressable[] = pathParser.express(
					'foo.bar[].value2',
					{mode: ParserModes.write},
				);
				const path5: Expressable[] = pathParser.express('hello[]', {
					mode: ParserModes.read,
				});
				const path6: Expressable[] = pathParser.express(
					'foo.bar[].value3',
					{mode: ParserModes.write},
				);

				const index = new OperandIndex('root');
				const index2 = new OperandIndex('root2');

				const stats1 = indexExpressables('v1', path1, index);
				const stats2 = indexExpressables('v2', path2, index);
				const stats3 = indexExpressables('v3', path3, index2, stats1);
				const stats4 = indexExpressables('v4', path4, index2, stats2);
				const stats5 = indexExpressables('v5', path5, index);
				const stats6 = indexExpressables('v6', path6, index2, stats5);

				expect(stats1).to.deep.equal({
					ref: 'v1',
					arrays: ['v1_2'],
				});
				expect(stats2).to.deep.equal({
					ref: 'v1',
					arrays: ['v1_2'],
				});
				expect(stats3).to.deep.equal({
					ref: 'v1',
					arrays: ['v1_2'],
				});
				expect(stats4).to.deep.equal({
					ref: 'v1',
					arrays: ['v1_2'],
				});
				expect(stats5).to.deep.equal({
					ref: 'v5',
					arrays: ['v5_1'],
				});
				expect(stats6).to.deep.equal({
					ref: 'v5',
					arrays: ['v5_1'],
				});

				expect(index.toJSON()).to.deep.equal({
					ref: 'root',
					array: [],
					next: {
						foo: {
							ref: 'v1_0',
							array: [],
							next: {
								bar: {
									ref: 'v1_1',
									array: [
										{
											ref: 'v1_2',
											leafRef: 'v1',
											sources: null,
										},
									],
									next: null,
								},
							},
						},
						hello: {
							ref: 'v5_0',
							array: [
								{
									ref: 'v5_1',
									leafRef: 'v5',
									sources: null,
								},
							],
							next: null,
						},
					},
				});

				expect(index2.toJSON()).to.deep.equal({
					ref: 'root2',
					array: [],
					next: {
						foo: {
							ref: 'v3_0',
							array: [],
							next: {
								bar: {
									ref: 'v3_1',
									array: [
										{
											ref: 'v1_2',
											leafRef: null,
											sources: ['v1_2', 'v5_1'],
										},
									],
									next: {
										value: {
											ref: 'v1',
											filter: 'v1_2',
											array: [],
											next: null,
										},
										value2: {
											ref: 'v1',
											filter: 'v1_2',
											array: [],
											next: null,
										},
										value3: {
											ref: 'v5',
											filter: 'v5_1',
											array: [],
											next: null,
										},
									},
								},
							},
						},
					},
				});
			});

			it('should work with arrays stats', function () {
				const path1: Expressable[] = pathParser.express(
					'foo.bar[].value1',
					{mode: ParserModes.read},
				);
				const path2: Expressable[] = pathParser.express(
					'foo.bar[].value2',
					{mode: ParserModes.read},
				);
				const index = new OperandIndex('root');

				const info = {
					arrays: ['key_1'],
				};
				const stats1 = indexExpressables('v1', path1, index, info);
				const stats2 = indexExpressables('v2', path2, index, info);

				expect(index.toJSON()).to.deep.equal({
					ref: 'root',
					array: [],
					next: {
						foo: {
							ref: 'v1_0',
							array: [],
							next: {
								bar: {
									ref: 'v1_1',
									array: [
										{
											leafRef: null,
											ref: 'key_1',
											sources: ['key_1'],
										},
									],
									next: {
										value1: {
											ref: 'v1',
											filter: 'key_1',
											array: [],
											next: null,
										},
										value2: {
											ref: 'v2',
											filter: 'key_1',
											array: [],
											next: null,
										},
									},
								},
							},
						},
					},
				});

				expect(stats1.arrays).to.deep.equal(['key_1']);
				expect(stats2.arrays).to.deep.equal(['key_1']);
			});
		});

		describe('back to back arrays', function () {
			it('without and references', function () {
				const path1: Expressable[] = pathParser.express('foo[][].bar', {
					mode: ParserModes.read,
				});
				const index = new OperandIndex('root');

				indexExpressables('v1', path1, index);

				expect(index.toJSON()).to.deep.equal({
					ref: 'root',
					array: [],
					next: {
						foo: {
							ref: 'v1_0',
							array: [
								{
									ref: 'v1_1',
									leafRef: null,
									sources: null,
								},
								{
									ref: 'v1_2',
									leafRef: null,
									sources: null,
								},
							],
							next: {
								bar: {
									ref: 'v1',
									filter: 'v1_2',
									array: [],
									next: null,
								},
							},
						},
					},
				});
			});

			it('with references', function () {
				const path1: Expressable[] = pathParser.express('foo[][].bar', {
					mode: ParserModes.read,
				});
				const index = new OperandIndex('root');

				indexExpressables('v1', path1, index, {
					arrays: ['arr_1', 'arr_2'],
				});

				expect(index.toJSON()).to.deep.equal({
					ref: 'root',
					array: [],
					next: {
						foo: {
							ref: 'v1_0',
							array: [
								{
									ref: 'arr_1',
									leafRef: null,
									sources: ['arr_1'],
								},
								{
									ref: 'arr_2',
									leafRef: null,
									sources: ['arr_2'],
								},
							],
							next: {
								bar: {
									ref: 'v1',
									filter: 'arr_2',
									array: [],
									next: null,
								},
							},
						},
					},
				});
			});

			it('as a leaf', function () {
				const path1: Expressable[] = pathParser.express('foo[][]', {
					mode: ParserModes.read,
				});
				const index = new OperandIndex('root');

				indexExpressables('v1', path1, index);

				expect(index.toJSON()).to.deep.equal({
					ref: 'root',
					array: [],
					next: {
						foo: {
							ref: 'v1_0',
							array: [
								{
									ref: 'v1_1',
									leafRef: null,
									sources: null,
								},
								{
									ref: 'v1_2',
									leafRef: 'v1',
									sources: null,
								},
							],
							next: null,
						},
					},
				});
			});

			it('in a pair', function () {
				const path1: Expressable[] = pathParser.express('foo[][].bar', {
					mode: ParserModes.read,
				});
				const path2: Expressable[] = pathParser.express('foo[][].bar2', {
					mode: ParserModes.read,
				});
				const index = new OperandIndex('root');

				indexExpressables('v1', path1, index);
				indexExpressables('v2', path2, index);

				expect(index.toJSON()).to.deep.equal({
					ref: 'root',
					array: [],
					next: {
						foo: {
							ref: 'v1_0',
							array: [
								{
									ref: 'v1_1',
									leafRef: null,
									sources: null,
								},
								{
									ref: 'v1_2',
									leafRef: null,
									sources: null,
								},
							],
							next: {
								bar: {
									ref: 'v1',
									filter: 'v1_2',
									array: [],
									next: null,
								},
								bar2: {
									ref: 'v2',
									filter: 'v1_2',
									array: [],
									next: null,
								},
							},
						},
					},
				});
			});
		});
	});
});
