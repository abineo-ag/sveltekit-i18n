import parse, { toResource, getParams } from '../src/parser';

describe('parser', () => {
	it('getParams returns all params with their type defaulting to any', () => {
		const sut = getParams('{alice} {{ bob }}} { foo : bar }');
		console.log(sut);
		expect(sut).toBeDefined();
	});
});
