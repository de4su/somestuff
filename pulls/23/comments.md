## ⚠️ Filter Placement Issue

The search filters are currently in the wrong location. They need to be moved from the navbar to the **search results page**.

### Current Problem:
- Filters appear in navbar before any search is made
- Filters are not tied to search results context
- User can't filter results after searching for "fromsoftware" (68 games)

### Required Changes:

1. **Remove SearchFilters from navbar** in `App.tsx`:
   - Remove the `SearchFilters` component that's next to `SearchAutocomplete`
   - Remove `filtersOpen` state management from navbar area

2. **Add SearchFilters to results view** (`view === 'rawg'`):
   - Place the `SearchFilters` component in the results page header (where it shows "68 results found")
   - Filter button should appear next to the "← Back" button

3. **Update filter logic**:
   - When filters change, call `searchGamesWithFilters(currentSearchQuery, newFilters)` 
   - Store the current search query (e.g., "fromsoftware") in state
   - Reset filters when starting a new search (when `handleSuggestionSelect` is called)

4. **Update handleLoadMore**:
   - Pass current filters to pagination: `searchGamesWithFilters(currentQuery, { ...searchFilters, page: nextPage })`

### Expected UX Flow:
1. User searches "fromsoftware" → Shows 68 games
2. Filters button appears on results page
3. User clicks filters → Selects "PC" + "Action" genre
4. Results update to show filtered subset of those 68 games
5. "Load More" respects the active filters

Please update the PR to move filters from navbar to results page context.