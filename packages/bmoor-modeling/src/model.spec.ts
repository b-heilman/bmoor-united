import {expect} from 'chai';
import {stub} from 'sinon';

import {ContextSecurityInterface} from '@bmoor/context';

import {Model} from './model';
import {ModelControllerInterface} from './model/controller.interface';
import {ModelAdapterInterface} from './model/adapter.interface';
import {InternalDatum, ExternalDatum, DeltaDatum} from './datum.interface';
import {factory} from './model/field/set';
import {ModelAccessorInterface} from './model/accessor.interface';

describe('@bmoor-modeling', function () {
	let controller: ModelControllerInterface<ExternalDatum, DeltaDatum> =
		null;
	let adapter: ModelAdapterInterface<DeltaDatum, InternalDatum> = null;
	let accessor: ModelAccessorInterface<
		ExternalDatum,
		DeltaDatum,
		InternalDatum
	> = null;
	let ctx: ContextSecurityInterface = null;

	beforeEach(function () {
		ctx = {
			hasPermission() {
				return true;
			},
			async hasClaim() {
				return true;
			}
		};

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
			},
			async delete(ids) {
				return ids.length;
			}
		};
		accessor = {
			getInternalKey() {
				return 'ok';
			},
			getExternalKey() {
				return 'ok';
			},
			getDeltaKey() {
				return 'ok';
			}
		};
	});

	describe('actions', function () {
		describe('create', function () {
			it('should work', function () {
				const model = new Model({
					controller,
					adapter,
					accessor,
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
					accessor,
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
					accessor,
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
					accessor,
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
					accessor,
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
					accessor,
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
			it('should work without a validator', async function () {
				const model = new Model({
					controller,
					adapter,
					accessor,
					fields: factory(
						{
							external: 'f1'
						},
						{
							external: 'f2',
							internal: 'f3'
						}
					)
				});

				const myStub = stub(adapter, 'create').resolves([
					{
						f1: 'foo',
						f3: 'bar'
					}
				]);

				const res = await model.create(
					[
						{
							f1: 'val-1',
							f2: 'val-2'
						}
					],
					ctx
				);

				expect(res).to.deep.equal([
					{
						f1: 'foo',
						f2: 'bar'
					}
				]);

				expect(myStub.getCall(0).args[0]).to.deep.equal([
					{
						f1: 'val-1',
						f3: 'val-2'
					}
				]);
			});

			xit('should work with a validator', function () {
				throw new Error('boo');
			});
		});

		describe('read', function () {
			it('should work without a validator', async function () {
				const model = new Model({
					controller,
					adapter,
					accessor,
					fields: factory(
						{
							external: 'f1'
						},
						{
							external: 'f2',
							internal: 'f3'
						}
					)
				});

				const myStub = stub(adapter, 'read').resolves([
					{
						f1: 'foo',
						f3: 'bar'
					}
				]);

				const res = await model.read([12], ctx);

				expect(res).to.deep.equal([
					{
						f1: 'foo',
						f2: 'bar'
					}
				]);

				expect(myStub.getCall(0).args[0]).to.deep.equal([12]);
			});

			xit('should work with a validator', function () {
				throw new Error('boo');
			});
		});

		describe('update', function () {
			it('should work without a validator', async function () {
				const model = new Model({
					controller,
					adapter,
					accessor,
					fields: factory(
						{
							external: 'f1'
						},
						{
							external: 'f2',
							internal: 'f3'
						}
					)
				});

				const myStub = stub(adapter, 'update').resolves([
					{
						f1: 'foo',
						f3: 'bar'
					}
				]);

				const res = await model.update(
					[
						{
							f1: 'val-1',
							f2: 'val-2'
						}
					],
					ctx
				);

				expect(res).to.deep.equal([
					{
						f1: 'foo',
						f2: 'bar'
					}
				]);

				expect(myStub.getCall(0).args[0]).to.deep.equal([
					{
						f1: 'val-1',
						f3: 'val-2'
					}
				]);
			});

			xit('should work with a validator', function () {
				throw new Error('boo');
			});
		});

		describe('delete', function () {
			it('should work without a validator', async function () {
				const model = new Model({
					controller,
					adapter,
					accessor,
					fields: factory(
						{
							external: 'f1'
						},
						{
							external: 'f2',
							internal: 'f3'
						}
					)
				});

				const myStub = stub(adapter, 'delete').resolves(true);

				stub(model, 'read').resolves([
					{
						f1: 'foo',
						f2: 'bar'
					}
				]);

				const res = await model.delete([123], ctx);

				expect(res).to.deep.equal([
					{
						f1: 'foo',
						f2: 'bar'
					}
				]);

				expect(myStub.getCall(0).args[0]).to.deep.equal([
					{
						f1: 'foo',
						f3: 'bar'
					}
				]);
			});

			xit('should work with a validator', function () {
				throw new Error('boo');
			});
		});
	});

	describe('model', function () {
		it('should properly translate from internal to external and back', function () {
			const model = new Model({
				controller,
				adapter,
				accessor,
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
