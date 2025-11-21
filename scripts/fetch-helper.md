# Fetch Helper

A powerful, chainable utility for fetching and processing paginated data from APIs with automatic chunking, filtering, mapping, and data transformation capabilities.

## Overview

`fetchHelper` provides a fluent API for working with paginated data sources. It uses async generators to efficiently stream data in chunks, reducing memory footprint and improving performance when working with large datasets.

## Features

- **Automatic Pagination**: Handles paginated API responses automatically
- **Memory Efficient**: Streams data using async generators instead of loading everything at once
- **Chainable API**: Compose operations using a fluent interface
- **Parallel Processing**: Control concurrency with `maxInFlight` parameter
- **Smart Caching**: Detects page reloads and adjusts cache strategy
- **Data Saver Mode**: Reduces chunk size on slow connections
- **Type-Safe Operations**: Skip, limit, slice, filter, map, and follow operations

## Basic Usage

```javascript
import fetchHelper from './fetch-helper.js';

// Fetch all data from a paginated API
const data = await fetchHelper('https://api.example.com/data.json').all();

// Get first item only
const firstItem = await fetchHelper('https://api.example.com/data.json').first();
```

## API Reference

### Core Methods

#### `fetchHelper(url)`
Creates a new fetch helper instance for the given URL.

**Parameters:**
- `url` (string): The API endpoint URL

**Returns:** A chainable generator with operation methods

---

### Configuration Methods

#### `.chunks(size)`
Sets the chunk size for pagination requests.

**Parameters:**
- `size` (number): Number of items to fetch per request

**Default:** 255 (or 64 on slow connections)

**Example:**
```javascript
fetchHelper('https://api.example.com/data.json')
  .chunks(100)
  .all();
```

#### `.sheet(sheetName)`
Specifies which sheet to fetch from (for spreadsheet APIs).

**Parameters:**
- `sheetName` (string): Name of the sheet

**Example:**
```javascript
fetchHelper('https://api.example.com/spreadsheet.json')
  .sheet('products')
  .all();
```

#### `.withFetch(customFetch)`
Provides a custom fetch function (useful for testing or adding middleware).

**Parameters:**
- `customFetch` (function): Custom fetch implementation

**Example:**
```javascript
const customFetch = (url) => fetch(url, { credentials: 'include' });

fetchHelper('https://api.example.com/data.json')
  .withFetch(customFetch)
  .all();
```

#### `.withHtmlParser(parser)`
Provides a custom HTML parser for the `follow()` method.

**Parameters:**
- `parser` (function): Custom HTML parser function

---

### Data Operations

#### `.skip(count)`
Skips the first N items in the stream.

**Parameters:**
- `count` (number): Number of items to skip

**Example:**
```javascript
// Skip first 10 items
const data = await fetchHelper('https://api.example.com/data.json')
  .skip(10)
  .all();
```

#### `.limit(count)`
Limits the results to N items.

**Parameters:**
- `count` (number): Maximum number of items to return

**Example:**
```javascript
// Get only 5 items
const data = await fetchHelper('https://api.example.com/data.json')
  .limit(5)
  .all();
```

#### `.slice(from, to)`
Extracts a slice of items (like Array.slice).

**Parameters:**
- `from` (number): Start index (inclusive)
- `to` (number): End index (exclusive)

**Example:**
```javascript
// Get items 10-20
const data = await fetchHelper('https://api.example.com/data.json')
  .slice(10, 20)
  .all();
```

#### `.filter(predicate)`
Filters items based on a predicate function.

**Parameters:**
- `predicate` (function): Function that returns true to keep the item

**Example:**
```javascript
// Get only active users
const activeUsers = await fetchHelper('https://api.example.com/users.json')
  .filter(user => user.status === 'active')
  .all();
```

#### `.map(transform, maxInFlight = 5)`
Transforms each item using an async or sync function.

**Parameters:**
- `transform` (function): Transformation function (can be async)
- `maxInFlight` (number): Maximum concurrent operations (default: 5)

**Example:**
```javascript
// Transform data
const processed = await fetchHelper('https://api.example.com/data.json')
  .map(item => ({
    ...item,
    fullName: `${item.firstName} ${item.lastName}`
  }))
  .all();

// Async transformation with API calls
const enriched = await fetchHelper('https://api.example.com/users.json')
  .map(async (user) => {
    const details = await fetch(`/api/details/${user.id}`).then(r => r.json());
    return { ...user, details };
  }, 10) // Process 10 concurrent requests
  .all();
```

#### `.follow(fieldName, newFieldName, maxInFlight = 5)`
Follows URLs in a field and fetches their content, parsing as HTML.

**Parameters:**
- `fieldName` (string): Field containing the URL to follow
- `newFieldName` (string): Optional field name for the fetched content (defaults to fieldName)
- `maxInFlight` (number): Maximum concurrent requests (default: 5)

**Example:**
```javascript
// Fetch and parse linked pages
const data = await fetchHelper('https://api.example.com/articles.json')
  .follow('url', 'content', 10)
  .all();

// Each item now has a 'content' field with parsed HTML document
```

---

### Terminal Operations

#### `.all()`
Collects all items into an array.

**Returns:** Promise<Array>

**Example:**
```javascript
const allItems = await fetchHelper('https://api.example.com/data.json').all();
```

#### `.first()`
Returns only the first item.

**Returns:** Promise<Object | null>

**Example:**
```javascript
const firstItem = await fetchHelper('https://api.example.com/data.json').first();
```

---

### Properties

#### `.total`
Gets the total number of items available (only available after first chunk is fetched).

**Example:**
```javascript
const helper = fetchHelper('https://api.example.com/data.json');
const data = await helper.limit(10).all();
console.log(`Showing 10 of ${helper.total} items`);
```

---

## Advanced Examples

### Pagination with Filtering and Mapping
```javascript
// Get active users, transform their data, and limit to 50 results
const users = await fetchHelper('https://api.example.com/users.json')
  .filter(user => user.status === 'active')
  .map(user => ({
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email
  }))
  .limit(50)
  .all();
```

### Fetching with Custom Chunk Size
```javascript
// Fetch in smaller chunks for slower connections
const data = await fetchHelper('https://api.example.com/large-dataset.json')
  .chunks(50)
  .all();
```

### Complex Data Pipeline
```javascript
// Skip first 100, get next 50, filter, transform, and fetch related data
const result = await fetchHelper('https://api.example.com/products.json')
  .skip(100)
  .limit(50)
  .filter(product => product.price < 100)
  .map(product => ({ ...product, discounted: product.price * 0.9 }))
  .follow('imageUrl', 'image', 5)
  .all();
```

### Using for-await-of Loop
```javascript
// Stream and process items one at a time
const stream = fetchHelper('https://api.example.com/data.json')
  .filter(item => item.active)
  .map(item => processItem(item));

for await (const item of stream) {
  console.log('Processing:', item);
  // Process each item as it arrives
}
```

## Performance Considerations

1. **Chunk Size**: Default is 255 items per request, automatically reduced to 64 on slow connections
2. **Parallel Processing**: `map()` and `follow()` support `maxInFlight` parameter to control concurrency (default: 5)
3. **Memory Efficiency**: Uses generators to stream data instead of loading everything into memory
4. **Smart Caching**: Detects page reloads and forces cache refresh when needed

## API Response Format

The fetch helper expects the API to return JSON in this format:

```json
{
  "total": 1000,
  "data": [
    { "id": 1, "name": "Item 1" },
    { "id": 2, "name": "Item 2" }
  ]
}
```

- `total`: Total number of items available
- `data`: Array of items in the current chunk

The API should support these query parameters:
- `offset`: Starting index for pagination
- `limit`: Number of items to return
- `sheet`: (Optional) Sheet name for spreadsheet APIs

## Browser Compatibility

Requires modern browsers with support for:
- Async generators (`async function*`)
- `for await...of` loops
- `fetch` API
- `DOMParser`

## Error Handling

The helper gracefully handles:
- Network failures (stops iteration)
- Invalid responses (stops iteration)
- Missing data fields (returns empty results)

```javascript
try {
  const data = await fetchHelper('https://api.example.com/data.json').all();
} catch (error) {
  console.error('Failed to fetch data:', error);
}
```

## License

Part of the Adobe AEM Code Kit.
