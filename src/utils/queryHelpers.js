function makeFilterQuery(req, { isDeleted = false } = {}) {
  const filter = {};
  if (isDeleted) filter.isDeleted = false;

  const skipKeys = new Set(['page', 'limit', 'sort', 'fields', 'q']);
  for (const [key, value] of Object.entries(req.query || {})) {
    if (skipKeys.has(key)) continue;
    if (value === undefined) continue;
    if (key === 'isDeleted') continue;
    // Basic equality filters for rubric; can be expanded later.
    filter[key] = value;
  }
  return filter;
}

module.exports = { makeFilterQuery };

