import {expect} from 'chai';
import {useFakeTimers} from 'sinon';

import {ModelField} from './field';

describe('@bmoor-modeling.ModelField', function () {
	let field: ModelField = null;
	let clock = null;

	beforeEach(function () {
		clock = useFakeTimers(Date.now());
	});

	afterEach(function () {
		clock.restore();
	});

	describe('toTypescript', function () {
		it('should simply work', function () {
			field = new ModelField({
				external: 'path',
				usage: 'json',
			});
		});
	});

	describe('usages', function () {
		it('should work as json', function () {
			field = new ModelField({
				external: 'path',
				usage: 'json',
			});

			const t1 = field.actions.inflate({
				path: '{"foo":"bar"}',
			});

			expect(t1).to.deep.equal({
				path: {
					foo: 'bar',
				},
			});

			const t2 = field.actions.deflate({
				path: {
					foo: 'bar',
				},
			});

			expect(t2).to.deep.equal({
				path: '{"foo":"bar"}',
			});
		});

		it('should work as a monitor', function () {
			field = new ModelField({
				external: 'path',
				usage: 'monitor',
				config: {
					target: 'other',
				},
			});

			const t1 = field.actions.deflate({
				other: 'ok',
			});

			expect(t1).to.deep.equal({
				path: Date.now(),
				other: 'ok',
			});

			const t2 = field.actions.deflate({});

			expect(t2).to.deep.equal({});
		});
	});

	describe('loading a model', function () {
		it('should work with just an external reference', function () {
			field = new ModelField({
				external: 'foo.bar',
			});

			const obj = {
				foo: {
					bar: true,
				},
				'foo.bar': 1,
			};

			expect(field.internalGetter(obj)).to.equal(true);

			field.internalSetter(obj, false);

			expect(field.internalGetter(obj)).to.equal(false);

			expect(obj).to.deep.equal({
				foo: {
					bar: false,
				},
				'foo.bar': 1,
			});
		});

		it('should work with just an external reference', function () {
			field = new ModelField({
				external: 'foo.bar',
				internal: 'eins.zwei',
			});

			const obj = {
				eins: {
					zwei: true,
				},
				'eins.zwei': 1,
			};

			expect(field.internalGetter(obj)).to.equal(true);
			expect(field.externalGetter(obj)).to.equal(undefined);

			field.internalSetter(obj, false);

			expect(field.internalGetter(obj)).to.equal(false);

			expect(obj).to.deep.equal({
				eins: {
					zwei: false,
				},
				'eins.zwei': 1,
			});
		});

		it('should work with an internal reference', function () {
			field = new ModelField({
				external: 'foo.bar',
				internal: 'eins.zwei',
			});

			const obj = {
				eins: {
					zwei: true,
				},
				'eins.zwei': 1,
			};

			expect(field.internalGetter(obj)).to.equal(true);
			expect(field.externalGetter(obj)).to.equal(undefined);

			field.internalSetter(obj, false);

			expect(field.internalGetter(obj)).to.equal(false);

			expect(obj).to.deep.equal({
				eins: {
					zwei: false,
				},
				'eins.zwei': 1,
			});
		});

		it('should work with an storage reference', function () {
			field = new ModelField({
				external: 'foo.bar',
				internal: 'eins.zwei',
				storage: 'hello.world',
			});

			const obj = {
				eins: {
					zwei: true,
				},
				'eins.zwei': 1,
			};

			expect(field.internalGetter(obj)).to.equal(true);
			expect(field.externalGetter(obj)).to.equal(undefined);

			field.internalSetter(obj, false);

			expect(field.internalGetter(obj)).to.equal(true);

			expect(obj).to.deep.equal({
				eins: {
					zwei: true,
				},
				hello: {
					world: false,
				},
				'eins.zwei': 1,
			});
		});

		it('should work with an isFlat as true', function () {
			field = new ModelField({
				isFlat: true,
				external: 'foo.bar',
				internal: 'eins.zwei',
				storage: 'hello.world',
			});

			const obj = {
				eins: {
					zwei: true,
				},
				foo: {
					bar: 'ok',
				},
				'eins.zwei': 1,
			};

			expect(field.internalGetter(obj)).to.equal(1);
			expect(field.externalGetter(obj)).to.equal('ok');

			field.internalSetter(obj, false);

			expect(field.internalGetter(obj)).to.equal(1);

			expect(obj).to.deep.equal({
				eins: {
					zwei: true,
				},
				foo: {
					bar: 'ok',
				},
				'hello.world': false,
				'eins.zwei': 1,
			});
		});
	});

	describe('actions', function () {
		it('create', function () {
			field = new ModelField({
				external: 'path',
				onCreate(datum, setter, getter) {
					setter(datum, getter(datum) + '+1');
				},
			});

			const t1 = field.actions.create({
				path: 'hello',
			});

			expect(t1).to.deep.equal({
				path: 'hello+1',
			});
		});

		it('read', function () {
			field = new ModelField({
				external: 'path',
				onRead(datum, setter, getter) {
					setter(datum, getter(datum) + '+1');
				},
			});

			const t1 = field.actions.read({
				path: 'hello',
			});

			expect(t1).to.deep.equal({
				path: 'hello+1',
			});
		});

		it('update', function () {
			field = new ModelField({
				external: 'path',
				onUpdate(datum, setter, getter) {
					setter(datum, getter(datum) + '+1');
				},
			});

			const t1 = field.actions.update({
				path: 'hello',
			});

			expect(t1).to.deep.equal({
				path: 'hello+1',
			});
		});

		it('delete', function () {
			field = new ModelField({
				external: 'path',
				onDelete(datum, setter, getter) {
					setter(datum, getter(datum) + '+1');
				},
			});

			const t1 = field.actions.delete({
				path: 'hello',
			});

			expect(t1).to.deep.equal({
				path: 'hello+1',
			});
		});

		it('inflate', function () {
			field = new ModelField({
				external: 'path',
				onInflate(datum, setter, getter) {
					setter(datum, getter(datum) + '+1');
				},
			});

			const t1 = field.actions.inflate({
				path: 'hello',
			});

			expect(t1).to.deep.equal({
				path: 'hello+1',
			});
		});

		it('deflate', function () {
			field = new ModelField({
				external: 'path',
				onDeflate(datum, setter, getter) {
					setter(datum, getter(datum) + '+1');
				},
			});

			const t1 = field.actions.deflate({
				path: 'hello',
			});

			expect(t1).to.deep.equal({
				path: 'hello+1',
			});
		});
	});
});
