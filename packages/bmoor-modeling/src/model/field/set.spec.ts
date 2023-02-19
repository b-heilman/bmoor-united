import {expect} from 'chai';
import {useFakeTimers} from 'sinon';

import {ModelFieldSet, factory} from './set';

describe('@bmoor-modeling.ModelFieldSet', function () {
	let fieldSet: ModelFieldSet = null;
	let clock = null;

	beforeEach(function () {
		clock = useFakeTimers(Date.now());
	});

	afterEach(function () {
		clock.restore();
	});

	describe('typescript', function () {
		it('should work as json', function () {
			fieldSet = factory(
				{
					external: 'root',
					jsonType: 'string',
					usage: 'key',
				},
				{
					external: 'path.eins',
					jsonType: 'string',
				},
				{
					external: 'path.zwei',
					internal: 'p2',
					jsonType: 'number',
				},
			);

			const res = fieldSet.toTypescript();

			for (const key in res) {
				const base = res[key];

				for (const k2 in base) {
					base[k2] = base[k2].replace(/\s/g, '');
				}
			}

			expect(res).to.deep.equal({
				external: {
					read: `{
						root: string,
						path: {
							eins: string,
							zwei: number
						}
					}`.replace(/\s/g, ''),
					create: `{
						path: {
							eins: string,
							zwei: number
						}
					}`.replace(/\s/g, ''),
					reference: `{
						root: string
					}`.replace(/\s/g, ''),
					update: `{
						path: {
							eins?: string,
							zwei?: number
						}
					}`.replace(/\s/g, ''),
					search: '{}',
				},
				internal: {
					read: `{
						root: string,
						path: {
							eins: string
						},
						p2: number
					}`.replace(/\s/g, ''),
					create: `{
						path: {
							eins: string
						},
						p2: number
					}`.replace(/\s/g, ''),
					reference: `{
						root: string
					}`.replace(/\s/g, ''),
					update: `{
						path: {
							eins?: string
						},
						p2?: number
					}`.replace(/\s/g, ''),
					search: '{}',
				},
			});
		});
	});
});
