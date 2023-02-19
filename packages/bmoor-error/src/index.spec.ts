import {expect} from 'chai';

import {assignError, create, extendError} from './index';

describe('@bmoor/error', function () {
	describe('create', function () {
		it('should generate an error', function () {
			const content = {
				response: 'ok',
				code: 'FOO_BAR',
				status: 200,
				context: {
					eins: 1,
				},
				protected: {
					zwei: 2,
				},
			};
			const err = create('foo-bar', content);
			const json = err.toJSON();

			expect(json).to.deep.include(content);

			expect(json.stack).to.deep.equal([content]);
		});
	});

	describe('extendError', function () {
		it('should allow you to define the stack', function () {
			const err = new Error('hello world');

			const content = {
				response: 'ok',
				code: 'FOO_BAR',
				status: 200,
				context: {
					eins: 1,
				},
				protected: {
					zwei: 2,
				},
			};
			const wrap = extendError(err, content);

			extendError(wrap, {
				code: 'FOO_BAR_2',
				context: {
					eins: 10,
				},
			});

			extendError(wrap, {
				code: 'FOO_BAR_3',
				status: 403,
			});

			const json = wrap.toJSON();

			expect(json).to.deep.include({
				response: 'ok',
				code: 'FOO_BAR_3',
				status: 403,
				context: {
					eins: 10,
				},
				protected: {
					zwei: 2,
				},
			});

			expect(json.stack).to.deep.equal([
				content,
				{
					code: 'FOO_BAR_2',
					context: {
						eins: 10,
					},
				},
				{
					code: 'FOO_BAR_3',
					status: 403,
				},
			]);
		});
	});

	describe('assignError', function () {
		it('should allow for assign invocation variables', function () {
			const err = new Error('hello world');

			const content = {
				response: 'ok',
				code: 'FOO_BAR',
				status: 200,
				context: {
					eins: 1,
				},
				protected: {
					zwei: 2,
				},
			};
			const wrap = extendError(err, content);

			const info = {
				requestId: '123-456-789',
				method: 'POST:somethere/outthere',
				userId: 'brian_heilman',
			};
			assignError(wrap, info);

			const json = wrap.toJSON();

			expect(json).to.deep.include(info);
		});
	});
});
