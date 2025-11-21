async function* request(url, context) {
  const {
    chunkSize, cacheReload, sheetName, fetch,
  } = context;
  // eslint-disable-next-line no-await-in-loop
  for (let offset = 0, total = Infinity; offset < total; offset += chunkSize) {
    const params = new URLSearchParams(`offset=${offset}&limit=${chunkSize}`);
    if (sheetName) params.append('sheet', sheetName);
    // eslint-disable-next-line no-await-in-loop
    const resp = await fetch(`${url}?${params.toString()}`, { cache: cacheReload ? 'reload' : 'default' });
    if (resp.ok) {
      // eslint-disable-next-line no-await-in-loop
      const json = await resp.json();
      total = json.total;
      context.total = total;
      // eslint-disable-next-line no-restricted-syntax
      for (const entry of json.data) yield entry;
    } else {
      return;
    }
  }
}

function withFetch(upstream, context, fetch) {
  context.fetch = fetch;
  return upstream;
}

function withHtmlParser(upstream, context, parseHtml) {
  context.parseHtml = parseHtml;
  return upstream;
}

function chunks(upstream, context, chunkSize) {
  context.chunkSize = chunkSize;
  return upstream;
}

function sheet(upstream, context, sheetName) {
  context.sheetName = sheetName;
  return upstream;
}

async function* skip(upstream, context, from) {
  let skipped = 0;
  // eslint-disable-next-line no-restricted-syntax
  for await (const entry of upstream) {
    if (skipped < from) {
      skipped += 1;
    } else {
      yield entry;
    }
  }
}

async function* limit(upstream, context, aLimit) {
  let yielded = 0;
  // eslint-disable-next-line no-restricted-syntax
  for await (const entry of upstream) {
    yield entry;
    yielded += 1;
    if (yielded === aLimit) {
      return;
    }
  }
}

async function* map(upstream, context, fn, maxInFlight = 5) {
  const promises = [];
  // eslint-disable-next-line no-restricted-syntax
  for await (const entry of upstream) {
    promises.push(fn(entry));
    if (promises.length === maxInFlight) {
      const results = await Promise.all(promises);
      // eslint-disable-next-line no-restricted-syntax
      for (const result of results) {
        if (result) yield result;
      }
      promises.splice(0, promises.length);
    }
  }
  const results = await Promise.all(promises);
  // eslint-disable-next-line no-restricted-syntax
  for (const result of results) {
    if (result) yield result;
  }
}

async function* filter(upstream, context, fn) {
  // eslint-disable-next-line no-restricted-syntax
  for await (const entry of upstream) {
    if (fn(entry)) {
      yield entry;
    }
  }
}

function slice(upstream, context, from, to) {
  return limit(skip(upstream, context, from), context, to - from);
}

function follow(upstream, context, name, newName, maxInFlight = 5) {
  const { fetch, parseHtml } = context;
  return map(upstream, context, async (entry) => {
    const value = entry[name];
    if (value) {
      const resp = await fetch(value);
      return { ...entry, [newName || name]: resp.ok ? parseHtml(await resp.text()) : null };
    }
    return entry;
  }, maxInFlight);
}

async function all(upstream) {
  const result = [];
  // eslint-disable-next-line no-restricted-syntax
  for await (const entry of upstream) {
    result.push(entry);
  }
  return result;
}

async function first(upstream) {
  /* eslint-disable-next-line no-unreachable-loop, no-restricted-syntax */
  for await (const entry of upstream) {
    return entry;
  }
  return null;
}

// Helper

function assignOperations(generator, context) {
  // operations that return a new generator
  function createOperation(fn) {
    return (...rest) => assignOperations(fn.apply(null, [generator, context, ...rest]), context);
  }
  const operations = {
    skip: createOperation(skip),
    limit: createOperation(limit),
    slice: createOperation(slice),
    map: createOperation(map),
    filter: createOperation(filter),
    follow: createOperation(follow),
  };

  // functions that either return the upstream generator or no generator at all
  const functions = {
    chunks: chunks.bind(null, generator, context),
    all: all.bind(null, generator, context),
    first: first.bind(null, generator, context),
    withFetch: withFetch.bind(null, generator, context),
    withHtmlParser: withHtmlParser.bind(null, generator, context),
    sheet: sheet.bind(null, generator, context),
  };

  Object.assign(generator, operations, functions);
  Object.defineProperty(generator, 'total', { get: () => context.total });
  return generator;
}

export default function fetchHelper(url) {
  let chunkSize = 255;
  let cacheReload = false;
  const fetch = (...rest) => window.fetch.apply(null, rest);
  const parseHtml = (html) => new window.DOMParser().parseFromString(html, 'text/html');

  try {
    if ('connection' in window.navigator && window.navigator.connection.saveData === true) {
      chunkSize = 64;
    }

    const entries = performance.getEntriesByType('navigation');
    const reloads = entries.filter((entry) => entry.type === 'reload');
    if (reloads.length > 0) cacheReload = true;
  } catch { /* ignore */ }

  const context = {
    chunkSize, cacheReload, fetch, parseHtml,
  };
  const generator = request(url, context);

  return assignOperations(generator, context);
}
