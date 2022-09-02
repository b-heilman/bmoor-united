import {expect} from 'chai';

import {Model} from './model';
import {ModelField} from './model/field';

describe('@bmoor-modeling', function () {
	let security = null;
	let accessors = null;

	beforeEach(function () {
		security = {};
		accessors = {};
	});

	describe('loading a model', function () {
		it('should properly translate from internal to external and back', function () {
			const model = new Model({
				security,
				accessors,
				fields: [
					new ModelField({
						internal: 'field.eins',
						external: 'value1'
					}),
					new ModelField({
						internal: 'field.zwei',
						external: 'other.value2'
					}),
					new ModelField({
						internal: 'value',
						external: 'other.thing'
					})
				]
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
