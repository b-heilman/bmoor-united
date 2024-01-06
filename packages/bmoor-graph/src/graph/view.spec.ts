import {expect} from 'chai';

import {Context} from '@bmoor/context';

import {Graph} from '../graph';
import {GraphLoader} from './loader';
import {GraphView} from './view';

describe('@bmoor/graph::view', function () {
	let ctx: Context = null;
	let week1: Graph = null;
	let week2: Graph = null;
	let week3: Graph = null;
	let loader: GraphLoader = null;

	beforeEach(function () {
		ctx = new Context({});
		week1 = new Graph();
		week2 = new Graph();
		week3 = new Graph();
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
	});

	it('should properly load a document to a graph structure', function () {
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

		const view = new GraphView(week1.getNode('team-1'));

		view.addGraph(week1);
		view.addGraph(week2);
		view.addGraph(week3);

		console.log(JSON.stringify(view.toJSON()));
		expect(view.toJSON()).to.deep.equal({
			'team-1': {
				'1-1': {'team-1': {score: 7}, 'team-2': {score: 7}},
				'2-1': {'team-1': {score: 7}, 'team-3': {score: 7}},
				'3-1': {'team-1': {score: 7}, 'team-4': {score: 7}},
			},
			'team-2': {
				'2-2': {'team-2': {score: 10}, 'team-4': {score: 10}},
				'3-2': {'team-3': {score: 17}, 'team-2': {score: 17}},
			},
			'team-3': {'3-2': {'team-3': {score: 10}, 'team-2': {score: 10}}},
			'team-4': {'3-1': {'team-1': {score: 3}, 'team-4': {score: 3}}},
		});
	});
});
