## Brief description of the solutions

**Refactor blocking I/O**
- Replaced `fs.readFileSync` with `fs.promises.readFile` in `src/routes/items.js` to ensure non-blocking I/O operations. This allows the server to handle other requests while waiting for file operations to complete.
- Used `async/await` syntax for better readability and error handling.
- Ensured that the file reading operations are wrapped in try-catch blocks to handle potential errors.

**Performance**  
- Implemented caching for the stats endpoint (`GET /api/stats`) to avoid recalculating statistics on every request.
- Used an in-memory cache that stores the stats and updates it only when the underlying data changes
- Used `fs.watch` to monitor changes to the data file and invalidate the cache when changes are detected.
- Added the timestamp of the last update to the cache to ensure that the stats are only recalculated when necessary.