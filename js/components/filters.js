import { CONFIG, POKEMON_TYPES } from '../config/constants.js';
import { capitalize } from '../utils/formatters.js';
import { debounce, matchesPokemonSearch, normalizeSearchQuery } from '../utils/helpers.js';

const DEFAULT_FILTER_STATE = {
    searchQuery: '',
    sortBy: 'id-asc',
    typeFilter: 'all'
};

function getPokemonTypes(pokemon) {
    return pokemon.types.map(type => {
        if (typeof type === 'string') {
            return type.toLowerCase();
        }

        return type.type?.name?.toLowerCase() || '';
    });
}

function createFilters() {
    let filterState = { ...DEFAULT_FILTER_STATE };
    let onFilterChange = null;

    const elements = {
        searchInput: document.getElementById('searchInput'),
        searchBtn: document.getElementById('searchBtn'),
        sortSelect: document.getElementById('sortSelect'),
        typeSelect: document.getElementById('typeSelect')
    };

    function notifyChange() {
        if (onFilterChange) {
            onFilterChange({ ...filterState });
        }
    }

    function updateFilterState(updates) {
        filterState = {
            ...filterState,
            ...updates
        };

        notifyChange();
    }

    function initTypeFilter() {
        if (!elements.typeSelect) {
            return;
        }

        elements.typeSelect.innerHTML = '<option value="all">All Types</option>';

        POKEMON_TYPES.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = capitalize(type);
            elements.typeSelect.appendChild(option);
        });
    }

    function filterPokemon(pokemonList) {
        let filteredPokemon = [...pokemonList];

        if (filterState.searchQuery) {
            filteredPokemon = filteredPokemon.filter(pokemon => (
                matchesPokemonSearch(pokemon, filterState.searchQuery)
            ));
        }

        if (filterState.typeFilter !== 'all') {
            filteredPokemon = filteredPokemon.filter(pokemon => (
                getPokemonTypes(pokemon).includes(filterState.typeFilter.toLowerCase())
            ));
        }

        return filteredPokemon;
    }

    function sortPokemon(pokemonList) {
        const sortedPokemon = [...pokemonList];
        const [sortField, sortDirection] = filterState.sortBy.split('-');

        sortedPokemon.sort((a, b) => {
            const comparison = sortField === 'name'
                ? a.name.localeCompare(b.name)
                : a.id - b.id;

            return sortDirection === 'desc' ? -comparison : comparison;
        });

        return sortedPokemon;
    }

    function applyFiltersAndSort(pokemonList) {
        return sortPokemon(filterPokemon(pokemonList));
    }

    function hasActiveFilters() {
        return filterState.searchQuery !== '' || filterState.typeFilter !== 'all';
    }

    function getFilterSummary() {
        const summary = [];

        if (filterState.searchQuery) {
            summary.push(`Search: "${filterState.searchQuery}"`);
        }

        if (filterState.typeFilter !== 'all') {
            summary.push(`Type: ${capitalize(filterState.typeFilter)}`);
        }

        return summary.length > 0 ? summary.join(', ') : 'No filters applied';
    }

    function resetFilters() {
        filterState = { ...DEFAULT_FILTER_STATE };

        if (elements.searchInput) {
            elements.searchInput.value = '';
        }

        if (elements.sortSelect) {
            elements.sortSelect.value = DEFAULT_FILTER_STATE.sortBy;
        }

        if (elements.typeSelect) {
            elements.typeSelect.value = DEFAULT_FILTER_STATE.typeFilter;
        }

        notifyChange();
    }

    function bindEvents() {
        const debouncedSearch = debounce(value => {
            updateFilterState({ searchQuery: normalizeSearchQuery(value) });
        }, CONFIG.DEBOUNCE_DELAY);

        elements.searchInput?.addEventListener('input', event => {
            debouncedSearch(event.target.value);
        });

        elements.searchInput?.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                event.preventDefault();
                updateFilterState({ searchQuery: normalizeSearchQuery(event.target.value) });
            }
        });

        elements.searchBtn?.addEventListener('click', () => {
            updateFilterState({ searchQuery: normalizeSearchQuery(elements.searchInput?.value || '') });
        });

        elements.sortSelect?.addEventListener('change', event => {
            updateFilterState({ sortBy: event.target.value });
        });

        elements.typeSelect?.addEventListener('change', event => {
            updateFilterState({ typeFilter: event.target.value });
        });
    }

    function init() {
        initTypeFilter();
        bindEvents();
    }

    return {
        applyFiltersAndSort,
        filterPokemon,
        getFilterState: () => ({ ...filterState }),
        getFilterSummary,
        hasActiveFilters,
        init,
        resetFilters,
        setFilterChangeCallback: callback => {
            onFilterChange = callback;
        },
        sortPokemon
    };
}

export { createFilters };
