import {expect} from 'chai';

import {validations} from '@bmoor/schema';

import {Hooker, hooks} from './hooker';
import {Model} from './model';
import {Nexus} from './nexus';
import {types} from './typing';
import {TypingJSON} from './typing.interface';

describe('@bmoor-modeling::Model', function () {
	describe('::inflate', function () {
		it('should correctly create a typescript format', function () {
			const model = new Model({
				reference: 'junk',
				structure: {
					foo: {
						bar: 'f-1',
						bar2: 'f-2',
					},
				},
				inflate: {
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
	});

	describe('::deflate', function () {
		it('should correctly create a typescript format', function () {
			const model = new Model({
				reference: 'junk',
				structure: {
					foo: {
						bar: 'f-1',
						bar2: 'f-2',
					},
				},
				deflate: {
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
	});

	describe('hooks', function () {
		const nexus = new Nexus<TypingJSON>(types, validations, hooks);

		describe('with function', function () {
			it('should work', function () {
				const model = new Model({
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
				const model = new Model({
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

				model.setContext(nexus);

				nexus.setHooker(
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
