import {expect} from 'chai';

import {Model} from './model';
import {ModelControllerInterface} from './model/controller.interface';

import {ModelAdapter} from './model.interface';

import {InternalDatum, ExternalDatum} from './datum.interface';

import {factory} from './model/field/set';

describe('@bmoor-modeling', function () {
	let controller: ModelControllerInterface<ExternalDatum> = null;
	let adapter: ModelAdapter<InternalDatum> = null;

	beforeEach(function () {
		controller = {
			async canRead(datums) {
				return datums;
			},
			async canCreate(datums) {
				return datums;
			},
			async canUpdate(datums) {
				return datums;
			}
		};
		adapter = {
			async create(content) {
				return content;
			},
			async read(content) {
				return content;
			},
			async update(content) {
				return content;
			}
		};
	});

	describe('actions', function () {
		describe('create', function () {
			it('should work', function () {
				const model = new Model({
					controller,
					adapter,
					fields: factory(
						{
							external: 'f1',
							onCreate(datum) {
								datum.v = 1;
							}
						},
						{
							external: 'f2',
							onCreate(datum, setter, getter) {
								setter(datum, getter(datum) + '-2');
							}
						}
					)
				});

				const res = model.actions.create({
					f1: 'v-1',
					f2: 'v-2'
				});

				expect(res).to.deep.equal({
					f1: 'v-1',
					f2: 'v-2-2',
					v: 1
				});
			});
		});

		describe('read', function () {
			it('should work', function () {
				const model = new Model({
					controller,
					adapter,
					fields: factory(
						{
							external: 'f1',
							onRead(datum) {
								datum.v = 1;
							}
						},
						{
							external: 'f2',
							onRead(datum, setter, getter) {
								setter(datum, getter(datum) + '-2');
							}
						}
					)
				});

				const res = model.actions.read({
					f1: 'v-1',
					f2: 'v-2'
				});

				expect(res).to.deep.equal({
					f1: 'v-1',
					f2: 'v-2-2',
					v: 1
				});
			});
		});

		describe('update', function () {
			it('should work', function () {
				const model = new Model({
					controller,
					adapter,
					fields: factory(
						{
							external: 'f1',
							onUpdate(datum) {
								datum.v = 1;
							}
						},
						{
							external: 'f2',
							onUpdate(datum, setter, getter) {
								setter(datum, getter(datum) + '-2');
							}
						}
					)
				});

				const res = model.actions.update({
					f1: 'v-1',
					f2: 'v-2'
				});

				expect(res).to.deep.equal({
					f1: 'v-1',
					f2: 'v-2-2',
					v: 1
				});
			});
		});

		describe('delete', function () {
			it('should work', function () {
				const model = new Model({
					controller,
					adapter,
					fields: factory(
						{
							external: 'f1',
							onDelete(datum) {
								datum.v = 1;
							}
						},
						{
							external: 'f2',
							onDelete(datum, setter, getter) {
								setter(datum, getter(datum) + '-2');
							}
						}
					)
				});

				const res = model.actions.delete({
					f1: 'v-1',
					f2: 'v-2'
				});

				expect(res).to.deep.equal({
					f1: 'v-1',
					f2: 'v-2-2',
					v: 1
				});
			});
		});

		describe('inflate', function () {
			it('should work', function () {
				const model = new Model({
					controller,
					adapter,
					fields: factory(
						{
							external: 'f1',
							onInflate(datum) {
								datum.v = 1;
							}
						},
						{
							external: 'f2',
							onInflate(datum, setter, getter) {
								setter(datum, getter(datum) + '-2');
							}
						}
					)
				});

				const res = model.actions.inflate({
					f1: 'v-1',
					f2: 'v-2'
				});

				expect(res).to.deep.equal({
					f1: 'v-1',
					f2: 'v-2-2',
					v: 1
				});
			});
		});

		describe('deflate', function () {
			it('should work', function () {
				const model = new Model({
					controller,
					adapter,
					fields: factory(
						{
							external: 'f1',
							onDeflate(datum) {
								datum.v = 1;
							}
						},
						{
							external: 'f2',
							onDeflate(datum, setter, getter) {
								setter(datum, getter(datum) + '-2');
							}
						}
					)
				});

				const res = model.actions.deflate({
					f1: 'v-1',
					f2: 'v-2'
				});

				expect(res).to.deep.equal({
					f1: 'v-1',
					f2: 'v-2-2',
					v: 1
				});
			});
		});
	});

	describe('crud actions', function () {
		describe('create', function () {
			xit('should work', function () {
				throw new Error('boo');
			});
		});

		describe('read', function () {
			xit('should work', function () {
				throw new Error('boo');
			});
		});

		describe('update', function () {
			xit('should work', function () {
				throw new Error('boo');
			});
		});

		describe('delete', function () {
			xit('should work', function () {
				throw new Error('boo');
			});
		});
	});

	describe('model', function () {
		it('should properly translate from internal to external and back', function () {
			const model = new Model({
				controller,
				adapter,
				fields: factory(
					{
						internal: 'field.eins',
						external: 'value1'
					},
					{
						internal: 'field.zwei',
						external: 'other.value2'
					},
					{
						internal: 'value',
						external: 'other.thing'
					}
				)
			});

			const original = [
				{
					field: {
						eins: 1,
						zwei: 2
					},
					value: 'foo-bar'
				}
			];

			const external = model.convertToExternal(original);

			const internal = model.convertToInternal(external);

			expect(external).to.deep.equal([
				{
					value1: 1,
					other: {
						value2: 2,
						thing: 'foo-bar'
					}
				}
			]);

			expect(internal).to.deep.equal(original);
		});
	});
});
