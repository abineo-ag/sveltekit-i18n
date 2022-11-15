import plugin from '../src';

describe('plugin', () => {
	it('returns valid rollup plugin', () => {
		const sut = plugin();
		expect(sut.name).toBeDefined();
	});
});
