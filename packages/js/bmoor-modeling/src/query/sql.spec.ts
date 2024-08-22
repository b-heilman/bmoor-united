import {expect} from 'chai';

import {
	prepareDelete,
	prepareInsert,
	prepareQuery,
	prepareUpdate,
} from './sql.js';

describe('src/connectors/sql.js', function () {
	describe('::prepareInsert', function () {
		it('should work', async function () {
			const stmt = prepareInsert({
				model: {
					name: 'model-1',
					fields: [
						{
							path: 'name',
						},
						{
							path: 'title',
						},
						{
							path: 'json',
						},
					],
				},
				params: [
					{
						name: 'v-1',
						title: 'v-2',
						json: 'v-3',
					},
				],
			});

			expect(stmt.sql.replace(/\s+/g, '')).to.deep.equal(
				`
				INSERT INTO model-1 (\`name\`, \`title\`, \`json\`)
				SET ?;
			`.replace(/\s+/g, ''),
			);

			expect(stmt.params).to.deep.equal([['v-1', 'v-2', 'v-3']]);
		});
	});

	describe('::prepareUpdate', function () {
		it('should work', async function () {
			const stmt = prepareUpdate({
				model: {
					name: 'model-1',
					fields: [
						{
							path: 'name',
						},
						{
							path: 'title',
						},
						{
							path: 'json',
						},
					],
				},
				params: [
					{
						name: 'v-1',
						title: 'v-2',
						json: 'v-3',
					},
				],
				where: {
					params: {
						ops: [
							{
								series: 'model-1',
								path: 'id',
								operator: 'eq',
								value: 'foo-bar',
							},
						],
					},
				},
			});

			expect(stmt.sql.replace(/\s+/g, '')).to.deep.equal(
				`
				UPDATE \`model-1\`
				SET ?
				WHERE \`model-1\`.\`id\`=?;
			`.replace(/\s+/g, ''),
			);

			expect(stmt.params).to.deep.equal([
				{name: 'v-1', title: 'v-2', json: 'v-3'},
				'foo-bar',
			]);
		});
	});

	describe('::prepareDelete', function () {
		it('should work', async function () {
			const stmt = prepareDelete({
				model: {
					name: 'model-1',
				},
				params: {
					ops: [
						{
							series: 'model-1',
							path: 'id',
							operator: 'eq',
							value: 'foo-bar',
						},
					],
				},
			});

			expect(stmt.sql.replace(/\s+/g, '')).to.deep.equal(
				`
				DELETE FROM \`model-1\`
				WHERE \`model-1\`.\`id\` = ?;
			`.replace(/\s+/g, ''),
			);

			expect(stmt.params).to.deep.equal(['foo-bar']);
		});
	});

	describe('::prepareQuery', function () {
		it('should translate a basic query', async function () {
			const stmt = prepareQuery({
				select: {
					models: [
						{
							name: 'model-1',
							fields: [
								{
									path: 'name',
								},
								{
									path: 'title',
								},
								{
									path: 'json',
								},
							],
						},
					],
				},
				params: {
					ops: [
						{
							series: 'model-1',
							path: 'id',
							operator: 'eq',
							value: 'foo-bar',
						},
					],
				},
			});

			expect(stmt.sql.replace(/\s+/g, '')).to.deep.equal(
				`
				SELECT \`model-1\`.\`name\`,\`model-1\`.\`title\`,\`model-1\`.\`json\`
				FROM \`model-1\` AS \`model-1\`
				WHERE \`model-1\`.\`id\`=?
			`.replace(/\s+/g, ''),
			);

			expect(stmt.params).to.deep.equal(['foo-bar']);
		});

		it('should handle a null query', async function () {
			const stmt = prepareQuery({
				select: {
					models: [
						{
							name: 'model-1',
							fields: [
								{
									path: 'name',
								},
								{
									path: 'title',
								},
								{
									path: 'json',
								},
							],
						},
					],
				},
			});

			expect(stmt.sql.replace(/\s+/g, '')).to.deep.equal(
				`
				SELECT \`model-1\`.\`name\`,\`model-1\`.\`title\`,\`model-1\`.\`json\`
				FROM \`model-1\` AS \`model-1\`
			`.replace(/\s+/g, ''),
			);

			expect(stmt.params).to.deep.equal([]);
		});

		it('should handle aliases', async function () {
			const stmt = prepareQuery({
				select: {
					models: [
						{
							name: 'model-1',
							fields: [
								{
									path: 'name',
									as: 'ref',
								},
								{
									path: 'title',
								},
								{
									path: 'json',
								},
							],
						},
					],
				},
			});

			expect(stmt.sql.replace(/\s+/g, '')).to.equal(
				`
				SELECT
					\`model-1\`.\`name\` AS \`ref\`,
					\`model-1\`.\`title\`,
					\`model-1\`.\`json\`
				FROM \`model-1\` AS \`model-1\`
			`.replace(/\s+/g, ''),
			);

			expect(stmt.params).to.deep.equal([]);
		});

		it('should translate a complex query', async function () {
			const stmt = prepareQuery({
				select: {
					models: [
						{
							name: 'foo-bar',
							series: 'test-item',
							fields: [
								{
									path: 'name',
									as: 'test-item_0',
								},
							],
						},
						{
							name: 'test-person',
							fields: [
								{
									path: 'name',
									as: 'test-person_1',
								},
							],
							joins: [
								{
									toSeries: 'test-item',
									mappings: [
										{
											from: 'itemId',
											to: 'id',
										},
									],
								},
							],
						},
						{
							name: 'test-category',
							fields: [
								{
									path: 'name',
								},
								{
									path: 'fooId',
								},
							],
							joins: [
								{
									optional: true,
									toSeries: 'test-item',
									mappings: [
										{
											from: 'itemId',
											to: 'id',
										},
									],
								},
							],
						},
					],
				},
				params: {
					ops: [
						{
							series: 'test-item',
							path: 'id',
							operator: 'eq',
							value: 1,
						},
						{
							series: 'test-person',
							path: 'foo',
							operator: 'eq',
							value: 'bar',
						},
					],
				},
			});

			expect(stmt.sql.replace(/\s+/g, '')).to.equal(
				`
				SELECT
					\`test-item\`.\`name\` AS \`test-item_0\`, 
					\`test-person\`.\`name\` AS \`test-person_1\`,
					\`test-category\`.\`name\`,
					\`test-category\`.\`fooId\`
				FROM
					\`foo-bar\` AS \`test-item\`
						INNER JOIN \`test-person\` AS \`test-person\`
							ON \`test-person\`.\`itemId\` = \`test-item\`.\`id\`
						LEFT JOIN \`test-category\` AS \`test-category\`
							ON \`test-category\`.\`itemId\` = \`test-item\`.\`id\`
				WHERE \`test-item\`.\`id\`=?
					AND \`test-person\`.\`foo\`=?
			`.replace(/\s+/g, ''),
			);

			expect(stmt.params).to.deep.equal([1, 'bar']);
		});
	});
});
