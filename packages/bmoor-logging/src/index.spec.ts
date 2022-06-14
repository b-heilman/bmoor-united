import {expect} from 'chai';
import {Logging, LogInfo, ERROR, INFO} from './index';

describe('@bmoor/logging', function () {
	describe('Logging', function () {
		describe('::log', function () {
			it('should correctly dump the data', async function () {
				let logged = false;

				const logger = new Logging({
					write: async (type: symbol, info: LogInfo) => {
						logged = true;

						expect(type).to.equal(INFO);

						expect(info).to.deep.include({
							// TODO: test timestamp
							message: 'hello-world'
						});
					},
					level: INFO
				});

				await logger.log(
					{
						message: 'hello-world'
					},
					INFO
				);

				expect(logged).to.equal(true);
			});

			it('should not fire if below log level', async function () {
				let logged = false;

				const logger = new Logging({
					write: async () => {
						logged = true;

						throw new Error('never should be here');
					},
					level: ERROR
				});

				await logger.log(
					{
						message: 'hello-world'
					},
					INFO
				);

				expect(logged).to.equal(false);
			});
		});

		describe('::report', function () {
			it('should correctly dump the error', async function () {
				let logged = false;

				const logger = new Logging({
					write: async (type: symbol, info: LogInfo) => {
						logged = true;

						expect(type).to.equal(INFO);

						expect(info).to.deep.include({
							message: 'ok'
						});
					},
					level: INFO
				});

				await logger.report(new Error('ok'), INFO);

				expect(logged).to.equal(true);
			});
		});

		describe('::comment', function () {
			it('should correctly dump the error', async function () {
				let logged = false;

				const logger = new Logging({
					write: async (type: symbol, info: LogInfo) => {
						logged = true;

						expect(type).to.equal(INFO);

						expect(info).to.deep.include({
							message: 'foo bar',
							invocation: {
								requestId: '123-456',
								method: 'POST:Malone'
							}
						});
					},
					level: INFO
				});

				await logger.comment(
					'foo bar',
					{
						requestId: '123-456',
						method: 'POST:Malone'
					},
					INFO
				);

				expect(logged).to.equal(true);
			});
		});
	});
});
