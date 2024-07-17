/**
import {expect} from 'chai';
import {stub} from 'sinon';

import {ContextSecurityInterface} from '@bmoor/context';

import {Model} from './model';
import {Service} from './service';
import { ServiceInternalGenerics, ServiceStorageGenerics, ServiceExternalGenerics } from './service.interface';
import { ServiceAdapterInterface } from './service/adapter.interface';
import { ServiceControllerInterface } from './service/controller.interface';

describe('@bmoor-modeling::Service', function () {
	type InternalT = ServiceInternalGenerics;
	type ExternalT = ServiceExternalGenerics;
	type StorageT = ServiceStorageGenerics;

	let model: Model<InternalT, ExternalT, StorageT>;
	let adapter: ServiceAdapterInterface<StorageT>;
	let service: Service<InternalT, ExternalT, StorageT>;
	let controller: ServiceControllerInterface<InternalT>;

	let ctx: ContextSecurityInterface = null;

	beforeEach(function () {
		ctx = {
			hasPermission() {
				return true;
			},
			async hasClaim() {
				return true;
			},
			hasFlag() {
				return false;
			},
			getFlag() {
				return null;
			},
			getVariable() {
				return null;
			},
		};
		controller = {
			async canCreate(ctx, datums) {
				return datums;
			},
			async canRead(ctx, datums) {
				return datums;
			},
			async canUpdate(ctx, datums) {
				return datums;
			},
			async canDelete(ctx, datums) {
				return datums;
			},
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
			},
		};
	});

	describe('actions', function () {
		describe('create', function () {
			it('should work', function () {
				const service = new Service(
					new Model({
						reference: 'junk',
						structure: {
							f1: 'f-1',
							f2: 'f-2'
						},
						info: {
							f1: {
								type: 'string'
							},
							f2: {
								type: 'number'
							}
						}
						fields: factory(
							{
								external: 'f1',
								onCreate(datum) {
									datum.v = 1;
								},
							},
							{
								external: 'f2',
								onCreate(datum, setter, getter) {
									setter(datum, getter(datum) + '-2');
								},
							},
						),
					}),
					{
						adapter,
						controller
					}
				);

				const res = service.actions.create({
					f1: 'v-1',
					f2: 'v-2',
				});

				expect(res).to.deep.equal({
					f1: 'v-1',
					f2: 'v-2-2',
					v: 1,
				});
			});
		});

		describe('read', function () {
			it('should work', function () {
				const service = new Service({
					controller,
					adapter,
					accessor,
					model: new Model({
						ref: 'junk',
						fields: factory(
							{
								external: 'f1',
								onRead(datum) {
									datum.v = 1;
								},
							},
							{
								external: 'f2',
								onRead(datum, setter, getter) {
									setter(datum, getter(datum) + '-2');
								},
							},
						),
					}),
				});

				const res = service.actions.read({
					f1: 'v-1',
					f2: 'v-2',
				});

				expect(res).to.deep.equal({
					f1: 'v-1',
					f2: 'v-2-2',
					v: 1,
				});
			});
		});

		describe('update', function () {
			it('should work', function () {
				const model = new Service({
					controller,
					adapter,
					accessor,
					model: new Model({
						ref: 'junk',
						fields: factory(
							{
								external: 'f1',
								onUpdate(datum) {
									datum.v = 1;
								},
							},
							{
								external: 'f2',
								onUpdate(datum, setter, getter) {
									setter(datum, getter(datum) + '-2');
								},
							},
						),
					}),
				});

				const res = model.actions.update({
					f1: 'v-1',
					f2: 'v-2',
				});

				expect(res).to.deep.equal({
					f1: 'v-1',
					f2: 'v-2-2',
					v: 1,
				});
			});
		});

		describe('inflate', function () {
			it('should work', function () {
				const model = new Service({
					controller,
					adapter,
					accessor,
					model: new Model({
						ref: 'junk',
						fields: factory(
							{
								external: 'f1',
								onInflate(datum) {
									datum.v = 1;
								},
							},
							{
								external: 'f2',
								onInflate(datum, setter, getter) {
									setter(datum, getter(datum) + '-2');
								},
							},
						),
					}),
				});

				const res = model.actions.inflate({
					f1: 'v-1',
					f2: 'v-2',
				});

				expect(res).to.deep.equal({
					f1: 'v-1',
					f2: 'v-2-2',
					v: 1,
				});
			});
		});

		describe('deflate', function () {
			it('should work', function () {
				const model = new Service({
					controller,
					adapter,
					accessor,
					model: new Model({
						ref: 'junk',
						fields: factory(
							{
								external: 'f1',
								onDeflate(datum) {
									datum.v = 1;
								},
							},
							{
								external: 'f2',
								onDeflate(datum, setter, getter) {
									setter(datum, getter(datum) + '-2');
								},
							},
						),
					}),
				});

				const res = model.actions.deflate({
					f1: 'v-1',
					f2: 'v-2',
				});

				expect(res).to.deep.equal({
					f1: 'v-1',
					f2: 'v-2-2',
					v: 1,
				});
			});
		});
	});

	describe('crud methods', function () {
		describe('create', function () {
			it('should work without a validator', async function () {
				const service = new Service({
					controller,
					adapter,
					accessor,
					validator,
					model: new Model({
						ref: 'junk',
						fields: factory(
							{
								external: 'f1',
							},
							{
								external: 'f2',
								internal: 'f3',
							},
						),
					}),
				});

				const myStub = stub(adapter, 'create').resolves([
					{
						f1: 'foo',
						f3: 'bar',
					},
				]);

				const res = await service.create(
					[
						{
							f1: 'val-1',
							f2: 'val-2',
						},
					],
					ctx,
				);

				expect(res).to.deep.equal([
					{
						f1: 'foo',
						f2: 'bar',
					},
				]);

				expect(myStub.getCall(0).args[0]).to.deep.equal([
					{
						f1: 'val-1',
						f3: 'val-2',
					},
				]);
			});

			it('should work with a validator', async function () {
				const service = new Service({
					controller,
					adapter,
					accessor,
					validator,
					model: new Model({
						ref: 'junk',
						fields: factory(
							{
								external: 'f1',
							},
							{
								external: 'f2',
								internal: 'f3',
							},
						),
					}),
				});

				const myStub = stub(validator, 'validateCreate').resolves(
					new Error('fail-whale'),
				);

				let failed = false;
				try {
					await service.create(
						[
							{
								f1: 'val-1',
								f2: 'val-2',
							},
						],
						ctx,
					);
				} catch (ex) {
					failed = true;
					if (ex instanceof Error) {
						expect(ex.message).to.equal('fail-whale');
					} else {
						expect(true).to.equal(false);
					}
				}

				expect(failed).to.equal(true);

				expect(myStub.getCall(0).args[0]).to.deep.equal([
					{
						f1: 'val-1',
						f2: 'val-2',
					},
				]);
			});

			it('should work with actions', async function () {
				const service = new Service({
					controller,
					adapter,
					accessor,
					validator,
					model: new Model({
						ref: 'junk',
						fields: factory(
							{
								external: 'f1',
								onCreate: (datum, setter) => {
									setter(datum, 'value');
								},
							},
							{
								external: 'f2',
								internal: 'f3',
								usage: 'json',
							},
						),
					}),
				});

				const myStub = stub(adapter, 'create').resolves([
					{
						f1: 'foo',
						f3: '{"a":"value"}',
					},
				]);

				const res = await service.create(
					[
						{
							f2: {
								foo: 'bar',
							},
						},
					],
					ctx,
				);

				expect(res).to.deep.equal([
					{
						f1: 'foo',
						f2: {
							a: 'value',
						},
					},
				]);

				expect(myStub.getCall(0).args[0]).to.deep.equal([
					{
						f1: 'value',
						f3: '{"foo":"bar"}',
					},
				]);
			});
		});

		describe('read', function () {
			it('should work without a validator', async function () {
				const service = new Service({
					controller,
					adapter,
					accessor,
					validator,
					model: new Model({
						ref: 'junk',
						fields: factory(
							{
								external: 'key',
								internal: 'id',
							},
							{
								external: 'f1',
							},
							{
								external: 'f2',
								internal: 'f3',
							},
						),
					}),
				});

				const myStub = stub(adapter, 'read').resolves([
					{
						f1: 'foo',
						f3: 'bar',
						id: 123,
					},
				]);

				const res = await service.read([{key: 12}], ctx);

				expect(res).to.deep.equal([
					{
						f1: 'foo',
						f2: 'bar',
						key: 123,
					},
				]);

				expect(myStub.getCall(0).args[0]).to.deep.equal([
					{
						id: 12,
					},
				]);
			});

			xit('should work with actions', function () {
				throw new Error('boo');
			});
		});

		describe('update', function () {
			it('should work without a validator', async function () {
				const service = new Service({
					controller,
					adapter,
					accessor,
					validator,
					model: new Model({
						ref: 'junk',
						fields: factory(
							{
								external: 'key',
								internal: 'id',
							},
							{
								external: 'f1',
							},
							{
								external: 'f2',
								internal: 'f3',
							},
						),
					}),
				});

				const myStub = stub(adapter, 'update').resolves([
					{
						f1: 'foo',
						f3: 'bar',
					},
				]);

				const res = await service.update(
					[
						{
							ref: {
								key: 123,
							},
							delta: {
								f1: 'val-1',
								f2: 'val-2',
							},
						},
					],
					ctx,
				);

				expect(res).to.deep.equal([
					{
						f1: 'foo',
						f2: 'bar',
					},
				]);

				expect(myStub.getCall(0).args[0]).to.deep.equal([
					{
						ref: {
							id: 123,
						},
						delta: {
							f1: 'val-1',
							f3: 'val-2',
						},
					},
				]);
			});

			it('should work with a validator', async function () {
				const service = new Service({
					controller,
					adapter,
					accessor,
					validator,
					model: new Model({
						ref: 'junk',
						fields: factory(
							{
								external: 'key',
								internal: 'id',
							},
							{
								external: 'f1',
							},
							{
								external: 'f2',
								internal: 'f3',
							},
						),
					}),
				});

				const myStub = stub(validator, 'validateUpdate').resolves(
					new Error('fail-whale'),
				);

				let failed = false;
				try {
					await service.update(
						[
							{
								ref: {
									key: 123,
								},
								delta: {
									f1: 'val-1',
									f2: 'val-2',
								},
							},
						],
						ctx,
					);
				} catch (ex) {
					failed = true;
					if (ex instanceof Error) {
						expect(ex.message).to.equal('fail-whale');
					} else {
						expect(true).to.equal(false);
					}
				}

				expect(failed).to.equal(true);

				expect(myStub.getCall(0).args[0]).to.deep.equal([
					{
						ref: {
							key: 123,
						},
						delta: {
							f1: 'val-1',
							f2: 'val-2',
						},
					},
				]);
			});

			it('should work with actions', async function () {
				const service = new Service({
					controller,
					adapter,
					accessor,
					validator,
					model: new Model({
						ref: 'junk',
						fields: factory(
							{
								external: 'key',
							},
							{
								external: 'f1',
								onUpdate: (datum, setter) => {
									setter(datum, 'value');
								},
							},
							{
								external: 'f2',
								internal: 'f3',
								usage: 'json',
							},
						),
					}),
				});

				const myStub = stub(adapter, 'update').resolves([
					{
						f1: 'foo',
						f3: '{"a":"value"}',
					},
				]);

				const res = await service.update(
					[
						{
							ref: {
								key: 123,
							},
							delta: {
								f2: {
									foo: 'bar',
								},
							},
						},
					],
					ctx,
				);

				expect(res).to.deep.equal([
					{
						f1: 'foo',
						f2: {
							a: 'value',
						},
					},
				]);

				expect(myStub.getCall(0).args[0]).to.deep.equal([
					{
						ref: {
							key: 123,
						},
						delta: {
							f1: 'value',
							f3: '{"foo":"bar"}',
						},
					},
				]);
			});
		});

		describe('delete', function () {
			it('should work without a validator', async function () {
				const service = new Service({
					controller,
					adapter,
					accessor,
					validator,
					model: new Model({
						ref: 'junk',
						fields: factory(
							{
								external: 'key',
								internal: 'id',
							},
							{
								external: 'f1',
							},
							{
								external: 'f2',
								internal: 'f3',
							},
						),
					}),
				});

				const myStub = stub(adapter, 'delete').resolves(null);

				stub(service, 'read').resolves([
					{
						f1: 'foo',
						f2: 'bar',
					},
				]);

				const res = await service.delete(
					[
						{
							key: 123,
						},
					],
					ctx,
				);

				expect(res).to.deep.equal([
					{
						f1: 'foo',
						f2: 'bar',
					},
				]);

				expect(myStub.getCall(0).args[0]).to.deep.equal([
					{
						id: 123,
					},
				]);
			});

			xit('should work with actions', function () {
				throw new Error('boo');
			});
		});
	});

	describe('model', function () {
		it('should properly translate from internal to external and back', function () {
			const service = new Service({
				controller,
				adapter,
				accessor,
				validator,
				model: new Model({
					ref: 'junk',
					fields: factory(
						{
							internal: 'field.eins',
							external: 'value1',
						},
						{
							internal: 'field.zwei',
							external: 'other.value2',
						},
						{
							internal: 'value',
							external: 'other.thing',
						},
					),
				}),
			});

			const original = {
				field: {
					eins: 1,
					zwei: 2,
				},
				value: 'foo-bar',
			};

			const external = service.convertToExternal(original, ctx);

			const internal = service.convertToInternal(external, ctx);

			expect(external).to.deep.equal({
				value1: 1,
				other: {
					value2: 2,
					thing: 'foo-bar',
				},
			});

			expect(internal).to.deep.equal(original);
		});
	});

	describe('with generics', function () {
		interface ExternalReferenceGeneric {
			key: number;
		}

		interface ExternalReadGeneric extends ExternalReferenceGeneric {
			field1: string;
			other: {
				field2: number;
			};
		}

		interface InternalReferenceGeneric {
			id: number;
		}

		interface InternalReadGeneric extends InternalReferenceGeneric {
			field1: string;
			field2: number;
		}

		it('should allow correct invocation', async function () {
			const service = new Service<
				ExternalReadGeneric,
				ExternalReferenceGeneric,
				ExternalCreate,
				ExternalUpdate,
				ExternalSearch,
				InternalReadGeneric,
				InternalReferenceGeneric,
				InternalCreate,
				InternalUpdate,
				InternalSearch
			>({
				controller,
				adapter,
				accessor,
				validator,
				model: new Model({
					ref: 'junk',
					fields: factory(
						{
							external: 'key',
							internal: 'id',
							usage: 'key',
							jsonType: 'number',
						},
						{
							external: 'field1',
							internal: 'field1',
							jsonType: 'string',
						},
						{
							external: 'other.field2',
							internal: 'field2',
							jsonType: 'number',
						},
					),
				}),
			});

			adapter.read = async function (): Promise<InternalReadGeneric[]> {
				return [
					{
						id: 123,
						field1: 'hello-world',
						field2: 789,
					},
				];
			};

			const res1 = await service.read([], ctx);
			expect(res1).to.deep.equal([
				{
					key: 123,
					field1: 'hello-world',
					other: {
						field2: 789,
					},
				},
			]);

			const myStub = stub();

			myStub.resolves([
				{
					id: 1233,
					field1: 'hello-world-3',
					field2: 7893,
				},
			]);

			adapter.create = myStub;

			const res2 = await service.create(
				[
					{
						field1: 'hello-world-2',
						other: {
							field2: 7892,
						},
					},
				],
				ctx,
			);
			expect(res2).to.deep.equal([
				{
					key: 1233,
					field1: 'hello-world-3',
					other: {
						field2: 7893,
					},
				},
			]);

			expect(myStub.getCall(0).args[0]).to.deep.equal([
				{
					field1: 'hello-world-2',
					field2: 7892,
				},
			]);
		});
	});
});
**/
