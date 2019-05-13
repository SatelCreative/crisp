import { normalizeQuery } from './index';

describe('normalizeQuery()', () => {
  it('generates expected output', () => {
    const seed = 'all';
    const params = { page: 1, view: 'crispy' };

    expect(normalizeQuery(seed, params)).toEqual({
      key: '19432497',
      query: 'page=1&view=crispy'
    });
  });

  it('handles empty case', () => {
    expect(normalizeQuery('', {})).toEqual({
      key: '2259123405',
      query: ''
    });
  });

  it('url encodes characters', () => {
    const params = { page: 1, view: 'cri%sp^y' };

    expect(normalizeQuery('', params)).toEqual({
      key: '955844805',
      query: 'page=1&view=cri%25sp%5Ey'
    });
  });

  it('normalizes param orders', () => {
    const paramsOptions: any[] = [
      {
        page: 1,
        size: 56,
        view: 'crispy',
        color: 'green'
      },
      {
        color: 'green',
        page: 1,
        view: 'crispy',
        size: 56
      },
      {
        page: 1,
        color: 'green',
        size: 56,
        view: 'crispy'
      }
    ];

    const keys = paramsOptions.map<string>(
      params => normalizeQuery('', params).key
    );

    expect(keys.every(value => value === keys[0])).toEqual(true);
  });
});
