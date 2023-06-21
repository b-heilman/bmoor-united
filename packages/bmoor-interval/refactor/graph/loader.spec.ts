import {expect} from 'chai';

import {Graph} from '../../src/graph';
import {GraphLoader} from './loader';

describe('@bmoor-graph::GraphLoader', function () {
	describe('::load', function () {
		it('should properly load a document to a graph structure', function () {
			const graph = new Graph();
			const loader = new GraphLoader(graph, {
				nodes: [
					{
						type: 'team',
						reference: {
							mount: 't',
						},
					},
					{
						type: 'position',
						reference: function (row) {
							return row.t + ':' + row.p;
						},
					},
					{
						type: 'player',
						reference: {
							mount: 'name',
						},
						normalizer: (row) => {
							return {
								passing: parseInt(<string>row.passing),
								attempts: parseInt(<string>row.attempts),
								complete: parseInt(<string>row.complete),
							};
						},
					},
				],
				event: {
					reference: {
						mount: 'game',
					},
					interval: {
						mount: 'week',
						normalizer: (order: string | number) => {
							return parseInt(<string>order);
						},
					},
					label: {
						mount: 'date',
					},
				},
			});

			loader.load([
				{
					t: 'eagles',
					p: 'qb',
					name: 'Hurts-so-good',
					game: 'eag-v-chef',
					week: '1',
					date: '1/1',
					passing: 12,
					attempts: 34,
					complete: 56,
				},
				{
					t: 'chefs',
					p: 'qb',
					name: 'Ma-Homies',
					game: 'eag-v-chef',
					week: '1',
					date: '1/1',
					passing: 1,
					attempts: 6,
					complete: 3,
				},
				{
					t: 'eagles',
					p: 'def',
					name: 'Good-Defense',
					game: 'eag-v-chef',
					week: '1',
					date: '1/1',
					passing: 12,
					attempts: 34,
					complete: 56,
				},
				{
					t: 'chefs',
					p: 'def',
					name: 'Bad-Defense',
					game: 'eag-v-chef',
					week: '1',
					date: '1/1',
					passing: 1,
					attempts: 6,
					complete: 3,
				},
				{
					t: 'eagles',
					p: 'qb',
					name: 'Hurts-so-good',
					game: 'eag-v-9ers',
					week: '2',
					date: '1/12',
					passing: 120,
					attempts: 40,
					complete: 30,
				},
			]);

			expect(graph.toJSON()).to.deep.equal({
				nodes: [
					{
						ref: 'chefs',
						tags: [],
						type: 'team',
						intervals: [{intervalRef: 1, eventRef: 'eag-v-chef'}],
					},
					{
						ref: 'eagles',
						tags: [],
						type: 'team',
						intervals: [
							{intervalRef: 1, eventRef: 'eag-v-chef'},
							{intervalRef: 2, eventRef: 'eag-v-9ers'},
						],
					},
					{
						ref: 'chefs:def',
						tags: [],
						type: 'position',
						intervals: [
							{intervalRef: 1, parentRef: 'chefs', eventRef: 'eag-v-chef'},
						],
					},
					{
						ref: 'chefs:qb',
						tags: [],
						type: 'position',
						intervals: [
							{intervalRef: 1, parentRef: 'chefs', eventRef: 'eag-v-chef'},
						],
					},
					{
						ref: 'eagles:def',
						tags: [],
						type: 'position',
						intervals: [
							{
								intervalRef: 1,
								parentRef: 'eagles',
								eventRef: 'eag-v-chef',
							},
						],
					},
					{
						ref: 'eagles:qb',
						tags: [],
						type: 'position',
						intervals: [
							{
								intervalRef: 1,
								parentRef: 'eagles',
								eventRef: 'eag-v-chef',
							},
							{
								intervalRef: 2,
								parentRef: 'eagles',
								eventRef: 'eag-v-9ers',
							},
						],
					},
					{
						ref: 'Bad-Defense',
						tags: [],
						type: 'player',
						intervals: [
							{
								intervalRef: 1,
								parentRef: 'chefs:def',
								eventRef: 'eag-v-chef',
								edge: {passing: 1, attempts: 6, complete: 3},
							},
						],
					},
					{
						ref: 'Good-Defense',
						tags: [],
						type: 'player',
						intervals: [
							{
								intervalRef: 1,
								parentRef: 'eagles:def',
								eventRef: 'eag-v-chef',
								edge: {passing: 12, attempts: 34, complete: 56},
							},
						],
					},
					{
						ref: 'Hurts-so-good',
						tags: [],
						type: 'player',
						intervals: [
							{
								intervalRef: 1,
								parentRef: 'eagles:qb',
								eventRef: 'eag-v-chef',
								edge: {passing: 12, attempts: 34, complete: 56},
							},
							{
								intervalRef: 2,
								parentRef: 'eagles:qb',
								eventRef: 'eag-v-9ers',
								edge: {passing: 120, attempts: 40, complete: 30},
							},
						],
					},
					{
						ref: 'Ma-Homies',
						tags: [],
						type: 'player',
						intervals: [
							{
								intervalRef: 1,
								parentRef: 'chefs:qb',
								eventRef: 'eag-v-chef',
								edge: {passing: 1, attempts: 6, complete: 3},
							},
						],
					},
				],
				events: [
					{ref: 'eag-v-chef', intervalRef: 1, weights: {}},
					{ref: 'eag-v-9ers', intervalRef: 2, weights: {}},
				],
				intervals: [
					{
						tags: [],
						ref: 1,
						label: '1/1',
					},
					{
						tags: [],
						ref: 2,
						label: '1/12',
					},
				],
			});
		});
	});

	describe('::fromArray', function () {
		it('should properly load a document to a graph structure', function () {
			const graph = new Graph();
			const loader = new GraphLoader(graph, {
				nodes: [
					{
						type: 'team',
						reference: {
							mount: 't',
						},
					},
					{
						type: 'position',
						reference: function (row) {
							return row.t + ':' + row.p;
						},
					},
					{
						type: 'player',
						reference: {
							mount: 'name',
						},
						normalizer: (row) => {
							return {
								passing: parseInt(<string>row.passing),
								attempts: parseInt(<string>row.attempts),
								complete: parseInt(<string>row.complete),
							};
						},
					},
				],
				event: {
					reference: {
						mount: 'game',
					},
					interval: {
						mount: 'week',
						normalizer: (order: string | number) => {
							return parseInt(<string>order);
						},
					},
					label: {
						mount: 'date',
					},
				},
			});

			loader.fromArray([
				[
					't',
					'p',
					'name',
					'game',
					'week',
					'date',
					'passing',
					'attempts',
					'complete',
				],
				[
					'eagles',
					'qb',
					'Hurts-so-good',
					'eag-v-chef',
					'1',
					'1/1',
					12,
					34,
					56,
				],
				['chefs', 'qb', 'Ma-Homies', 'eag-v-chef', '2', '1/1', 1, 6, 3],
				[
					'eagles',
					'def',
					'Good-Defense',
					'eag-v-chef',
					'1',
					'1/1',
					12,
					34,
					56,
				],
				['chefs', 'def', 'Bad-Defense', 'eag-v-chef', '2', '1/1', 1, 6, 3],
				[
					'eagles',
					'qb',
					'Hurts-so-good',
					'eag-v-9ers',
					'2',
					'1/12',
					120,
					40,
					30,
				],
			]);

			expect(graph.toJSON()).to.deep.equal({
				nodes: [
					{
						ref: 'chefs',
						tags: [],
						type: 'team',
						intervals: [{intervalRef: 1, eventRef: 'eag-v-chef'}],
					},
					{
						ref: 'eagles',
						tags: [],
						type: 'team',
						intervals: [
							{intervalRef: 1, eventRef: 'eag-v-chef'},
							{intervalRef: 2, eventRef: 'eag-v-9ers'},
						],
					},
					{
						ref: 'chefs:def',
						tags: [],
						type: 'position',
						intervals: [
							{intervalRef: 1, parentRef: 'chefs', eventRef: 'eag-v-chef'},
						],
					},
					{
						ref: 'chefs:qb',
						tags: [],
						type: 'position',
						intervals: [
							{intervalRef: 1, parentRef: 'chefs', eventRef: 'eag-v-chef'},
						],
					},
					{
						ref: 'eagles:def',
						tags: [],
						type: 'position',
						intervals: [
							{
								intervalRef: 1,
								parentRef: 'eagles',
								eventRef: 'eag-v-chef',
							},
						],
					},
					{
						ref: 'eagles:qb',
						tags: [],
						type: 'position',
						intervals: [
							{
								intervalRef: 1,
								parentRef: 'eagles',
								eventRef: 'eag-v-chef',
							},
							{
								intervalRef: 2,
								parentRef: 'eagles',
								eventRef: 'eag-v-9ers',
							},
						],
					},
					{
						ref: 'Bad-Defense',
						tags: [],
						type: 'player',
						intervals: [
							{
								intervalRef: 1,
								parentRef: 'chefs:def',
								eventRef: 'eag-v-chef',
								edge: {passing: 1, attempts: 6, complete: 3},
							},
						],
					},
					{
						ref: 'Good-Defense',
						tags: [],
						type: 'player',
						intervals: [
							{
								intervalRef: 1,
								parentRef: 'eagles:def',
								eventRef: 'eag-v-chef',
								edge: {passing: 12, attempts: 34, complete: 56},
							},
						],
					},
					{
						ref: 'Hurts-so-good',
						tags: [],
						type: 'player',
						intervals: [
							{
								intervalRef: 1,
								parentRef: 'eagles:qb',
								eventRef: 'eag-v-chef',
								edge: {passing: 12, attempts: 34, complete: 56},
							},
							{
								intervalRef: 2,
								parentRef: 'eagles:qb',
								eventRef: 'eag-v-9ers',
								edge: {passing: 120, attempts: 40, complete: 30},
							},
						],
					},
					{
						ref: 'Ma-Homies',
						tags: [],
						type: 'player',
						intervals: [
							{
								intervalRef: 1,
								parentRef: 'chefs:qb',
								eventRef: 'eag-v-chef',
								edge: {passing: 1, attempts: 6, complete: 3},
							},
						],
					},
				],
				events: [
					{ref: 'eag-v-chef', intervalRef: 1, weights: {}},
					{ref: 'eag-v-9ers', intervalRef: 2, weights: {}},
				],
				intervals: [
					{ref: 1, tags: [], label: '1/1'},
					{ref: 2, tags: [], label: '1/12'},
				],
			});
		});

		it('should work with multiple intervals', function () {
			const graph = new Graph();
			const loader = new GraphLoader(graph, {
				nodes: [
					{
						type: 'team',
						reference: {
							mount: 't',
						},
					},
					{
						type: 'position',
						reference: function (row) {
							return row.t + ':' + row.p;
						},
					},
					{
						type: 'player',
						reference: {
							mount: 'name',
						},
						normalizer: (row) => {
							return {
								yards: parseInt(<string>row.yards),
								other: parseInt(<string>row.other),
							};
						},
					},
				],
				event: {
					reference: {
						mount: 'game',
					},
					interval: {
						mount: 'time',
					},
				},
			});

			loader.fromArray([
				['t', 'p', 'name', 'game', 'time', 'yards', 'other'],
				['team-1', 'qb', 'p-1-1', 'game-1', 1, 100, 112],
				['team-1', 'wr', 'p-1-2', 'game-1', 1, 101, 101],
				['team-2', 'qb', 'p-2-1', 'game-1', 1, 102, 103],
				['team-2', 'wr', 'p-2-2', 'game-1', 1, 103, 111],
				['team-3', 'qb', 'p-3-1', 'game-2', 1, 104, 100],
				['team-3', 'wr', 'p-3-2', 'game-2', 1, 105, 102],
				['team-4', 'qb', 'p-4-1', 'game-2', 1, 106, 115],
				['team-4', 'wr', 'p-4-2', 'game-2', 1, 107, 113],
				['team-1', 'qb', 'p-1-1', 'game-3', 2, 108, 104],
				['team-1', 'wr', 'p-1-2', 'game-3', 2, 109, 105],
				['team-3', 'qb', 'p-3-1', 'game-3', 2, 110, 110],
				['team-3', 'wr', 'p-3-2', 'game-3', 2, 111, 108],
				['team-4', 'qb', 'p-4-1', 'game-4', 2, 112, 107],
				['team-4', 'wr', 'p-4-2', 'game-4', 2, 113, 114],
				['team-2', 'qb', 'p-2-1', 'game-4', 2, 114, 109],
				['team-2', 'wr', 'p-2-2', 'game-4', 2, 115, 106],
			]);

			expect(graph.toJSON()).to.deep.equal({
				nodes: [
					{
						ref: 'team-1',
						tags: [],
						type: 'team',
						intervals: [
							{intervalRef: 1, eventRef: 'game-1'},
							{intervalRef: 2, eventRef: 'game-3'},
						],
					},
					{
						ref: 'team-2',
						tags: [],
						type: 'team',
						intervals: [
							{intervalRef: 1, eventRef: 'game-1'},
							{intervalRef: 2, eventRef: 'game-4'},
						],
					},
					{
						ref: 'team-3',
						tags: [],
						type: 'team',
						intervals: [
							{intervalRef: 1, eventRef: 'game-2'},
							{intervalRef: 2, eventRef: 'game-3'},
						],
					},
					{
						ref: 'team-4',
						tags: [],
						type: 'team',
						intervals: [
							{intervalRef: 1, eventRef: 'game-2'},
							{intervalRef: 2, eventRef: 'game-4'},
						],
					},
					{
						ref: 'team-1:qb',
						tags: [],
						type: 'position',
						intervals: [
							{intervalRef: 1, parentRef: 'team-1', eventRef: 'game-1'},
							{intervalRef: 2, parentRef: 'team-1', eventRef: 'game-3'},
						],
					},
					{
						ref: 'team-1:wr',
						tags: [],
						type: 'position',
						intervals: [
							{intervalRef: 1, parentRef: 'team-1', eventRef: 'game-1'},
							{intervalRef: 2, parentRef: 'team-1', eventRef: 'game-3'},
						],
					},
					{
						ref: 'team-2:qb',
						tags: [],
						type: 'position',
						intervals: [
							{intervalRef: 1, parentRef: 'team-2', eventRef: 'game-1'},
							{intervalRef: 2, parentRef: 'team-2', eventRef: 'game-4'},
						],
					},
					{
						ref: 'team-2:wr',
						tags: [],
						type: 'position',
						intervals: [
							{intervalRef: 1, parentRef: 'team-2', eventRef: 'game-1'},
							{intervalRef: 2, parentRef: 'team-2', eventRef: 'game-4'},
						],
					},
					{
						ref: 'team-3:qb',
						tags: [],
						type: 'position',
						intervals: [
							{intervalRef: 1, parentRef: 'team-3', eventRef: 'game-2'},
							{intervalRef: 2, parentRef: 'team-3', eventRef: 'game-3'},
						],
					},
					{
						ref: 'team-3:wr',
						tags: [],
						type: 'position',
						intervals: [
							{intervalRef: 1, parentRef: 'team-3', eventRef: 'game-2'},
							{intervalRef: 2, parentRef: 'team-3', eventRef: 'game-3'},
						],
					},
					{
						ref: 'team-4:qb',
						tags: [],
						type: 'position',
						intervals: [
							{intervalRef: 1, parentRef: 'team-4', eventRef: 'game-2'},
							{intervalRef: 2, parentRef: 'team-4', eventRef: 'game-4'},
						],
					},
					{
						ref: 'team-4:wr',
						tags: [],
						type: 'position',
						intervals: [
							{intervalRef: 1, parentRef: 'team-4', eventRef: 'game-2'},
							{intervalRef: 2, parentRef: 'team-4', eventRef: 'game-4'},
						],
					},
					{
						ref: 'p-1-1',
						tags: [],
						type: 'player',
						intervals: [
							{
								intervalRef: 1,
								parentRef: 'team-1:qb',
								eventRef: 'game-1',
								edge: {yards: 100, other: 112},
							},
							{
								intervalRef: 2,
								parentRef: 'team-1:qb',
								eventRef: 'game-3',
								edge: {yards: 108, other: 104},
							},
						],
					},
					{
						ref: 'p-1-2',
						tags: [],
						type: 'player',
						intervals: [
							{
								intervalRef: 1,
								parentRef: 'team-1:wr',
								eventRef: 'game-1',
								edge: {yards: 101, other: 101},
							},
							{
								intervalRef: 2,
								parentRef: 'team-1:wr',
								eventRef: 'game-3',
								edge: {yards: 109, other: 105},
							},
						],
					},
					{
						ref: 'p-2-1',
						tags: [],
						type: 'player',
						intervals: [
							{
								intervalRef: 1,
								parentRef: 'team-2:qb',
								eventRef: 'game-1',
								edge: {yards: 102, other: 103},
							},
							{
								intervalRef: 2,
								parentRef: 'team-2:qb',
								eventRef: 'game-4',
								edge: {yards: 114, other: 109},
							},
						],
					},
					{
						ref: 'p-2-2',
						tags: [],
						type: 'player',
						intervals: [
							{
								intervalRef: 1,
								parentRef: 'team-2:wr',
								eventRef: 'game-1',
								edge: {yards: 103, other: 111},
							},
							{
								intervalRef: 2,
								parentRef: 'team-2:wr',
								eventRef: 'game-4',
								edge: {yards: 115, other: 106},
							},
						],
					},
					{
						ref: 'p-3-1',
						tags: [],
						type: 'player',
						intervals: [
							{
								intervalRef: 1,
								parentRef: 'team-3:qb',
								eventRef: 'game-2',
								edge: {yards: 104, other: 100},
							},
							{
								intervalRef: 2,
								parentRef: 'team-3:qb',
								eventRef: 'game-3',
								edge: {yards: 110, other: 110},
							},
						],
					},
					{
						ref: 'p-3-2',
						tags: [],
						type: 'player',
						intervals: [
							{
								intervalRef: 1,
								parentRef: 'team-3:wr',
								eventRef: 'game-2',
								edge: {yards: 105, other: 102},
							},
							{
								intervalRef: 2,
								parentRef: 'team-3:wr',
								eventRef: 'game-3',
								edge: {yards: 111, other: 108},
							},
						],
					},
					{
						ref: 'p-4-1',
						tags: [],
						type: 'player',
						intervals: [
							{
								intervalRef: 1,
								parentRef: 'team-4:qb',
								eventRef: 'game-2',
								edge: {yards: 106, other: 115},
							},
							{
								intervalRef: 2,
								parentRef: 'team-4:qb',
								eventRef: 'game-4',
								edge: {yards: 112, other: 107},
							},
						],
					},
					{
						ref: 'p-4-2',
						tags: [],
						type: 'player',
						intervals: [
							{
								intervalRef: 1,
								parentRef: 'team-4:wr',
								eventRef: 'game-2',
								edge: {yards: 107, other: 113},
							},
							{
								intervalRef: 2,
								parentRef: 'team-4:wr',
								eventRef: 'game-4',
								edge: {yards: 113, other: 114},
							},
						],
					},
				],
				events: [
					{ref: 'game-1', intervalRef: 1, weights: {}},
					{ref: 'game-2', intervalRef: 1, weights: {}},
					{ref: 'game-3', intervalRef: 2, weights: {}},
					{ref: 'game-4', intervalRef: 2, weights: {}},
				],
				intervals: [
					{ref: 1, tags: [], label: 1},
					{ref: 2, tags: [], label: 2},
				],
			});
		});

		it('should work with multiple loaders', function () {
			const graph = new Graph();

			new GraphLoader(graph, {
				nodes: [
					{
						type: 'team',
						reference: {
							mount: 't',
						},
					},
					{
						type: 'position',
						reference: function (row) {
							return row.t + ':' + row.p;
						},
					},
					{
						type: 'player',
						reference: {
							mount: 'name',
						},
						tag: {
							mount: 'p',
						},
						normalizer: (row) => {
							return {
								yards: parseInt(<string>row.yards),
								other: parseInt(<string>row.other),
							};
						},
					},
				],
				event: {
					reference: {
						mount: 'game',
					},
					interval: {
						mount: 'time',
					},
					tags: (row) => {
						return [<string>row.season];
					},
				},
			}).fromArray([
				['t', 'p', 'name', 'game', 'time', 'yards', 'other', 'season'],
				['team-1', 'qb', 'p-1-1', 'game-1', 1, 100, 112, 2020],
				['team-1', 'wr', 'p-1-2', 'game-1', 1, 101, 101, 2020],
				['team-2', 'qb', 'p-2-1', 'game-1', 1, 102, 103, 2020],
				['team-2', 'wr', 'p-2-2', 'game-1', 1, 103, 111, 2020],
			]);

			new GraphLoader(graph, {
				split: (row) => {
					return [
						{
							t: row.winner,
							score: row['winner-score'],
							winner: 1,
						},
						{
							t: row.loser,
							score: row['loser-score'],
							winner: 0,
						},
					];
				},
				nodes: [
					{
						type: 'team',
						reference: {
							mount: 't',
						},
						tag: {
							mount: '',
						},
						normalizer: (row) => {
							return {
								score: parseInt(<string>row.score),
								winner: parseInt(<string>row.winner),
							};
						},
					},
				],
				event: {
					reference: {
						mount: 'game',
					},
					interval: {
						mount: 'time',
					},
					normalizer: (row) => {
						return {
							weather: <number>row.weather,
						};
					},
				},
			}).fromArray([
				[
					'game',
					'time',
					'weather',
					'winner',
					'loser',
					'winner-score',
					'loser-score',
				],
				['game-1', 1, 3, 'team-1', 'team-2', 24, 12],
				['game-2', 2, 4, 'team-2', 'team-1', 12, 7],
			]);

			expect(graph.toJSON()).to.deep.equal({
				nodes: [
					{
						ref: 'team-1',
						tags: [],
						type: 'team',
						intervals: [
							{
								intervalRef: 1,
								eventRef: 'game-1',
								edge: {score: 24, winner: 1},
							},
							{
								intervalRef: 2,
								eventRef: 'game-2',
								edge: {score: 7, winner: 0},
							},
						],
					},
					{
						ref: 'team-2',
						tags: [],
						type: 'team',
						intervals: [
							{
								intervalRef: 1,
								eventRef: 'game-1',
								edge: {score: 12, winner: 0},
							},
							{
								intervalRef: 2,
								eventRef: 'game-2',
								edge: {score: 12, winner: 1},
							},
						],
					},
					{
						ref: 'team-1:qb',
						tags: [],
						type: 'position',
						intervals: [
							{intervalRef: 1, parentRef: 'team-1', eventRef: 'game-1'},
						],
					},
					{
						ref: 'team-1:wr',
						tags: [],
						type: 'position',
						intervals: [
							{intervalRef: 1, parentRef: 'team-1', eventRef: 'game-1'},
						],
					},
					{
						ref: 'team-2:qb',
						tags: [],
						type: 'position',
						intervals: [
							{intervalRef: 1, parentRef: 'team-2', eventRef: 'game-1'},
						],
					},
					{
						ref: 'team-2:wr',
						tags: [],
						type: 'position',
						intervals: [
							{intervalRef: 1, parentRef: 'team-2', eventRef: 'game-1'},
						],
					},
					{
						ref: 'p-1-1',
						tags: ['qb'],
						type: 'player',
						intervals: [
							{
								intervalRef: 1,
								parentRef: 'team-1:qb',
								eventRef: 'game-1',
								edge: {yards: 100, other: 112},
							},
						],
					},
					{
						ref: 'p-1-2',
						tags: ['wr'],
						type: 'player',
						intervals: [
							{
								intervalRef: 1,
								parentRef: 'team-1:wr',
								eventRef: 'game-1',
								edge: {yards: 101, other: 101},
							},
						],
					},
					{
						ref: 'p-2-1',
						tags: ['qb'],
						type: 'player',
						intervals: [
							{
								intervalRef: 1,
								parentRef: 'team-2:qb',
								eventRef: 'game-1',
								edge: {yards: 102, other: 103},
							},
						],
					},
					{
						ref: 'p-2-2',
						tags: ['wr'],
						type: 'player',
						intervals: [
							{
								intervalRef: 1,
								parentRef: 'team-2:wr',
								eventRef: 'game-1',
								edge: {yards: 103, other: 111},
							},
						],
					},
				],
				events: [
					{ref: 'game-1', intervalRef: 1, weights: {weather: 3}},
					{ref: 'game-2', intervalRef: 2, weights: {weather: 4}},
				],
				intervals: [
					{ref: 1, tags: [2020], label: 1},
					{ref: 2, tags: [], label: 2},
				],
			});
		});
	});
});
