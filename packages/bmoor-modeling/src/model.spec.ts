import {expect} from 'chai';

import {Model} from './model';
import {
	ModelController,
	ModelAdapter,
	InternalDatum,
	ExternalDatum
} from './model.interface';
import {factory} from './model/field/set';

describe('@bmoor-modeling', function () {
	let controller: ModelController<ExternalDatum> = null;
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
