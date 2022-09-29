import {expect} from 'chai';

import {ModelField} from './field';

describe('@bmoor-modeling.ModelField', function () {
	let field: ModelField = null;

	describe('loading a model', function () {
		it('should work with just an external reference', function () {
			field = new ModelField({
				external: 'foo.bar'
			});

			const obj = {
				foo: {
					bar: true
				},
				'foo.bar': 1
			};

			expect(field.internalGetter(obj)).to.equal(true);

			field.internalSetter(obj, false);

			expect(field.internalGetter(obj)).to.equal(false);

			expect(obj).to.deep.equal({
				foo: {
					bar: false
				},
				'foo.bar': 1
			});
		});

		it('should work with just an external reference', function () {
			field = new ModelField({
				external: 'foo.bar',
				internal: 'eins.zwei'
			});

			const obj = {
				eins: {
					zwei: true
				},
				'eins.zwei': 1
			};

			expect(field.internalGetter(obj)).to.equal(true);
			expect(field.externalGetter(obj)).to.equal(undefined);

			field.internalSetter(obj, false);

			expect(field.internalGetter(obj)).to.equal(false);

			expect(obj).to.deep.equal({
				eins: {
					zwei: false
				},
				'eins.zwei': 1
			});
		});

		it('should work with an internal reference', function () {
			field = new ModelField({
				external: 'foo.bar',
				internal: 'eins.zwei'
			});

			const obj = {
				eins: {
					zwei: true
				},
				'eins.zwei': 1
			};

			expect(field.internalGetter(obj)).to.equal(true);
			expect(field.externalGetter(obj)).to.equal(undefined);

			field.internalSetter(obj, false);

			expect(field.internalGetter(obj)).to.equal(false);

			expect(obj).to.deep.equal({
				eins: {
					zwei: false
				},
				'eins.zwei': 1
			});
		});

		it('should work with an storage reference', function () {
			field = new ModelField({
				external: 'foo.bar',
				internal: 'eins.zwei',
				storage: 'hello.world'
			});

			const obj = {
				eins: {
					zwei: true
				},
				'eins.zwei': 1
			};

			expect(field.internalGetter(obj)).to.equal(true);
			expect(field.externalGetter(obj)).to.equal(undefined);

			field.internalSetter(obj, false);

			expect(field.internalGetter(obj)).to.equal(true);

			expect(obj).to.deep.equal({
				eins: {
					zwei: true
				},
				hello: {
					world: false
				},
				'eins.zwei': 1
			});
		});

		it('should work with an isFlat as true', function () {
			field = new ModelField({
				isFlat: true,
				external: 'foo.bar',
				internal: 'eins.zwei',
				storage: 'hello.world'
			});

			const obj = {
				eins: {
					zwei: true
				},
				foo: {
					bar: 'ok'
				},
				'eins.zwei': 1
			};

			expect(field.internalGetter(obj)).to.equal(1);
			expect(field.externalGetter(obj)).to.equal('ok');

			field.internalSetter(obj, false);

			expect(field.internalGetter(obj)).to.equal(1);

			expect(obj).to.deep.equal({
				eins: {
					zwei: true
				},
				foo: {
					bar: 'ok'
				},
				'hello.world': false,
				'eins.zwei': 1
			});
		});
	});
});
