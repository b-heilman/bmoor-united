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
				array: null,
				next: {
					foo: {
						ref: 'junk_0',
						array: null,
						next: {
							bar: {
								ref: 'junk_1',
								array: null,
								next: {
									value: {
										ref: 'junk',
										array: null,
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
				array: null,
				next: {
					foo: {
						ref: 'v1_0',
						array: null,
						next: {
							bar: {
								ref: 'v1_1',
								array: null,
								next: {
									value1: {
										ref: 'v1',
										array: null,
										next: null
									},
									value2: {
										ref: 'v2',
										array: null,
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
				array: null,
				next: {
					foo: {
						ref: 'v1_0',
						array: null,
						next: {
							bar: {
								ref: 'v1_1',
								array: {
									ref: 'v1'
								},
								next: null
							}
						}
					}
				}
			});
		});

		it('merging basic array paths', function () {
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
				array: null,
				next: {
					foo: {
						ref: 'v1_0',
						array: null,
						next: {
							bar: {
								ref: 'v1_1',
								array: {
									ref: null
								},
								next: {
									value1: {
										ref: 'v1',
										array: null,
										next: null
									},
									value2: {
										ref: 'v2',
										array: null,
										next: null
									}
								}
							}
						}
					}
				}
			});

			expect(stats1.arrays).to.deep.equal(['v1_1']);
			expect(stats2.arrays).to.deep.equal(['v1_1']);
		});
	});
});
