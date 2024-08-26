import {expect} from 'chai';
import {stub} from 'sinon';

import {validations} from '@bmoor/schema';

import {converter} from './converter';
import {hooks} from './hooker';
import {Model} from './model';
import {Service} from './service';
import {
	// ServiceExternalGenerics,
	ServiceInternalGenerics,
	ServiceStorageGenerics,
} from './service.interface';
import {ServiceAdapterInterface} from './service/adapter.interface';
import {ModelContext} from './model/context';
import {ServiceControllerInterface} from './service/controller.interface';
import {types} from './typing';
import { ServiceContextInterface } from './service/context.interface';

describe('@bmoor-modeling::Service', function () {
	type InternalT = ServiceInternalGenerics;
	// type ExternalT = ServiceExternalGenerics;
	type StorageT = ServiceStorageGenerics;

	let adapter: ServiceAdapterInterface<StorageT>;
	let controller: ServiceControllerInterface<InternalT>;

	let responseData;
	let serverCtx;
	let callCtx: ServiceContextInterface = null;

	beforeEach(function () {
		serverCtx = new ModelContext(types, validations, hooks, converter);

		callCtx = {
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
			env: null
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
			async create() {
				return responseData;
			},
			async read() {
				return responseData;
			},
			async update() {
				return responseData;
			},
			async delete() {
				return responseData.length;
			},
		};

		responseData = [];
	});

	describe('::onCreate', function () {
		it('should work', function () {
			const service = new Service(
				new Model(serverCtx, {
					reference: 'junk',
					structure: {
						field1: 'f1',
						field2: 'f2',
						field3: 'f3',
					},
					info: {
						f1: {
							type: 'string',
						},
						f2: {
							type: 'number',
						},
					},
					hooks: {
						f2: {
							onCreate(value) {
								return value + '-2';
							},
						},
						f3: {
							onCreate() {
								return 1;
							},
						},
					},
				}),
				{
					adapter,
					controller,
				},
			);

			const res = service.onCreate(callCtx, {
				field1: 'v-1',
				field2: 'v-2',
			});

			expect(res).to.deep.equal({
				field1: 'v-1',
				field2: 'v-2-2',
				field3: 1,
			});
		});
	});

	describe('::onRead', function () {
		it('should work', function () {
			const service = new Service(
				new Model(serverCtx, {
					reference: 'junk',
					structure: {
						field1: 'f1',
						field2: 'f2',
						field3: 'f3',
					},
					info: {
						f1: {
							type: 'string',
						},
						f2: {
							type: 'number',
						},
					},
					hooks: {
						f2: {
							onRead(value) {
								return value + '-2';
							},
						},
						f3: {
							onRead() {
								return 1;
							},
						},
					},
				}),
				{
					adapter,
					controller,
				},
			);

			const res = service.onRead(callCtx, {
				field1: 'v-1',
				field2: 'v-2',
			});

			expect(res).to.deep.equal({
				field1: 'v-1',
				field2: 'v-2-2',
				field3: 1,
			});
		});
	});

	describe('::onUpdate', function () {
		it('should work', function () {
			const service = new Service(
				new Model(serverCtx, {
					reference: 'junk',
					structure: {
						field1: 'f1',
						field2: 'f2',
						field3: 'f3',
					},
					info: {
						f1: {
							type: 'string',
						},
						f2: {
							type: 'number',
						},
					},
					hooks: {
						f2: {
							onUpdate(value) {
								return value + '-2';
							},
						},
						f3: {
							onUpdate() {
								return 1;
							},
						},
					},
				}),
				{
					adapter,
					controller,
				},
			);

			const res = service.onUpdate(callCtx, {
				field1: 'v-1',
				field2: 'v-2',
			});

			expect(res).to.deep.equal({
				field1: 'v-1',
				field2: 'v-2-2',
				field3: 1,
			});
		});
	});

	describe('::onInflate', function () {
		it('should work', function () {
			const service = new Service(
				new Model(serverCtx, {
					reference: 'junk',
					structure: {
						field1: 'f1',
						field2: 'f2',
						field3: 'f3',
					},
					info: {
						f1: {
							type: 'string',
						},
						f2: {
							type: 'number',
						},
					},
					hooks: {
						f2: {
							onInflate(value) {
								return value + '-2';
							},
						},
						f3: {
							onInflate() {
								return 1;
							},
						},
					},
				}),
				{
					adapter,
					controller,
				},
			);

			const res = service.onInflate(callCtx, {
				field1: 'v-1',
				field2: 'v-2',
			});

			expect(res).to.deep.equal({
				field1: 'v-1',
				field2: 'v-2-2',
				field3: 1,
			});
		});
	});

	describe('::onDeflate', function () {
		it('should work', function () {
			const service = new Service(
				new Model(serverCtx, {
					reference: 'junk',
					structure: {
						field1: 'f1',
						field2: 'f2',
						field3: 'f3',
					},
					info: {
						f1: {
							type: 'string',
						},
						f2: {
							type: 'number',
						},
					},
					hooks: {
						f2: {
							onDeflate(value) {
								return value + '-2';
							},
						},
						f3: {
							onDeflate() {
								return 1;
							},
						},
					},
				}),
				{
					adapter,
					controller,
				},
			);

			const res = service.onDeflate(callCtx, {
				field1: 'v-1',
				field2: 'v-2',
			});

			expect(res).to.deep.equal({
				field1: 'v-1',
				field2: 'v-2-2',
				field3: 1,
			});
		});
	});

	describe('crud methods', function () {
		describe('create', function () {
			it('should work without a validator', async function () {
				const service = new Service(
					new Model(serverCtx, {
						reference: 'junk',
						structure: {
							field1: 'f1',
							field2: 'f2',
						},
						storage: {
							field1: 'f1',
							field3: 'f2',
						},
						info: {
							f1: {
								type: 'string',
							},
							f2: {
								type: 'number',
							},
						},
					}),
					{
						adapter,
						controller,
					},
				);

				const myStub = stub(adapter, 'create').resolves([
					{
						field1: 'foo',
						field3: 'bar',
					},
				]);

				const res = await service.create(callCtx, [
					{
						field1: 'val-1',
						field2: 'val-2',
					},
				]);

				expect(res).to.deep.equal([
					{
						field1: 'foo',
						field2: 'bar',
					},
				]);

				expect(myStub.getCall(0).args[1]).to.deep.equal({
					model: {
						name: 'junk',
						fields: [
							{
								path: 'field1',
							},
							{
								path: 'field3',
							},
						],
					},
					params: [
						{
							field1: 'val-1',
							field3: 'val-2',
						},
					],
				});
			});

			it('should work with a validator', async function () {
				const service = new Service(
					new Model(serverCtx, {
						reference: 'junk',
						structure: {
							field1: 'f1',
							field2: 'f2',
						},
						storage: {
							field1: 'f1',
							field3: 'f2',
						},
						info: {
							f1: {
								type: 'string',
							},
							f2: {
								type: 'number',
							},
						},
					}),
					{
						adapter,
						controller,
					},
				);

				const myStub = stub(service.model, 'validate').resolves([
					'fail-whale',
				]);

				let failed = false;
				try {
					await service.create(callCtx, [
						{
							f1: 'val-1',
							f2: 'val-2',
						},
					]);
				} catch (ex) {
					failed = true;
					if (ex instanceof Error) {
						expect(ex.message).to.equal('fail-whale');
					} else {
						expect(true).to.equal(false);
					}
				}

				expect(failed).to.equal(true);

				expect(myStub.getCall(0).args[0]).to.deep.equal({
					f1: 'val-1',
					f2: 'val-2',
				});
			});

			it('should work with actions', async function () {
				const service = new Service(
					new Model(serverCtx, {
						reference: 'junk',
						structure: {
							field1: 'f1',
							field2: 'f2',
						},
						storage: {
							field1: 'f1',
							field3: 'f2',
						},
						info: {
							f1: {
								type: 'string',
							},
							f2: {
								type: 'json',
								storage: 'string',
							},
						},
						hooks: {
							f1: {
								onCreate(value) {
									return value + '-2';
								},
							},
						},
					}),
					{
						adapter,
						controller,
					},
				);

				const myStub = stub(adapter, 'create').resolves([
					{
						field1: 'foo',
						field3: '{"a":"value"}',
					},
				]);

				const res = await service.create(callCtx, [
					{
						field1: 'helloWorld',
						field2: {
							foo: 'bar',
						},
					},
				]);

				expect(res).to.deep.equal([
					{
						field1: 'foo',
						field2: {
							a: 'value',
						},
					},
				]);

				expect(myStub.getCall(0).args[1]).to.deep.equal({
					model: {
						name: 'junk',
						fields: [
							{
								path: 'field1',
							},
							{
								path: 'field3',
							},
						],
					},
					params: [
						{
							field1: 'helloWorld-2',
							field3: '{"foo":"bar"}',
						},
					],
				});
			});
		});

		describe('externalCreate', function () {
			it('should work with external and storage', async function () {
				const service = new Service(
					new Model(serverCtx, {
						reference: 'junk',
						structure: {
							struct1: 'f1',
							struct2: 'f2',
						},
						external: {
							data: {
								prop1: 'f1',
								prop2: 'f2',
							},
						},
						storage: {
							store1: 'f1',
							store2: 'f2',
						},
						info: {
							f1: {
								type: 'string',
							},
							f2: {
								type: 'json',
								storage: 'string',
							},
						},
						hooks: {
							f1: {
								onCreate(value) {
									return value + '-2';
								},
							},
						},
					}),
					{
						adapter,
						controller,
					},
				);

				const myStub = stub(adapter, 'create').resolves([
					{
						store1: 'foo',
						store2: '{"a":"value"}',
					},
				]);

				const res = await service.externalCreate(callCtx, [
					{
						data: {
							prop1: 'helloWorld',
							prop2: {foo: 'bar'},
						},
					},
				]);

				expect(res).to.deep.equal([
					{
						data: {
							prop1: 'foo',
							prop2: {
								a: 'value',
							},
						},
					},
				]);

				expect(myStub.getCall(0).args[1]).to.deep.equal({
					model: {
						name: 'junk',
						fields: [
							{
								path: 'store1',
							},
							{
								path: 'store2',
							},
						],
					},
					params: [
						{
							store1: 'helloWorld-2',
							store2: '{"foo":"bar"}',
						},
					],
				});
			});
		});

		describe('read', function () {
			it('should work without a validator', async function () {
				const service = new Service(
					new Model(serverCtx, {
						reference: 'junk',
						structure: {
							field1: 'f1',
							field2: 'f2',
						},
						storage: {
							field1: 'f1',
							field3: 'f2',
						},
						info: {
							f1: {
								type: 'string',
							},
							f2: {
								type: 'number',
								use: 'primary',
							},
						},
					}),
					{
						adapter,
						controller,
					},
				);

				const myStub = stub(adapter, 'read').resolves([
					{
						field1: 'foo',
						field3: 'bar',
					},
				]);

				const res = await service.read(callCtx, [{field2: 12}]);

				expect(res).to.deep.equal([
					{
						field1: 'foo',
						field2: 'bar',
					},
				]);

				expect(myStub.getCall(0).args[1]).to.deep.equal({
					select: {
						models: [
							{
								name: 'junk',
								fields: [
									{
										path: 'field1',
									},
									{
										path: 'field3',
									},
								],
							},
						],
					},
					params: {
						ops: [
							{
								series: 'junk',
								path: 'field3',
								operator: 'eq',
								value: [12],
							},
						],
					},
				});
			});
		});

		describe('externalRead', function () {
			it('should work without a validator', async function () {
				const service = new Service(
					new Model(serverCtx, {
						reference: 'junk',
						structure: {
							field1: 'f1',
							field2: 'f2',
						},
						storage: {
							store1: 'f1',
							store2: 'f2',
						},
						external: {
							data: {
								prop1: 'f1',
								prop2: 'f2',
							},
						},
						info: {
							f1: {
								type: 'string',
							},
							f2: {
								use: 'primary',
								type: 'number',
							},
						},
					}),
					{
						adapter,
						controller,
					},
				);

				const myStub = stub(adapter, 'read').resolves([
					{
						store1: 'foo',
						store2: 'bar',
					},
				]);

				const res = await service.externalRead(callCtx, [
					{data: {prop2: 12}},
				]);

				expect(res).to.deep.equal([
					{
						data: {
							prop1: 'foo',
							prop2: 'bar',
						},
					},
				]);

				expect(myStub.getCall(0).args[1]).to.deep.equal({
					select: {
						models: [
							{
								name: 'junk',
								fields: [
									{
										path: 'store1',
									},
									{
										path: 'store2',
									},
								],
							},
						],
					},
					params: {
						ops: [
							{
								series: 'junk',
								path: 'store2',
								operator: 'eq',
								value: [12],
							},
						],
					},
				});
			});
		});

		describe('update', function () {
			it('should work without a validator', async function () {
				const service = new Service(
					new Model(serverCtx, {
						reference: 'junk',
						structure: {
							field1: 'f1',
							field2: 'f2',
						},
						storage: {
							field1: 'f1',
							field3: 'f2',
						},
						info: {
							f1: {
								type: 'string',
							},
							f2: {
								use: 'primary',
								type: 'number',
							},
						},
					}),
					{
						adapter,
						controller,
					},
				);

				const myStub = stub(adapter, 'update').resolves([
					{
						field1: 'foo',
						field3: 'bar',
					},
				]);

				const res = await service.update(callCtx, [
					{
						ref: {
							field2: 123,
						},
						delta: {
							field1: 'val-1',
							field2: 'val-2',
						},
					},
				]);

				expect(res).to.deep.equal([
					{
						field1: 'foo',
						field2: 'bar',
					},
				]);

				expect(myStub.getCall(0).args[1]).to.deep.equal({
					model: {
						name: 'junk',
						fields: [
							{
								path: 'field1',
							},
							{
								path: 'field3',
							},
						],
					},
					params: [
						{
							field1: 'val-1',
							field3: 'val-2',
						},
					],
					where: {
						params: {
							ops: [
								{
									series: 'junk',
									path: 'field3',
									operator: 'eq',
									value: 123,
								},
							],
						},
					},
				});
			});

			it('should work with a validator', async function () {
				const service = new Service(
					new Model(serverCtx, {
						reference: 'junk',
						structure: {
							field1: 'f1',
							field2: 'f2',
						},
						storage: {
							field1: 'f1',
							field3: 'f2',
						},
						info: {
							f1: {
								type: 'string',
							},
							f2: {
								type: 'number',
							},
						},
					}),
					{
						adapter,
						controller,
					},
				);

				const myStub = stub(service.model, 'validate').resolves([
					'fail-whale',
				]);

				let failed = false;
				try {
					await service.update(callCtx, [
						{
							ref: {
								field1: 123,
							},
							delta: {
								field1: 'val-1',
								field2: 'val-2',
							},
						},
					]);
				} catch (ex) {
					failed = true;
					if (ex instanceof Error) {
						expect(ex.message).to.equal('fail-whale');
					} else {
						expect(true).to.equal(false);
					}
				}

				expect(failed).to.equal(true);

				expect(myStub.getCall(0).args[0]).to.deep.equal({
					field1: 'val-1',
					field2: 'val-2',
				});
			});

			it('should work with actions', async function () {
				const service = new Service(
					new Model(serverCtx, {
						reference: 'junk',
						structure: {
							field1: 'f1',
							field2: 'f2',
						},
						storage: {
							store1: 'f1',
							store2: 'f2',
						},
						info: {
							f1: {
								use: 'primary',
								type: 'string',
							},
							f2: {
								type: 'json',
								storage: 'string',
							},
						},
					}),
					{
						adapter,
						controller,
					},
				);

				const myStub = stub(adapter, 'update').resolves([
					{
						store1: 'foo',
						store2: '{"a":"value"}',
					},
				]);

				const res = await service.update(callCtx, [
					{
						ref: {
							field1: 123,
						},
						delta: {
							field2: {
								foo: 'bar',
							},
						},
					},
				]);

				expect(res).to.deep.equal([
					{
						field1: 'foo',
						field2: {
							a: 'value',
						},
					},
				]);

				expect(myStub.getCall(0).args[1]).to.deep.equal({
					model: {
						name: 'junk',
						fields: [
							{
								path: 'store1',
							},
							{
								path: 'store2',
							},
						],
					},
					params: [
						{
							store2: '{"foo":"bar"}',
						},
					],
					where: {
						params: {
							ops: [
								{
									series: 'junk',
									path: 'store1',
									operator: 'eq',
									value: 123,
								},
							],
						},
					},
				});
			});
		});

		describe('externalUpdate', function () {
			it('should work without a validator', async function () {
				const service = new Service(
					new Model(serverCtx, {
						reference: 'junk',
						structure: {
							field1: 'f1',
							field2: 'f2',
						},
						storage: {
							store1: 'f1',
							store2: 'f2',
						},
						external: {
							data: {
								prop1: 'f1',
								prop2: 'f2',
							},
						},
						info: {
							f1: {
								type: 'string',
							},
							f2: {
								use: 'primary',
								type: 'number',
							},
						},
					}),
					{
						adapter,
						controller,
					},
				);

				const myStub = stub(adapter, 'update').resolves([
					{
						store1: 'foo',
						store2: 'bar',
					},
				]);

				const res = await service.externalUpdate(callCtx, [
					{
						ref: {
							data: {
								prop2: 123,
							},
						},
						delta: {
							data: {
								prop1: 'val-1',
								prop2: 'val-2',
							},
						},
					},
				]);

				expect(res).to.deep.equal([
					{
						data: {
							prop1: 'foo',
							prop2: 'bar',
						},
					},
				]);

				expect(myStub.getCall(0).args[1]).to.deep.equal({
					model: {
						name: 'junk',
						fields: [
							{
								path: 'store1',
							},
							{
								path: 'store2',
							},
						],
					},
					params: [
						{
							store1: 'val-1',
							store2: 'val-2',
						},
					],
					where: {
						params: {
							ops: [
								{
									series: 'junk',
									path: 'store2',
									operator: 'eq',
									value: 123,
								},
							],
						},
					},
				});
			});
		});

		describe('delete', function () {
			it('should work without a validator', async function () {
				const service = new Service(
					new Model(serverCtx, {
						reference: 'junk',
						structure: {
							field1: 'f1',
							field2: 'f2',
						},
						storage: {
							field1: 'f1',
							field3: 'f2',
						},
						info: {
							f1: {
								type: 'string',
							},
							f2: {
								use: 'primary',
								type: 'number',
							},
						},
					}),
					{
						adapter,
						controller,
					},
				);

				const myStub = stub(adapter, 'delete').resolves(null);

				stub(service, 'read').resolves([
					{
						field1: 'foo',
						field2: 'bar',
					},
				]);

				const res = await service.delete(callCtx, [
					{
						field2: 123,
					},
				]);

				expect(res).to.deep.equal([
					{
						field1: 'foo',
						field2: 'bar',
					},
				]);

				expect(myStub.getCall(0).args[1]).to.deep.equal({
					model: {
						name: 'junk',
						fields: [
							{
								path: 'field1',
							},
							{
								path: 'field3',
							},
						],
					},
					params: {
						ops: [
							{
								series: 'junk',
								path: 'field3',
								operator: 'eq',
								value: [123],
							},
						],
					},
				});
			});
		});

		describe('externalDelete', function () {
			it('should work without a validator', async function () {
				const service = new Service(
					new Model(serverCtx, {
						reference: 'junk',
						structure: {
							field1: 'f1',
							field2: 'f2',
						},
						storage: {
							store1: 'f1',
							store2: 'f2',
						},
						external: {
							data: {
								prop1: 'f1',
								prop2: 'f2',
							},
						},
						info: {
							f1: {
								type: 'string',
							},
							f2: {
								use: 'primary',
								type: 'number',
							},
						},
					}),
					{
						adapter,
						controller,
					},
				);

				const myStub = stub(adapter, 'delete').resolves(null);

				stub(service, 'read').resolves([
					{
						field1: 'foo',
						field2: 'bar',
					},
				]);

				const res = await service.externalDelete(callCtx, [
					{
						data: {
							prop2: 123,
						},
					},
				]);

				expect(res).to.deep.equal([
					{
						data: {
							prop1: 'foo',
							prop2: 'bar',
						},
					},
				]);

				expect(myStub.getCall(0).args[1]).to.deep.equal({
					model: {
						name: 'junk',
						fields: [
							{
								path: 'store1',
							},
							{
								path: 'store2',
							},
						],
					},
					params: {
						ops: [
							{
								series: 'junk',
								path: 'store2',
								operator: 'eq',
								value: [123],
							},
						],
					},
				});
			});
		});

		describe('select', function () {
			it('should work without actions', async function () {
				const service = new Service(
					new Model(serverCtx, {
						reference: 'junk',
						structure: {
							field1: 'f1',
							field2: 'f2',
						},
						storage: {
							field1: 'f1',
							field3: 'f2',
						},
						info: {
							f1: {
								type: 'string',
							},
							f2: {
								type: 'number',
								use: 'primary',
							},
						},
					}),
					{
						adapter,
						controller,
					},
				);

				const myStub = stub(adapter, 'read').resolves([
					{
						field1: 'foo',
						field3: 'bar',
					},
				]);

				const res = await service.select(callCtx, {
					params: {
						field2: 12,
					},
					actions: {
						sort: 'field',
						filter: 'do_it',
						junk: 'some_value',
					},
				});

				expect(res).to.deep.equal([
					{
						field1: 'foo',
						field2: 'bar',
					},
				]);

				expect(myStub.getCall(0).args[1]).to.deep.equal({
					select: {
						models: [
							{
								name: 'junk',
								fields: [
									{
										path: 'field1',
									},
									{
										path: 'field3',
									},
								],
							},
						],
					},
					params: {
						ops: [
							{
								series: 'junk',
								path: 'field3',
								operator: 'eq',
								value: 12,
							},
						],
					},
				});

				expect(myStub.getCall(0).args[2]).to.deep.equal({});
			});

			it('should work with actions', async function () {
				const service = new Service(
					new Model(serverCtx, {
						reference: 'junk',
						structure: {
							field1: 'f1',
							field2: 'f2',
						},
						storage: {
							field1: 'f1',
							field3: 'f2',
						},
						info: {
							f1: {
								type: 'string',
							},
							f2: {
								type: 'number',
								use: 'primary',
							},
						},
					}),
					{
						adapter,
						controller,
						actions: {
							sort: {
								type: 'string',
							},
							filter: {
								type: 'string',
								fn: (input) => {
									return input.concat(input);
								},
							},
						},
					},
				);

				const myStub = stub(adapter, 'read').resolves([
					{
						field1: 'foo',
						field3: 'bar',
					},
				]);

				const res = await service.select(callCtx, {
					params: {
						field2: 12,
					},
					actions: {
						sort: 'field',
						filter: 'do_it',
						junk: 'some_value',
					},
				});

				expect(res).to.deep.equal([
					{
						field1: 'foo',
						field2: 'bar',
					},
					{
						field1: 'foo',
						field2: 'bar',
					},
				]);

				expect(myStub.getCall(0).args[1]).to.deep.equal({
					select: {
						models: [
							{
								name: 'junk',
								fields: [
									{
										path: 'field1',
									},
									{
										path: 'field3',
									},
								],
							},
						],
					},
					params: {
						ops: [
							{
								series: 'junk',
								path: 'field3',
								operator: 'eq',
								value: 12,
							},
						],
					},
				});

				// TODO: probably want to
				expect(myStub.getCall(0).args[2]).to.deep.equal({
					sort: 'field',
				});
			});
		});

		describe('externalSelect', function () {
			it('should work without actions', async function () {
				const service = new Service(
					new Model(serverCtx, {
						reference: 'junk',
						structure: {
							field1: 'f1',
							field2: 'f2',
						},
						storage: {
							store1: 'f1',
							store2: 'f2',
						},
						external: {
							data: {
								prop1: 'f1',
								prop2: 'f2',
							},
						},
						info: {
							f1: {
								type: 'string',
							},
							f2: {
								use: 'primary',
								type: 'number',
							},
						},
					}),
					{
						adapter,
						controller,
					},
				);

				const myStub = stub(adapter, 'read').resolves([
					{
						store1: 'foo',
						store2: 'bar',
					},
				]);

				const res = await service.externalSelect(callCtx, {
					params: {
						data: {prop2: 12},
					},
					actions: {
						sort: 'field',
						filter: 'do_it',
						junk: 'some_value',
					},
				});

				expect(res).to.deep.equal([
					{
						data: {
							prop1: 'foo',
							prop2: 'bar',
						},
					},
				]);

				expect(myStub.getCall(0).args[1]).to.deep.equal({
					select: {
						models: [
							{
								name: 'junk',
								fields: [
									{
										path: 'store1',
									},
									{
										path: 'store2',
									},
								],
							},
						],
					},
					params: {
						ops: [
							{
								series: 'junk',
								path: 'store2',
								operator: 'eq',
								value: 12,
							},
						],
					},
				});

				expect(myStub.getCall(0).args[2]).to.deep.equal({});
			});

			it('should work with actions', async function () {
				const service = new Service(
					new Model(serverCtx, {
						reference: 'junk',
						structure: {
							field1: 'f1',
							field2: 'f2',
						},
						storage: {
							store1: 'f1',
							store2: 'f2',
						},
						external: {
							data: {
								prop1: 'f1',
								prop2: 'f2',
							},
						},
						info: {
							f1: {
								type: 'string',
							},
							f2: {
								use: 'primary',
								type: 'number',
							},
						},
					}),
					{
						adapter,
						controller,
						actions: {
							sort: {
								type: 'string',
							},
							filter: {
								type: 'string',
								fn: (input) => {
									return input.concat(input);
								},
							},
						},
					},
				);

				const myStub = stub(adapter, 'read').resolves([
					{
						store1: 'foo',
						store2: 'bar',
					},
				]);

				const res = await service.externalSelect(callCtx, {
					params: {
						data: {prop2: 12},
					},
					actions: {
						sort: 'field',
						filter: 'do_it',
						junk: 'some_value',
					},
				});

				expect(res).to.deep.equal([
					{
						data: {
							prop1: 'foo',
							prop2: 'bar',
						},
					},
					{
						data: {
							prop1: 'foo',
							prop2: 'bar',
						},
					},
				]);

				expect(myStub.getCall(0).args[1]).to.deep.equal({
					select: {
						models: [
							{
								name: 'junk',
								fields: [
									{
										path: 'store1',
									},
									{
										path: 'store2',
									},
								],
							},
						],
					},
					params: {
						ops: [
							{
								series: 'junk',
								path: 'store2',
								operator: 'eq',
								value: 12,
							},
						],
					},
				});

				expect(myStub.getCall(0).args[2]).to.deep.equal({
					sort: 'field',
				});
			});
		});

		describe('search', function () {
			xit('should work', async function () {
				console.log('TODO');
			});
		});

		describe('externalSearch', function () {
			xit('should work', function () {
				console.log('TODO');
			});
		});
	});
});
