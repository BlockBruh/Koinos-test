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

**Testing**
- Added unit tests using Jest for the items routes in `src/routes/items.js`.
- Covered both happy path scenarios and error cases, ensuring that the API behaves as expected under various conditions.
- Ensured that tests are isolated and do not depend on the actual data file, allowing for faster and more reliable test execution (refactored the items router to allow a custom path to the data file).

**Memory Leak**
- I have fixed the memory leak by adding a flag to ensure the data is not set in state if the component is unmounted before the fetch completes.

**Pagination & Search**
- I have modified the backend endpoint to support page number and limit parameters for pagination.
- Implemented a search feature that filters items based on a query parameter (`q`).

**Performance**
- I have integrated `react-window` to virtualize the list of items, which improves performance by only rendering the visible items in the viewport.

Trade-offs: 
- The UI/UX enhancements were kept minimal to focus on functionality, but the code is structured to allow easy future enhancements