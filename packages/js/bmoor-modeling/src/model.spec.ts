import {expect} from 'chai';

import {Model} from './model';

describe('@bmoor-modeling::Model', function () {
	describe('::inflate', function () {
		it('should correctly create a typescript format', function () {
			const model = new Model({
				reference: 'junk',
				info: {
					'f-1': {
						type: 'string',
					},
					'f-2': {
						type: 'number',
					},
				},
				structure: {
					foo: {
						bar: 'f-1',
						bar2: 'f-2',
					},
				},
				inflate: {
					hello: {
						world: 'f-1',
					},
					einsZwei: 'f-2',
				},
			});

			expect(
				model.inflate({
					foo: {bar: 1, bar2: 2},
				}),
			).to.deep.equal({
				hello: {
					world: 1,
				},
				einsZwei: 2,
			});

			expect(
				model.fromInflated({
					hello: {
						world: 1,
					},
					einsZwei: 2,
				}),
			).to.deep.equal({
				foo: {bar: 1, bar2: 2},
			});
		});
	});

	describe('::deflate', function () {
		it('should correctly create a typescript format', function () {
			const model = new Model({
				reference: 'junk',
				info: {
					'f-1': {
						type: 'string',
					},
					'f-2': {
						type: 'number',
					},
				},
				structure: {
					foo: {
						bar: 'f-1',
						bar2: 'f-2',
					},
				},
				deflate: {
					hello: {
						world: 'f-1',
					},
					einsZwei: 'f-2',
				},
			});

			expect(
				model.deflate({
					foo: {bar: 1, bar2: 2},
				}),
			).to.deep.equal({
				hello: {
					world: 1,
				},
				einsZwei: 2,
			});

			expect(
				model.fromDeflated({
					hello: {
						world: 1,
					},
					einsZwei: 2,
				}),
			).to.deep.equal({
				foo: {bar: 1, bar2: 2},
			});
		});
	});
});
