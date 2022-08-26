import {expect} from 'chai';

import {Expressable} from '@bmoor/compiler';

import {Parser} from './parser';
import {ParserModes} from './parser.interface';
import {OperandIndex, indexExpressables} from './operands';

describe('@bmoor/path - operands', function () {
	const pathParser = new Parser();

	describe('indexExpressables', function () {
		it('basic object path', function () {
			const path: Expressable[] = pathParser.express(
				'foo.bar.value',
				ParserModes.read
			);
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
										next: null
									}
								}
							}
						}
					}
				}
			});
		});

		it('merging basic object paths', function () {
			const path1: Expressable[] = pathParser.express(
				'foo.bar.value1',
				ParserModes.read
			);
			const path2: Expressable[] = pathParser.express(
				'foo.bar.value2',
				ParserModes.read
			);
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
										next: null
									},
									value2: {
										ref: 'v2',
										array: [],
										next: null
									}
								}
							}
						}
					}
				}
			});
		});

		it('array as leafs', function () {
			const path1: Expressable[] = pathParser.express(
				'foo.bar[]',
				ParserModes.read
			);
			const index = new OperandIndex('root');

			indexExpressables('v1', path1, index);

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
								array: [{
									isLeaf: true,
									ref: 'v1'
								}],
								next: null
							}
						}
					}
				}
			});
		});

		describe('merging basic array paths', function () {
			it('should work normal', function(){
				const path1: Expressable[] = pathParser.express(
					'foo.bar[].value1',
					ParserModes.read
				);
				const path2: Expressable[] = pathParser.express(
					'foo.bar[].value2',
					ParserModes.read
				);
				const index = new OperandIndex('root');
	
				const stats1 = indexExpressables('v1', path1, index);
				const stats2 = indexExpressables('v2', path2, index);
	
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
									array: [{
										isLeaf: false,
										ref: 'v1_2'
									}],
									next: {
										value1: {
											ref: 'v1',
											array: [],
											next: null
										},
										value2: {
											ref: 'v2',
											array: [],
											next: null
										}
									}
								}
							}
						}
					}
				});
	
				expect(stats1.arrays).to.deep.equal(['v1_2']);
				expect(stats2.arrays).to.deep.equal(['v1_2']);
			});

			it('should work with arrays stats', function(){
				const path1: Expressable[] = pathParser.express(
					'foo.bar[].value1',
					ParserModes.read
				);
				const path2: Expressable[] = pathParser.express(
					'foo.bar[].value2',
					ParserModes.read
				);
				const index = new OperandIndex('root');
	
				const info = {
					arrays: ['key_1']
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
									array: [{
										isLeaf: false,
										ref: 'key_1'
									}],
									next: {
										value1: {
											ref: 'v1',
											array: [],
											next: null
										},
										value2: {
											ref: 'v2',
											array: [],
											next: null
										}
									}
								}
							}
						}
					}
				});
	
				expect(stats1.arrays).to.deep.equal(['key_1']);
				expect(stats2.arrays).to.deep.equal(['key_1']);
			});
		});

		describe('back to back arrays', function () {
			it.only('without and references', function(){
				const path1: Expressable[] = pathParser.express(
					'foo[][].bar',
					ParserModes.read
				);
				const index = new OperandIndex('root');
	
				indexExpressables('v1', path1, index);
	
				expect(index.toJSON()).to.deep.equal({
					ref: 'root',
					array: [],
					next: {
						foo: {
							ref: 'v1_0',
							array: [{
								ref: 'v1_1',
								isLeaf: false
							}, {
								ref: 'v1_2',
								isLeaf: false
							}],
							next: {
								bar: {
									ref: 'v1',
									array: [],
									next: null
								}
							}
						}
					}
				});
			});

			it.only('with references', function(){
				const path1: Expressable[] = pathParser.express(
					'foo[][].bar',
					ParserModes.read
				);
				const index = new OperandIndex('root');
	
				indexExpressables('v1', path1, index, {
					arrays: ['arr_1', 'arr_2']
				});
	
				expect(index.toJSON()).to.deep.equal({
					ref: 'root',
					array: [],
					next: {
						foo: {
							ref: 'v1_0',
							array: [{
								ref: 'arr_1',
								isLeaf: false
							}, {
								ref: 'arr_2',
								isLeaf: false
							}],
							next: {
								bar: {
									ref: 'v1',
									array: [],
									next: null
								}
							}
						}
					}
				});
			});

			it.only('as a leaf', function(){
				const path1: Expressable[] = pathParser.express(
					'foo[][]',
					ParserModes.read
				);
				const index = new OperandIndex('root');
	
				indexExpressables('v1', path1, index);
	
				expect(index.toJSON()).to.deep.equal({
					ref: 'root',
					array: [],
					next: {
						foo: {
							ref: 'v1_0',
							array: [{
								ref: 'v1_1',
								isLeaf: false
							}, {
								ref: 'v1',
								isLeaf: true
							}],
							next: null
						}
					}
				});
			});
		});
	});
});
