import {expect} from 'chai';

import {Path} from './path';

describe('@bmoor/path', function () {
	describe('Path', function () {
		it('should work with a normal path', function () {
			const path = new Path('hello.world.friend');
			const tmp = {
				hello: {
					world: {
						friend: 10,
					},
				},
			};

			expect(path.read(tmp)).to.equal(10);

			path.write(tmp, 20);

			expect(tmp).to.deep.equal({
				hello: {
					world: {
						friend: 20,
					},
				},
			});
		});

		it('should work an array in the path', function () {
			const path = new Path('hello.world[].friend');
			const tmp = {
				hello: {
					world: [
						{
							friend: 10,
						},
					],
				},
			};

			expect(path.read(tmp)).to.deep.equal([10]);

			path.write(tmp, [20]);

			expect(tmp).to.deep.equal({
				hello: {
					world: [
						{
							friend: 20,
						},
					],
				},
			});
		});

		it('should work an object with a special path', function () {
			const path = new Path('hello["world"].friend');
			const tmp = {
				hello: {
					world: {
						friend: 10,
					},
				},
			};

			expect(path.read(tmp)).to.equal(10);

			path.write(tmp, 20);

			expect(tmp).to.deep.equal({
				hello: {
					world: {
						friend: 20,
					},
				},
			});
		});

		it('should work an array and a special path', function () {
			const path = new Path('hello.world[]["friend"]');
			const tmp = {
				hello: {
					world: [
						{
							friend: 10,
						},
					],
				},
			};

			expect(path.read(tmp)).to.deep.equal([10]);

			path.write(tmp, [20]);

			expect(tmp).to.deep.equal({
				hello: {
					world: [
						{
							friend: 20,
						},
					],
				},
			});
		});

		describe('getChain', function () {
			it('should return a tokenized version of the path', function () {
				const path = new Path('hello.world[][]["friend"]');

				expect(path.getChain()).to.deep.equal([
					{
						reference: 'hello',
						type: 'object',
					},
					{
						reference: 'world',
						type: 'array',
					},
					{
						reference: undefined,
						type: 'array',
					},
					{
						reference: 'friend',
						type: 'leaf',
					},
				]);
			});

			it('should return a tokenized version of the path', function () {
				const path = new Path('[]');

				expect(path.getChain()).to.deep.equal([
					{
						reference: undefined,
						type: 'array',
					},
					{
						type: 'leaf',
					},
				]);
			});

			it('should return a tokenized version of the path', function () {
				const path = new Path('path');

				expect(path.getChain()).to.deep.equal([
					{
						reference: 'path',
						type: 'leaf',
					},
				]);
			});
		});
	});
});
