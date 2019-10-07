import { SearchField } from '../../types';

interface ConstructQuery {
  query: string;
  fields?: SearchField[];
  exact?: boolean;
  and?: boolean;
}

const constructQuery = ({
  query: rawQuery,
  fields,
  exact,
  and
}: ConstructQuery): string => {
  // Storage object
  const query = rawQuery
    .trim()
    .split(/\s+/)
    .filter(term => term !== '');

  // Empty query
  if (!query.length) {
    return rawQuery;
  }

  return query.reduce((acc, term) => {
    let ts = [term];

    if (!exact && term.length > 1) {
      ts.push(`*${term}*`);
    }

    if (fields && fields.length) {
      ts = ts.map(t => fields.map(field => `${field}:${t}`).join(' OR '));
    }

    const next = ts.join(' OR ');

    if (acc === '') {
      return next;
    }

    return `${acc}${and ? ' ' : ' OR '}${next}`;
  }, '');
};

export { constructQuery };
