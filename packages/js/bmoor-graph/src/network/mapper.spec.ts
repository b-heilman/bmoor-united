import {expect} from 'chai';

import {Mapper} from './mapper.js';

describe('@bmoor/graph - network/mapper', function () {
	it('should properly instantiate', function () {
		const mapper = new Mapper();

		mapper.addLink('table-1', 'id', 'table-2', 'eins');
		mapper.addLink('table-2', 'id', 'table-3', 'zwei');
		mapper.addLink('table-3', 'id', 'table-4', 'drei');
		mapper.addLink('table-4', 'eins', 'table-1', 'id');

		const table1 = mapper.getHub('table-1');
		const table2 = mapper.getHub('table-2');
		const table3 = mapper.getHub('table-3');
		const table4 = mapper.getHub('table-4');

		expect(table1.reduceConnections()).to.deep.equal([
			{
				from: 'table-1',
				fromPath: 'id',
				to: 'table-2',
				toPath: 'eins',
				metadata: {
					direction: 'outgoing'
				}
			},
			{
				from: 'table-1',
				fromPath: 'id',
				to: 'table-4',
				toPath: 'eins',
				metadata: {
					direction: 'incoming'
				}
			}
		]);

		expect(table1.reduceConnectors()).to.deep.equal({
			'table-2': [
				{
					from: 'table-1',
					fromPath: 'id',
					to: 'table-2',
					toPath: 'eins',
					metadata: {
						direction: 'outgoing'
					}
				}
			],
			'table-4': [
				{
					from: 'table-1',
					fromPath: 'id',
					to: 'table-4',
					toPath: 'eins',
					metadata: {
						direction: 'incoming'
					}
				}
			]
		});

		expect(table2.reduceConnections()).to.deep.equal([
			{
				from: 'table-2',
				fromPath: 'eins',
				to: 'table-1',
				toPath: 'id',
				metadata: {
					direction: 'incoming'
				}
			},
			{
				from: 'table-2',
				fromPath: 'id',
				to: 'table-3',
				toPath: 'zwei',
				metadata: {
					direction: 'outgoing'
				}
			}
		]);

		expect(table2.reduceConnectors()).to.deep.equal({
			'table-1': [
				{
					from: 'table-2',
					fromPath: 'eins',
					to: 'table-1',
					toPath: 'id',
					metadata: {
						direction: 'incoming'
					}
				}
			],
			'table-3': [
				{
					from: 'table-2',
					fromPath: 'id',
					to: 'table-3',
					toPath: 'zwei',
					metadata: {
						direction: 'outgoing'
					}
				}
			]
		});

		expect(table3.reduceConnections()).to.deep.equal([
			{
				from: 'table-3',
				fromPath: 'zwei',
				to: 'table-2',
				toPath: 'id',
				metadata: {
					direction: 'incoming'
				}
			},
			{
				from: 'table-3',
				to: 'table-4',
				fromPath: 'id',
				toPath: 'drei',
				metadata: {
					direction: 'outgoing'
				}
			}
		]);

		expect(table3.reduceConnectors()).to.deep.equal({
			'table-2': [
				{
					from: 'table-3',
				to: 'table-2',
					fromPath: 'zwei',
					toPath: 'id',
					metadata: {
						direction: 'incoming'
					}
				}
			],
			'table-4': [
				{
					from: 'table-3',
					to: 'table-4',
					fromPath: 'id',
					toPath: 'drei',
					metadata: {
						direction: 'outgoing'
					}
				}
			]
		});

		expect(table4.reduceConnections()).to.deep.equal([
			{
				from: 'table-4',
				to: 'table-3',
				fromPath: 'drei',
				toPath: 'id',
				metadata: {
					direction: 'incoming'
				}
			},
			{
				from: 'table-4',
				to: 'table-1',
				fromPath: 'eins',
				toPath: 'id',
				metadata: {
					direction: 'outgoing'
				}
			}
		]);

		expect(table4.reduceConnectors()).to.deep.equal({
			'table-3': [
				{
					from: 'table-4',
					to: 'table-3',
					fromPath: 'drei',
					toPath: 'id',
					metadata: {
						direction: 'incoming'
					}
				}
			],
			'table-1': [
				{
					from: 'table-4',
					to: 'table-1',
					fromPath: 'eins',
					toPath: 'id',
					metadata: {
						direction: 'outgoing'
					}
				}
			]
		});
	});

	/**
	describe('::getRelationships', function () {
		let mapper = null;
		let fakeNexus = null;

		beforeEach(function () {
			mapper = new Mapper();

			fakeNexus = {
				loadSource: async () => ({isFlat: false})
			};
		});

		it('pull in a singlar value', async function () {
			const model1 = new Model('test-1', fakeNexus);

			await model1.configure({
				source: 'source-1',
				fields: {
					eins: {
						update: false
					},
					zwei: {
						update: true,
						link: {
							to: 'test-2',
							field: 'id'
						}
					}
				}
			});

			const model2 = new Model('test-2', fakeNexus);

			await model2.configure({
				fields: {
					id: {
						update: false
					}
				}
			});

			const model3 = new Model('test-3', fakeNexus);

			await model3.configure({
				fields: {
					id: {
						update: false
					},
					zwei: {
						update: true,
						link: {
							to: 'test-2',
							field: 'id'
						}
					}
				}
			});

			mapper.addModel(model1);
			mapper.addModel(model2);
			mapper.addModel(model3);

			expect(mapper.getRelationships(model1.name)).to.deep.equal([
				{
					to: 'test-2',
					fromPath: 'zwei',
					toPath: 'id',
					metadata: {direction: 'outgoing'}
				}
			]);

			expect(mapper.getRelationships(model3.name)).to.deep.equal([
				{
					to: 'test-2',
					fromPath: 'zwei',
					toPath: 'id',
					metadata: {direction: 'outgoing'}
				}
			]);

			expect(mapper.getRelationships(model2.name)).to.deep.equal([
				{
					to: 'test-1',
					fromPath: 'id',
					toPath: 'zwei',
					metadata: {direction: 'incoming'}
				},
				{
					to: 'test-3',
					fromPath: 'id',
					toPath: 'zwei',
					metadata: {direction: 'incoming'}
				}
			]);
		});
	});

	describe('::getRelationship', function () {
		let mapper = null;

		let fakeNexus = null;

		beforeEach(function () {
			mapper = new Mapper();

			fakeNexus = {
				loadSource: async () => ({isFlat: false})
			};
		});

		it('pull in a singlar value', async function () {
			const model1 = new Model('test-1', fakeNexus);

			await model1.configure({
				fields: {
					eins: {
						update: false
					},
					zwei: {
						update: true,
						link: {
							to: 'test-2',
							field: 'id'
						}
					},
					drei: {
						update: true,
						link: {
							to: 'test-3',
							field: 'id'
						}
					},
					fier: {
						update: true,
						link: {
							to: 'test-3',
							field: 'id'
						}
					},
					parentId: {
						create: true,
						link: {
							to: 'test-1',
							field: 'id'
						}
					}
				}
			});

			const model2 = new Model('test-2', fakeNexus);
			await model2.configure({
				fields: {
					id: {
						update: false
					}
				}
			});

			const model3 = new Model('test-3', fakeNexus);
			model3.configure({
				fields: {
					id: {
						update: false
					}
				}
			});

			mapper.addModel(model1);
			mapper.addModel(model2);
			mapper.addModel(model3);

			expect(mapper.getRelationship(model1.name, 'test-2')).to.deep.equal({
				to: 'test-2',
				fromPath: 'zwei',
				toPath: 'id',
				metadata: {direction: 'outgoing'}
			});

			expect(mapper.getRelationship(model1.name, 'test-3')).to.deep.equal({
				to: 'test-3',
				fromPath: 'drei',
				toPath: 'id',
				metadata: {direction: 'outgoing'}
			});

			expect(
				mapper.getRelationship(model1.name, 'test-3', 'drei')
			).to.deep.equal({
				to: 'test-3',
				fromPath: 'drei',
				toPath: 'id',
				metadata: {direction: 'outgoing'}
			});

			expect(
				mapper.getRelationship(model1.name, 'test-3', 'fier')
			).to.deep.equal({
				to: 'test-3',
				fromPath: 'fier',
				toPath: 'id',
				metadata: {direction: 'outgoing'}
			});

			expect(mapper.getRelationship(model1.name, 'test-4')).to.equal(null);
		});
	});
	**/
	describe('#getByDirection', function () {
		const mapper = new Mapper();

		// table-1 {id}
		mapper.addLink('table-2', 'einsId', 'table-1', 'id');
		mapper.addLink('table-4', 'einsId', 'table-1', 'id');
		mapper.addLink('table-3', 'zweiId', 'table-2', 'id');
		mapper.addLink('table-3', 'fierId', 'table-4', 'id');
		mapper.addLink('table-5', 'fierId', 'table-4', 'id');

		it('should let me get all incoming routes', function () {
			expect(
				mapper.getByDirection('table-1', 'incoming').map((t) => t.to)
			).to.deep.equal(['table-2', 'table-4']);

			expect(
				mapper.getByDirection('table-1', 'outgoing').map((t) => t.to)
			).to.deep.equal([]);

			expect(
				mapper.getByDirection('table-4', 'incoming').map((t) => t.to)
			).to.deep.equal(['table-3', 'table-5']);

			expect(
				mapper.getByDirection('table-4', 'outgoing').map((t) => t.to)
			).to.deep.equal(['table-1']);
		});
	});
});
