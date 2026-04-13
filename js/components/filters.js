/**
 * filters.js - Filter and Sort Component
 * Handles search, filter, and sort functionality for Pokemon list
 */

(function() {
    'use strict';

    const { POKEMON_TYPES, capitalize, debounce, CONFIG } = window.PokedexUtils;

    // Filter state
    let filterState = {
        searchQuery: '',
        sortBy: 'id-asc',
        typeFilter: 'all'
    };

    // Callback function for when filters change
    let onFilterChange = null;

    /**
     * Initialize the type filter dropdown with all Pokemon types
     */
    function initTypeFilter() {
        const typeSelect = document.getElementById('typeSelect');
        if (!typeSelect) return;

        // Clear existing options except "All Types"
        typeSelect.innerHTML = '<option value="all">All Types</option>';

        // Add type options
        POKEMON_TYPES.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = capitalize(type);
            typeSelect.appendChild(option);
        });
    }

    /**
     * Get current filter state
     * @returns {Object} Current filter state
     */
    function getFilterState() {
        return { ...filterState };
    }

    /**
     * Set filter change callback
     * @param {Function} callback - Callback function
     */
    function setFilterChangeCallback(callback) {
        onFilterChange = callback;
    }

    /**
     * Handle search input change
     * @param {string} query - Search query
     */
    function handleSearchChange(query) {
        filterState.searchQuery = query.toLowerCase().trim();
        
        if (onFilterChange) {
            onFilterChange(filterState);
        }
    }

    /**
     * Handle sort change
     * @param {string} sortValue - Sort value (e.g., 'id-asc', 'name-desc')
     */
    function handleSortChange(sortValue) {
        filterState.sortBy = sortValue;
        
        if (onFilterChange) {
            onFilterChange(filterState);
        }
    }

    /**
     * Handle type filter change
     * @param {string} type - Type to filter by or 'all'
     */
    function handleTypeChange(type) {
        filterState.typeFilter = type;
        
        if (onFilterChange) {
            onFilterChange(filterState);
        }
    }

    /**
     * Reset all filters to default
     */
    function resetFilters() {
        filterState = {
            searchQuery: '',
            sortBy: 'id-asc',
            typeFilter: 'all'
        };

        // Reset UI elements
        const searchInput = document.getElementById('searchInput');
        const sortSelect = document.getElementById('sortSelect');
        const typeSelect = document.getElementById('typeSelect');

        if (searchInput) searchInput.value = '';
        if (sortSelect) sortSelect.value = 'id-asc';
        if (typeSelect) typeSelect.value = 'all';

        if (onFilterChange) {
            onFilterChange(filterState);
        }
    }

    /**
     * Filter Pokemon list based on current filter state
     * @param {Array} pokemonList - Array of Pokemon to filter
     * @returns {Array} Filtered Pokemon list
     */
    function filterPokemon(pokemonList) {
        let filtered = [...pokemonList];

        // Apply search filter
        if (filterState.searchQuery) {
            const query = filterState.searchQuery;
            filtered = filtered.filter(pokemon => {
                const name = pokemon.name.toLowerCase();
                const id = String(pokemon.id);
                const paddedId = String(pokemon.id).padStart(3, '0');
                
                return name.includes(query) || 
                       id.includes(query) || 
                       paddedId.includes(query);
            });
        }

        // Apply type filter
        if (filterState.typeFilter !== 'all') {
            filtered = filtered.filter(pokemon => {
                const types = pokemon.types.map(t => {
                    if (typeof t === 'string') return t.toLowerCase();
                    return t.type?.name?.toLowerCase() || '';
                });
                return types.includes(filterState.typeFilter.toLowerCase());
            });
        }

        return filtered;
    }

    /**
     * Sort Pokemon list based on current sort state
     * @param {Array} pokemonList - Array of Pokemon to sort
     * @returns {Array} Sorted Pokemon list
     */
    function sortPokemon(pokemonList) {
        const sorted = [...pokemonList];
        const [sortField, sortDirection] = filterState.sortBy.split('-');

        sorted.sort((a, b) => {
            let comparison = 0;

            if (sortField === 'id') {
                comparison = a.id - b.id;
            } else if (sortField === 'name') {
                comparison = a.name.localeCompare(b.name);
            }

            return sortDirection === 'desc' ? -comparison : comparison;
        });

        return sorted;
    }

    /**
     * Apply all filters and sorting to Pokemon list
     * @param {Array} pokemonList - Array of Pokemon to process
     * @returns {Array} Filtered and sorted Pokemon list
     */
    function applyFiltersAndSort(pokemonList) {
        const filtered = filterPokemon(pokemonList);
        const sorted = sortPokemon(filtered);
        return sorted;
    }

    /**
     * Initialize filter event listeners
     */
    function initFilters() {
        // Initialize type dropdown
        initTypeFilter();

        // Get elements
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        const sortSelect = document.getElementById('sortSelect');
        const typeSelect = document.getElementById('typeSelect');

        // Debounced search handler
        const debouncedSearch = debounce((value) => {
            handleSearchChange(value);
        }, CONFIG.DEBOUNCE_DELAY);

        // Search input event
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                debouncedSearch(e.target.value);
            });

            // Immediate search on Enter
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearchChange(e.target.value);
                }
            });
        }

        // Search button click
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                const query = searchInput?.value || '';
                handleSearchChange(query);
            });
        }

        // Sort select event
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                handleSortChange(e.target.value);
            });
        }

        // Type filter event
        if (typeSelect) {
            typeSelect.addEventListener('change', (e) => {
                handleTypeChange(e.target.value);
            });
        }
    }

    /**
     * Check if any filters are active
     * @returns {boolean} True if filters are active
     */
    function hasActiveFilters() {
        return filterState.searchQuery !== '' || filterState.typeFilter !== 'all';
    }

    /**
     * Get active filter summary for display
     * @returns {string} Summary of active filters
     */
    function getFilterSummary() {
        const parts = [];
        
        if (filterState.searchQuery) {
            parts.push(`Search: "${filterState.searchQuery}"`);
        }
        
        if (filterState.typeFilter !== 'all') {
            parts.push(`Type: ${capitalize(filterState.typeFilter)}`);
        }
        
        return parts.length > 0 ? parts.join(', ') : 'No filters applied';
    }

    // Export filter functions
    window.PokedexFilters = {
        initFilters,
        getFilterState,
        setFilterChangeCallback,
        filterPokemon,
        sortPokemon,
        applyFiltersAndSort,
        resetFilters,
        hasActiveFilters,
        getFilterSummary
    };

})();
