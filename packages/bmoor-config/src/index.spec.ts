import {expect} from 'chai';
import {create, Config, ConfigObject, ConfigValue} from './index';

describe('@bmoor/config', function () {
	describe('Config', function () {
		it('should basic construction', function () {
			const cfg = new Config({
				obj: new ConfigObject<ConfigValue>({
					foo: 'bar'
				}),
				hello: 'world',
				eins: new Config({
					zwei: 2
				})
			});

			expect(cfg.get('obj')).to.deep.equal({
				foo: 'bar'
			});
			expect(cfg.get('hello')).to.equal('world');
			expect((<Config<ConfigValue>>cfg.get('eins')).get('zwei')).to.equal(
				2
			);
		});

		describe('::override', function () {
			it('should basic construction', function () {
				const cfg = new Config<ConfigValue>({
					obj: new ConfigObject<ConfigValue>({
						foo: 'bar'
					}),
					hello: 'world',
					eins: new Config({
						one: 1,
						zwei: 2
					})
				});

				const other = cfg.override({
					junk: 'value',
					hello: 'world2',
					eins: new Config<ConfigValue>({
						zwei: 22,
						blah: ':-('
					})
				});

				expect(other.get('obj')).to.deep.equal({
					foo: 'bar'
				});
				expect(other.get('hello')).to.equal('world2');
				expect(other.get('junk')).to.equal('value');
				expect(
					(<Config<ConfigValue>>cfg.get('eins')).get('zwei')
				).to.equal(2);
				expect(
					(<Config<ConfigValue>>other.get('eins')).get('one')
				).to.equal(1);
				expect(
					(<Config<ConfigValue>>other.get('eins')).get('zwei')
				).to.equal(22);
				expect(
					(<Config<ConfigValue>>other.get('eins')).get('blah')
				).to.equal(':-(');
			});
		});
	});

	describe('create', function () {
		it('should allow the defining and reading of properties', function () {
			interface cfgI {
				foo: string;
				hello: {
					world: number;
				};
			}

			const cfg = create<cfgI>({
				foo: 'bar',
				hello: {
					world: 1
				}
			});

			expect(cfg.get('foo')).to.equal('bar');
			expect(cfg.get('hello')).to.equal(undefined);
			expect(cfg.get('hello.world')).to.equal(1);
		});
	});
});
