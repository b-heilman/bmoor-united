import {expect} from 'chai';

import {Context} from '@bmoor/context';

import {Features} from '../features.ts';
import {GraphSelector} from '../graph.interface.ts';
import {Graph} from '../graph.ts';
import {GraphDatum} from './datum.ts';
import {GraphLoader} from './loader.ts';
import {GraphView} from './view.ts';

describe('@bmoor/graph::view', function () {
	let ctx: Context = null;
	let week1: Graph<GraphDatum<GraphSelector>, GraphSelector> = null;
	let week2: Graph<GraphDatum<GraphSelector>, GraphSelector> = null;
	let week3: Graph<GraphDatum<GraphSelector>, GraphSelector> = null;
	let loader: GraphLoader<GraphDatum<GraphSelector>, GraphSelector> = null;

	beforeEach(function () {
		ctx = new Context({});
		week1 = new Graph((node) => new GraphDatum(node, week1));
		week2 = new Graph((node) => new GraphDatum(node, week2));
		week3 = new Graph((node) => new GraphDatum(node, week3));
		loader = new GraphLoader({});

		loader.addNodeGenerator({
			type: 'team',
			ref: function (datum): string {
				return <string>datum.team;
			},
			edges: {
				opponent: function (row) {
					return [<string>row.against];
				},
			},
		});

		loader.addEventGenerator({
			ref: function (row): string {
				return row.week + '-' + row.game;
			},
			connections: [
				{
					nodeRef: function (row): string {
						return <string>row.team;
					},
					features: ['score'],
				},
			],
		});

		loader.loadJSON(ctx, week1, [
			{
				team: 'team-1',
				against: 'team-2',
				week: 1,
				game: 1,
				score: 7,
			},
			{
				team: 'team-2',
				against: 'team-1',
				week: 1,
				game: 1,
				score: 3,
			},
			{
				team: 'team-3',
				against: 'team-4',
				week: 1,
				game: 2,
				score: 10,
			},
			{
				team: 'team-4',
				against: 'team-3',
				week: 1,
				game: 2,
				score: 17,
			},
		]);

		loader.loadJSON(ctx, week2, [
			{
				team: 'team-1',
				against: 'team-3',
				week: 2,
				game: 1,
				score: 7,
			},
			{
				team: 'team-3',
				against: 'team-1',
				week: 2,
				game: 1,
				score: 3,
			},
			{
				team: 'team-2',
				against: 'team-4',
				week: 2,
				game: 2,
				score: 10,
			},
			{
				team: 'team-4',
				against: 'team-2',
				week: 2,
				game: 2,
				score: 17,
			},
		]);

		loader.loadJSON(ctx, week3, [
			{
				team: 'team-1',
				against: 'team-4',
				week: 3,
				game: 1,
				score: 7,
			},
			{
				team: 'team-4',
				against: 'team-1',
				week: 3,
				game: 1,
				score: 3,
			},
			{
				team: 'team-3',
				against: 'team-2',
				week: 3,
				game: 2,
				score: 10,
			},
			{
				team: 'team-2',
				against: 'team-3',
				week: 3,
				game: 2,
				score: 17,
			},
		]);
	});

	describe('::getConnected', function () {
		it('should properly format with depth 1', function () {
			const view = new GraphView();

			view.addGraph(week1);

			expect(view.getConnected('team-1')).to.deep.equal([
				'team-1',
				'team-2',
			]);
		});

		it('should properly format with depth 2', function () {
			const view = new GraphView();

			view.addGraph(week1);
			view.addGraph(week2);

			// view.render('team-1');

			expect(view.getConnected('team-1')).to.deep.equal([
				'team-1',
				'team-2',
				'team-4',
				'team-3',
			]);

			expect(view.getConnected('team-1', 1)).to.deep.equal([
				'team-1',
				'team-2',
				'team-3',
			]);
		});

		it('should properly format with depth 2 - after render', function () {
			const view = new GraphView();

			view.addGraph(week1);
			view.addGraph(week2);

			view.render({root: 'team-1'});

			expect(view.getConnected('team-1')).to.deep.equal([
				'team-1',
				'team-2',
				'team-4',
				'team-3',
			]);

			expect(view.getConnected('team-1', 1)).to.deep.equal([
				'team-1',
				'team-2',
				'team-3',
			]);
		});

		it('should properly format with depth 3', function () {
			const view = new GraphView();

			view.addGraph(week1);
			view.addGraph(week2);
			view.addGraph(week3);

			expect(view.getConnected('team-1')).to.deep.equal([
				'team-1',
				'team-2',
				'team-4',
				'team-3',
			]);
		});
	});

	describe('::getAllPaths', function () {
		it('should properly format with depth 1', function () {
			const view = new GraphView();

			view.addGraph(week1);

			view.render({root: 'team-1'});

			expect(view.getAllPaths('team-1', 'team-4')).to.deep.equal([]);

			expect(view.getAllPaths('team-1', 'team-2')).to.deep.equal([
				['team-1', 'team-2'],
			]);
		});

		it('should properly format with depth 2', function () {
			const view = new GraphView();

			view.addGraph(week1);
			view.addGraph(week2);

			view.render({root: 'team-1'});

			expect(view.getAllPaths('team-1', 'team-4')).to.deep.equal([
				['team-1', 'team-2', 'team-4'],
			]);

			expect(view.getAllPaths('team-1', 'team-2')).to.deep.equal([
				['team-1', 'team-2'],
			]);
		});

		it('should properly format with depth 3', function () {
			const view = new GraphView();

			view.addGraph(week1);
			view.addGraph(week2);
			view.addGraph(week3);

			view.render({root: 'team-1'});

			expect(view.getAllPaths('team-1', 'team-4')).to.deep.equal([
				['team-1', 'team-4'],
				['team-1', 'team-2', 'team-4'],
				['team-1', 'team-3', 'team-2', 'team-4'],
			]);

			expect(view.getAllPaths('team-1', 'team-2')).to.deep.equal([
				['team-1', 'team-2'],
				['team-1', 'team-3', 'team-2'],
				['team-1', 'team-4', 'team-2'],
			]);
		});

		it('should properly format with depth 3 - full render', function () {
			const view = new GraphView();

			view.addGraph(week1);
			view.addGraph(week2);
			view.addGraph(week3);

			view.render({root: view.getConnected('team-1')});

			expect(view.getAllPaths('team-1', 'team-4')).to.deep.equal([
				['team-1', 'team-4'],
				['team-1', 'team-2', 'team-4'],
				['team-1', 'team-3', 'team-4'],
				['team-1', 'team-2', 'team-3', 'team-4'],
				['team-1', 'team-3', 'team-2', 'team-4'],
			]);

			expect(view.getAllPaths('team-1', 'team-2', 3)).to.deep.equal([
				['team-1', 'team-2'],
				['team-1', 'team-3', 'team-2'],
				['team-1', 'team-4', 'team-2'],
			]);

			expect(view.getAllPaths('team-1', 'team-2', 2)).to.deep.equal([
				['team-1', 'team-2'],
			]);
		});
	});

	describe('::sumEdges', function () {
		it('should work on a basic example', function () {
			const view = new GraphView();

			view.addGraph(week1);
			view.addGraph(week2);
			view.addGraph(week3);

			view.render({root: view.getConnected('team-1')});

			expect(
				view.sumEdges(
					[['team-1', 'team-2', 'team-3', 'team-4']],
					(from, to) =>
						<number>from.get('score') - <number>to.get('score'),
				),
			).to.deep.equal([4]);

			expect(
				view.sumEdges(
					[['team-1', 'team-2', 'team-4']],
					(from, to) =>
						<number>from.get('score') - <number>to.get('score'),
				),
			).to.deep.equal([-3]);

			expect(
				view.sumEdges(
					[['team-1', 'team-4']],
					(from, to) =>
						<number>from.get('score') - <number>to.get('score'),
				),
			).to.deep.equal([4]);
		});
	});

	describe('::toJSON', function () {
		it('should properly format - two levels', function () {
			const view = new GraphView();

			view.addGraph(week1);
			view.addGraph(week2);

			view.render({root: 'team-1'});

			expect(view.toJSON()).to.deep.equal({
				'team-1': {
					'team-2': {
						'1-1': {
							score: 7,
						},
					},
					'team-3': {
						'2-1': {
							score: 7,
						},
					},
				},
				'team-2': {
					'team-1': {
						'1-1': {
							score: 3,
						},
					},
					'team-4': {
						'2-2': {
							score: 10,
						},
					},
				},
				'team-3': {
					'team-1': {
						'2-1': {
							score: 3,
						},
					},
				},
				'team-4': {
					'team-2': {
						'2-2': {
							score: 17,
						},
					},
				},
			});
		});

		it('should properly format', function () {
			const view = new GraphView();

			view.addGraph(week1);
			view.addGraph(week2);
			view.addGraph(week3);

			view.render({root: 'team-1'});

			expect(view.toJSON()).to.deep.equal({
				'team-1': {
					'team-2': {
						'1-1': {
							score: 7,
						},
					},
					'team-3': {
						'2-1': {
							score: 7,
						},
					},
					'team-4': {
						'3-1': {
							score: 7,
						},
					},
				},
				'team-2': {
					'team-1': {
						'1-1': {
							score: 3,
						},
					},
					'team-4': {
						'2-2': {
							score: 10,
						},
					},
					'team-3': {
						'3-2': {
							score: 17,
						},
					},
				},
				'team-3': {
					'team-1': {
						'2-1': {
							score: 3,
						},
					},
					'team-2': {
						'3-2': {
							score: 10,
						},
					},
				},
				'team-4': {
					'team-2': {
						'2-2': {
							score: 17,
						},
					},
					'team-1': {
						'3-1': {
							score: 3,
						},
					},
				},
			});
		});

		it('should properly format - with list for root', function () {
			const view = new GraphView();

			view.addGraph(week1);
			view.addGraph(week2);
			view.addGraph(week3);

			view.render({root: view.getConnected('team-1')});

			expect(view.toJSON()).to.deep.equal({
				'team-1': {
					'team-2': {
						'1-1': {
							score: 7,
						},
					},
					'team-3': {
						'2-1': {
							score: 7,
						},
					},
					'team-4': {
						'3-1': {
							score: 7,
						},
					},
				},
				'team-2': {
					'team-1': {
						'1-1': {
							score: 3,
						},
					},
					'team-4': {
						'2-2': {
							score: 10,
						},
					},
					'team-3': {
						'3-2': {
							score: 17,
						},
					},
				},
				'team-3': {
					'team-4': {
						'1-2': {
							score: 10,
						},
					},
					'team-1': {
						'2-1': {
							score: 3,
						},
					},
					'team-2': {
						'3-2': {
							score: 10,
						},
					},
				},
				'team-4': {
					'team-3': {
						'1-2': {
							score: 17,
						},
					},
					'team-2': {
						'2-2': {
							score: 17,
						},
					},
					'team-1': {
						'3-1': {
							score: 3,
						},
					},
				},
			});
		});
	});

	describe('::toMatrix', function () {
		it('should properly format', function () {
			const view = new GraphView();

			view.addGraph(week1);
			view.addGraph(week2);
			view.addGraph(week3);

			view.render({root: 'team-1'});

			expect(
				view.toMatrix((inputs: Features[]) =>
					inputs.reduce(
						(agg, input) => agg + <number>input.get('score'),
						0,
					),
				),
			).to.deep.equal([
				[0, 7, 7, 7],
				[3, 0, 17, 10],
				[3, 10, 0, 0],
				[3, 17, 0, 0],
			]);
		});
	});
});
