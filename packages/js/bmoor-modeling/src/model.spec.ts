import {expect} from 'chai';

import {validations} from '@bmoor/schema';

import {ModelContext} from './model/context';
import {converter} from './converter';
import {Hooker, hooks} from './hooker';
import {Model} from './model';
import {types} from './typing';

describe('@bmoor-modeling::Model', function () {
	let ctx;

	beforeEach(function () {
		ctx = new ModelContext(types, validations, hooks, converter);
	});

	describe('::inflate', function () {
		it('should correctly transform', function () {
			const model = new Model(ctx, {
				reference: 'junk',
				structure: {
					foo: {
						bar: 'f-1',
						bar2: 'f-2',
					},
				},
				external: {
					hello: {
						world: 'f-1',
					},
					einsZwei: 'f-2',
				},
				info: {
					'f-1': {
						type: 'string',
					},
					'f-2': {
						type: 'number',
					},
				},
			});

			expect(
				model.inflate({
					foo: {bar: 1, bar2: 2},
				}),
			).to.deep.equal({
				hello: {
					world: 1,
				},
				einsZwei: 2,
			});

			expect(
				model.fromInflated({
					hello: {
						world: 1,
					},
					einsZwei: 2,
				}),
			).to.deep.equal({
				foo: {bar: 1, bar2: 2},
			});
		});

		it('should properly convert', function () {
			const model = new Model(ctx, {
				reference: 'junk',
				structure: {
					helloWorld: 'f-1',
					foo: {
						bar: 'f-2',
					},
				},
				external: {
					hello: {
						world: 'f-1',
					},
					einsZwei: 'f-2',
				},
				info: {
					'f-1': {
						type: 'string',
						external: 'json',
					},
					'f-2': {
						type: 'number',
					},
				},
			});

			expect(
				model.inflate({
					helloWorld: '{"eins":1,"zwei":2}',
					foo: {
						bar: 2,
					},
				}),
			).to.deep.equal({
				hello: {
					world: {
						eins: 1,
						zwei: 2,
					},
				},
				einsZwei: 2,
			});

			expect(
				model.fromInflated({
					hello: {
						world: {
							eins: 1,
							zwei: 2,
						},
					},
					einsZwei: 2,
				}),
			).to.deep.equal({
				helloWorld: '{"eins":1,"zwei":2}',
				foo: {
					bar: 2,
				},
			});
		});
	});

	describe('::deflate', function () {
		it('should correctly transform', function () {
			const model = new Model(ctx, {
				reference: 'junk',
				structure: {
					foo: {
						bar: 'f-1',
						bar2: 'f-2',
					},
				},
				storage: {
					hello: {
						world: 'f-1',
					},
					einsZwei: 'f-2',
				},
				info: {
					'f-1': {
						type: 'string',
					},
					'f-2': {
						type: 'number',
					},
				},
			});

			expect(
				model.deflate({
					foo: {bar: 1, bar2: 2},
				}),
			).to.deep.equal({
				hello: {
					world: 1,
				},
				einsZwei: 2,
			});

			expect(
				model.fromDeflated({
					hello: {
						world: 1,
					},
					einsZwei: 2,
				}),
			).to.deep.equal({
				foo: {bar: 1, bar2: 2},
			});
		});

		it('should correctly convert', function () {
			const model = new Model(ctx, {
				reference: 'junk',
				structure: {
					helloWorld: 'f-1',
					foo: {
						bar: 'f-2',
					},
				},
				storage: {
					hello: {
						world: 'f-1',
					},
					einsZwei: 'f-2',
				},
				info: {
					'f-1': {
						type: 'string',
						storage: 'json',
					},
					'f-2': {
						type: 'number',
					},
				},
			});

			expect(
				model.deflate({
					helloWorld: '{"eins":1,"zwei":2}',
					foo: {
						bar: 2,
					},
				}),
			).to.deep.equal({
				hello: {
					world: {
						eins: 1,
						zwei: 2,
					},
				},
				einsZwei: 2,
			});

			expect(
				model.fromDeflated({
					hello: {
						world: {
							eins: 1,
							zwei: 2,
						},
					},
					einsZwei: 2,
				}),
			).to.deep.equal({
				helloWorld: '{"eins":1,"zwei":2}',
				foo: {
					bar: 2,
				},
			});
		});
	});

	describe('hooks', function () {
		describe('with function', function () {
			it('should work', function () {
				const model = new Model(ctx, {
					reference: 'junk',
					structure: {
						foo: {
							bar: 'f-1',
							bar2: 'f-2',
						},
					},
					info: {
						'f-1': {
							type: 'string',
						},
						'f-2': {
							type: 'number',
						},
					},
					hooks: {
						'f-1': {
							onCreate: function (value) {
								expect(value).to.equal('eins');
								return 'create-1';
							},
							onRead: function (value) {
								expect(value).to.equal('create-1');
								return 'read-1';
							},
							onUpdate: function (value) {
								expect(value).to.equal('read-1');
								return 'update-1';
							},
							onInflate: function (value) {
								expect(value).to.equal('update-1');
								return 'inflate-1';
							},
							onDeflate: function (value) {
								expect(value).to.equal('inflate-1');
								return 'deflate-1';
							},
						},
						'f-2': {
							onRead: function (value) {
								expect(value).to.equal(1);
								return 102;
							},
						},
					},
				});

				const datum = {
					foo: {
						bar: 'eins',
						bar2: 1,
					},
				};

				expect(model.onCreate(datum)).to.deep.equal({
					foo: {
						bar: 'create-1',
						bar2: 1,
					},
				});

				expect(model.onRead(datum)).to.deep.equal({
					foo: {
						bar: 'read-1',
						bar2: 102,
					},
				});

				expect(model.onUpdate(datum)).to.deep.equal({
					foo: {
						bar: 'update-1',
						bar2: 102,
					},
				});

				expect(model.onInflate(datum)).to.deep.equal({
					foo: {
						bar: 'inflate-1',
						bar2: 102,
					},
				});

				expect(model.onDeflate(datum)).to.deep.equal({
					foo: {
						bar: 'deflate-1',
						bar2: 102,
					},
				});
			});
		});

		describe('with hook registry', function () {
			it('should work', function () {
				const model = new Model(ctx, {
					reference: 'junk',
					structure: {
						foo: {
							bar: 'f-1',
							bar2: 'f-2',
						},
					},
					info: {
						'f-1': {
							type: 'string',
						},
						'f-2': {
							type: 'number',
						},
					},
					hooks: {
						'f-1': 'eins',
						'f-2': 'zwei',
					},
				});

				ctx.setHooker(
					new Hooker({
						eins: {
							onCreate: function (value) {
								expect(value).to.equal('eins');
								return 'create-1';
							},
							onRead: function (value) {
								expect(value).to.equal('create-1');
								return 'read-1';
							},
							onUpdate: function (value) {
								expect(value).to.equal('read-1');
								return 'update-1';
							},
							onInflate: function (value) {
								expect(value).to.equal('update-1');
								return 'inflate-1';
							},
							onDeflate: function (value) {
								expect(value).to.equal('inflate-1');
								return 'deflate-1';
							},
						},
						zwei: {
							onRead: function (value) {
								expect(value).to.equal(1);
								return 102;
							},
						},
					}),
				);

				const datum = {
					foo: {
						bar: 'eins',
						bar2: 1,
					},
				};

				expect(model.onCreate(datum)).to.deep.equal({
					foo: {
						bar: 'create-1',
						bar2: 1,
					},
				});

				expect(model.onRead(datum)).to.deep.equal({
					foo: {
						bar: 'read-1',
						bar2: 102,
					},
				});

				expect(model.onUpdate(datum)).to.deep.equal({
					foo: {
						bar: 'update-1',
						bar2: 102,
					},
				});

				expect(model.onInflate(datum)).to.deep.equal({
					foo: {
						bar: 'inflate-1',
						bar2: 102,
					},
				});

				expect(model.onDeflate(datum)).to.deep.equal({
					foo: {
						bar: 'deflate-1',
						bar2: 102,
					},
				});
			});
		});
	});
});
