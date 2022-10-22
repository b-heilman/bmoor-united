import {expect} from 'chai';
import {stub} from 'sinon';

import {ContextSecurityInterface} from '@bmoor/context';

import {Model} from './model';
import {factory} from './model/field/set';
import {ModelControllerInterface} from './model/controller.interface';
import {ModelAdapterInterface} from './model/adapter.interface';
import {ModelAccessorInterface} from './model/accessor.interface';
import {ModelValidatorInterface} from './model/validator.interface';

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type ExternalRead = any;

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type ExternalReference = any;

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type ExternalCreate = any;

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type ExternalUpdate = any;

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type ExternalSearch = any;

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type InternalRead = any;

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type InternalReference = any;

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type InternalCreate = any;

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type InternalUpdate = any;

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type InternalSearch = any;

describe('@bmoor-modeling', function () {
	let controller: ModelControllerInterface<
		ExternalRead,
		ExternalReference,
		ExternalCreate,
		ExternalUpdate
	> = null;
	let adapter: ModelAdapterInterface<
		InternalReference,
		InternalRead,
		InternalCreate,
		InternalUpdate,
		InternalSearch
	> = null;
	let accessor: ModelAccessorInterface<
		ExternalRead,
		ExternalReference,
		InternalRead,
		InternalReference
	> = null;
	let validator: ModelValidatorInterface<
		ExternalReference,
		ExternalCreate,
		ExternalUpdate
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
		validator = {
			validateCreate() {
				return null;
			},
			validateUpdate() {
				return null;
			}
		};
		accessor = {
			getInternalKey() {
				return 'ok';
			},
			getExternalKey() {
				return 'ok';
			}
		};
	});

	describe('actions', function () {
		describe('create', function () {
			it('should work', function () {
				const model = new Model({
					name: 'junk',
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
					name: 'junk',
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
					name: 'junk',
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

		describe('inflate', function () {
			it('should work', function () {
				const model = new Model({
					name: 'junk',
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
					name: 'junk',
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

	describe('crud methods', function () {
		describe('create', function () {
			it('should work without a validator', async function () {
				const model = new Model({
					name: 'junk',
					controller,
					adapter,
					accessor,
					validator,
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

			it('should work with a validator', async function () {
				const model = new Model({
					name: 'junk',
					controller,
					adapter,
					accessor,
					validator,
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

				const myStub = stub(validator, 'validateCreate').resolves(
					new Error('fail-whale')
				);

				let failed = false;
				try {
					await model.create(
						[
							{
								f1: 'val-1',
								f2: 'val-2'
							}
						],
						ctx
					);
				} catch (ex) {
					failed = true;
					expect(ex.message).to.equal('fail-whale');
				}

				expect(failed).to.equal(true);

				expect(myStub.getCall(0).args[0]).to.deep.equal([
					{
						f1: 'val-1',
						f2: 'val-2'
					}
				]);
			});

			it('should work with actions', async function () {
				const model = new Model({
					name: 'junk',
					controller,
					adapter,
					accessor,
					validator,
					fields: factory(
						{
							external: 'f1',
							onCreate: (datum, setter) => {
								setter(datum, 'value');
							}
						},
						{
							external: 'f2',
							internal: 'f3',
							usage: 'json'
						}
					)
				});

				const myStub = stub(adapter, 'create').resolves([
					{
						f1: 'foo',
						f3: '{"a":"value"}'
					}
				]);

				const res = await model.create(
					[
						{
							f2: {
								foo: 'bar'
							}
						}
					],
					ctx
				);

				expect(res).to.deep.equal([
					{
						f1: 'foo',
						f2: {
							a: 'value'
						}
					}
				]);

				expect(myStub.getCall(0).args[0]).to.deep.equal([
					{
						f1: 'value',
						f3: '{"foo":"bar"}'
					}
				]);
			});
		});

		describe('read', function () {
			it('should work without a validator', async function () {
				const model = new Model({
					name: 'junk',
					controller,
					adapter,
					accessor,
					validator,
					fields: factory(
						{
							external: 'key',
							internal: 'id'
						},
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
						f3: 'bar',
						id: 123
					}
				]);

				const res = await model.read([{key: 12}], ctx);

				expect(res).to.deep.equal([
					{
						f1: 'foo',
						f2: 'bar',
						key: 123
					}
				]);

				expect(myStub.getCall(0).args[0]).to.deep.equal([
					{
						id: 12
					}
				]);
			});

			xit('should work with actions', function () {
				throw new Error('boo');
			});
		});

		describe('update', function () {
			it('should work without a validator', async function () {
				const model = new Model({
					name: 'junk',
					controller,
					adapter,
					accessor,
					validator,
					fields: factory(
						{
							external: 'key',
							internal: 'id'
						},
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
							ref: {
								key: 123
							},
							delta: {
								f1: 'val-1',
								f2: 'val-2'
							}
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
						ref: {
							id: 123
						},
						delta: {
							f1: 'val-1',
							f3: 'val-2'
						}
					}
				]);
			});

			it('should work with a validator', async function () {
				const model = new Model({
					name: 'junk',
					controller,
					adapter,
					accessor,
					validator,
					fields: factory(
						{
							external: 'key',
							internal: 'id'
						},
						{
							external: 'f1'
						},
						{
							external: 'f2',
							internal: 'f3'
						}
					)
				});

				const myStub = stub(validator, 'validateUpdate').resolves(
					new Error('fail-whale')
				);

				let failed = false;
				try {
					await model.update(
						[
							{
								ref: {
									key: 123
								},
								delta: {
									f1: 'val-1',
									f2: 'val-2'
								}
							}
						],
						ctx
					);
				} catch (ex) {
					failed = true;
					expect(ex.message).to.equal('fail-whale');
				}

				expect(failed).to.equal(true);

				expect(myStub.getCall(0).args[0]).to.deep.equal([
					{
						ref: {
							key: 123
						},
						delta: {
							f1: 'val-1',
							f2: 'val-2'
						}
					}
				]);
			});

			it('should work with actions', async function () {
				const model = new Model({
					name: 'junk',
					controller,
					adapter,
					accessor,
					validator,
					fields: factory(
						{
							external: 'key'
						},
						{
							external: 'f1',
							onUpdate: (datum, setter) => {
								setter(datum, 'value');
							}
						},
						{
							external: 'f2',
							internal: 'f3',
							usage: 'json'
						}
					)
				});

				const myStub = stub(adapter, 'update').resolves([
					{
						f1: 'foo',
						f3: '{"a":"value"}'
					}
				]);

				const res = await model.update(
					[
						{
							ref: {
								key: 123
							},
							delta: {
								f2: {
									foo: 'bar'
								}
							}
						}
					],
					ctx
				);

				expect(res).to.deep.equal([
					{
						f1: 'foo',
						f2: {
							a: 'value'
						}
					}
				]);

				expect(myStub.getCall(0).args[0]).to.deep.equal([
					{
						ref: {
							key: 123
						},
						delta: {
							f1: 'value',
							f3: '{"foo":"bar"}'
						}
					}
				]);
			});
		});

		describe('delete', function () {
			it('should work without a validator', async function () {
				const model = new Model({
					name: 'junk',
					controller,
					adapter,
					accessor,
					validator,
					fields: factory(
						{
							external: 'key',
							internal: 'id'
						},
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

				const res = await model.delete(
					[
						{
							key: 123
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
						id: 123
					}
				]);
			});

			xit('should work with actions', function () {
				throw new Error('boo');
			});
		});
	});

	describe('model', function () {
		it('should properly translate from internal to external and back', function () {
			const model = new Model({
				name: 'junk',
				controller,
				adapter,
				accessor,
				validator,
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

			const original = {
				field: {
					eins: 1,
					zwei: 2
				},
				value: 'foo-bar'
			};

			const external = model.convertToExternal(original, ctx);

			const internal = model.convertToInternal(external, ctx);

			expect(external).to.deep.equal({
				value1: 1,
				other: {
					value2: 2,
					thing: 'foo-bar'
				}
			});

			expect(internal).to.deep.equal(original);
		});
	});

	describe('::toTypeScript()', function(){
		it.only('should correctly create a typescript format', function(){
			const model = new Model({
				name: 'junk',
				controller,
				adapter,
				accessor,
				validator,
				fields: factory(
					{
						external: 'key',
						internal: 'id',
						usage: 'key',
						jsonType: 'number'
					},
					{
						external: 'field1',
						internal: 'field1',
						jsonType: 'string'
					},
					{
						external: 'other.field2',
						internal: 'field2',
						jsonType: 'number'
					}
				)
			});

			const ts = model.toTypescript();
			const expected = `
				export interface JunkExternalRead{
					key: number,
					field1: string,
					other: {
							field2: number
					}
				}
				export interface JunkExternalReference{
						key: number
				}
				export interface JunkExternalCreate{
						field1: string,
						other: {
								field2: number
						}
				}
				export interface JunkExternalUpdate{
						field1?: string,
						other: {
								field2?: number
						}
				}
				export interface JunkExternalSearch{
				
				}
				export interface JunkInternalRead{
						id: number,
						field1: string,
						field2: number
				}
				export interface JunkInternalReference{
						id: number
				}
				export interface JunkInternalCreate{
						field1: string,
						field2: number
				}
				export interface JunkInternalUpdate{
						field1?: string,
						field2?: number
				}
				export interface JunkInternalSearch{
				
				}
			`;
			
			expect(ts.replace(/\s+/g, ''))
				.to.equal(expected.replace(/\s+/g, ''));
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
			const model = new Model<
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
				name: 'junk',
				controller,
				adapter,
				accessor,
				validator,
				fields: factory(
					{
						external: 'key',
						internal: 'id',
						usage: 'key',
						jsonType: 'number'
					},
					{
						external: 'field1',
						internal: 'field1',
						jsonType: 'string'
					},
					{
						external: 'other.field2',
						internal: 'field2',
						jsonType: 'number'
					}
				)
			});

			adapter.read = async function (): Promise<InternalReadGeneric[]> {
				return [
					{
						id: 123,
						field1: 'hello-world',
						field2: 789
					}
				];
			};

			const res1 = await model.read([], ctx);
			expect(res1).to.deep.equal([
				{
					key: 123,
					field1: 'hello-world',
					other: {
						field2: 789
					}
				}
			]);

			const myStub = stub();

			myStub.resolves([
				{
					id: 1233,
					field1: 'hello-world-3',
					field2: 7893
				}
			]);

			adapter.create = myStub;

			const res2 = await model.create(
				[
					{
						field1: 'hello-world-2',
						other: {
							field2: 7892
						}
					}
				],
				ctx
			);
			expect(res2).to.deep.equal([
				{
					key: 1233,
					field1: 'hello-world-3',
					other: {
						field2: 7893
					}
				}
			]);

			expect(myStub.getCall(0).args[0]).to.deep.equal([
				{
					field1: 'hello-world-2',
					field2: 7892
				}
			]);
		});


	});
});
