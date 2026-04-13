import { CONFIG } from '../config/constants.js';
import { renderPokemonCards } from '../components/card.js';
import { createFilters } from '../components/filters.js';
import { createPokemonModal } from '../components/modal.js';
import { createPokemonApi } from '../services/pokemon-api.js';
import { createAppState } from '../state/app-state.js';
import { hideElement, showElement } from '../utils/dom.js';
import { extractPokemonId, matchesPokemonSearch } from '../utils/helpers.js';

function createPokedexApp() {
    const state = createAppState();
    const api = createPokemonApi();
    const filters = createFilters();
    const modal = createPokemonModal();

    const elements = {
        grid: document.getElementById('pokemonGrid'),
        loader: document.getElementById('loader'),
        loadMoreContainer: document.getElementById('loadMoreContainer'),
        loadMoreBtn: document.getElementById('loadMoreBtn'),
        noResults: document.getElementById('noResults')
    };

    function showLoading() {
        state.isLoading = true;
        showElement(elements.loader);

        if (elements.loadMoreBtn) {
            elements.loadMoreBtn.disabled = true;
        }
    }

    function hideLoading() {
        state.isLoading = false;
        hideElement(elements.loader);

        if (elements.loadMoreBtn) {
            elements.loadMoreBtn.disabled = false;
        }
    }

    function showNoResults() {
        hideElement(elements.loader);
        hideElement(elements.loadMoreContainer);
        showElement(elements.noResults);
    }

    function hideNoResults() {
        hideElement(elements.noResults);
    }

    function updateLoadMoreVisibility() {
        if (!elements.loadMoreContainer) {
            return;
        }

        if (filters.hasActiveFilters() || !state.hasMorePokemon) {
            hideElement(elements.loadMoreContainer);
        } else {
            showElement(elements.loadMoreContainer);
        }
    }

    function displayPokemon(pokemonList, append = false) {
        hideNoResults();

        if (pokemonList.length === 0) {
            if (!append) {
                elements.grid.innerHTML = '';
            }

            showNoResults();
            return;
        }

        renderPokemonCards(elements.grid, pokemonList, handleCardClick, append);
        updateLoadMoreVisibility();
    }

    function mergePokemonIntoState(pokemonList) {
        const mergedPokemon = new Map(state.allPokemon.map(pokemon => [pokemon.id, pokemon]));
        pokemonList.forEach(pokemon => {
            mergedPokemon.set(pokemon.id, pokemon);
        });

        state.allPokemon = [...mergedPokemon.values()];
    }

    async function resolveSearchSource(filterState, sourcePokemon) {
        if (!filterState.searchQuery || filterState.typeFilter !== 'all') {
            return sourcePokemon;
        }

        const pokemonIndex = await api.fetchPokemonIndex();
        const matchingPokemon = pokemonIndex.filter(pokemon => (
            matchesPokemonSearch(pokemon, filterState.searchQuery)
        ));

        if (matchingPokemon.length === 0) {
            return [];
        }

        const missingPokemon = matchingPokemon.filter(pokemon => {
            const pokemonId = extractPokemonId(pokemon.url);
            return !api.hasCachedPokemon(pokemonId);
        });

        if (missingPokemon.length > 0) {
            const detailedPokemon = await api.fetchMultiplePokemonDetails(missingPokemon);
            mergePokemonIntoState(detailedPokemon);
        }

        return matchingPokemon
            .map(pokemon => api.getCachedPokemon(extractPokemonId(pokemon.url)))
            .filter(Boolean);
    }

    function getNavigationInfo(pokemonId) {
        const hasPrev = pokemonId > 1;
        const hasNext = pokemonId < CONFIG.MAX_POKEMON_ID;

        return {
            hasPrev,
            hasNext,
            onPrev: hasPrev ? () => navigatePokemon(pokemonId - 1) : null,
            onNext: hasNext ? () => navigatePokemon(pokemonId + 1) : null
        };
    }

    async function handleCardClick(pokemon) {
        try {
            showLoading();

            const detailedPokemon = api.getCachedPokemon(pokemon.id) || await api.fetchPokemonDetails(pokemon.id);
            state.currentPokemonId = pokemon.id;
            modal.open(detailedPokemon, getNavigationInfo(pokemon.id));
        } catch (error) {
            console.error('Error fetching Pokemon details:', error);
            window.alert('Failed to load Pokemon details. Please try again.');
        } finally {
            hideLoading();
        }
    }

    async function navigatePokemon(pokemonId) {
        if (pokemonId < 1 || pokemonId > CONFIG.MAX_POKEMON_ID) {
            return;
        }

        try {
            const modalBody = document.getElementById('modalBody');
            if (modalBody) {
                modalBody.innerHTML = `
                    <div class="loader" style="padding: 80px 0;">
                        <div class="loader__spinner"></div>
                        <p class="loader__text">Loading...</p>
                    </div>
                `;
            }

            const pokemon = api.getCachedPokemon(pokemonId) || await api.fetchPokemonDetails(pokemonId);
            state.currentPokemonId = pokemonId;
            modal.update(pokemon, getNavigationInfo(pokemonId));
        } catch (error) {
            console.error('Error navigating to Pokemon:', error);
        }
    }

    async function handleLoadMore() {
        if (state.isLoading || !state.hasMorePokemon) {
            return;
        }

        try {
            showLoading();
            const existingPokemonIds = new Set(state.allPokemon.map(pokemon => pokemon.id));

            const nextPokemonList = await api.fetchPokemonList(
                CONFIG.POKEMON_PER_PAGE,
                state.currentOffset + CONFIG.POKEMON_PER_PAGE
            );

            if (nextPokemonList.length === 0) {
                state.hasMorePokemon = false;
                updateLoadMoreVisibility();
                return;
            }

            const detailedPokemon = await api.fetchMultiplePokemonDetails(nextPokemonList);
            const newPokemonToAppend = detailedPokemon.filter(pokemon => !existingPokemonIds.has(pokemon.id));

            mergePokemonIntoState(detailedPokemon);
            state.currentOffset += CONFIG.POKEMON_PER_PAGE;

            if (state.currentOffset >= CONFIG.MAX_POKEMON_ID) {
                state.hasMorePokemon = false;
            }

            const filteredPokemon = filters.applyFiltersAndSort(state.allPokemon);
            state.displayedPokemon = filteredPokemon;

            if (filters.hasActiveFilters()) {
                displayPokemon(filteredPokemon, false);
            } else {
                displayPokemon(newPokemonToAppend, true);
            }
        } catch (error) {
            console.error('Error loading more Pokemon:', error);
            window.alert('Failed to load more Pokemon. Please try again.');
        } finally {
            hideLoading();
        }
    }

    async function handleFilterChange(filterState) {
        const requestId = ++state.filterRequestId;

        try {
            showLoading();

            let sourcePokemon = state.allPokemon;

            if (filterState.typeFilter !== 'all') {
                const typeKey = filterState.typeFilter.toLowerCase();

                if (!state.typeFilteredPokemon.has(typeKey)) {
                    const typePokemon = await api.fetchPokemonByType(typeKey);
                    state.typeFilteredPokemon.set(typeKey, typePokemon);
                    mergePokemonIntoState(typePokemon);
                }

                sourcePokemon = state.typeFilteredPokemon.get(typeKey) || [];
            }

            const searchablePokemon = await resolveSearchSource(filterState, sourcePokemon);
            const filteredPokemon = filters.applyFiltersAndSort(searchablePokemon);

            if (requestId !== state.filterRequestId) {
                return;
            }

            state.displayedPokemon = filteredPokemon;
            displayPokemon(filteredPokemon, false);
        } catch (error) {
            if (requestId !== state.filterRequestId) {
                return;
            }

            console.error('Error applying filters:', error);
            window.alert('Failed to apply filters. Please try again.');
        } finally {
            if (requestId === state.filterRequestId) {
                hideLoading();
            }
        }
    }

    async function loadInitialPokemon() {
        try {
            showLoading();

            const pokemonList = await api.fetchPokemonList(CONFIG.POKEMON_PER_PAGE, 0);
            const detailedPokemon = await api.fetchMultiplePokemonDetails(pokemonList);

            state.allPokemon = detailedPokemon;
            state.displayedPokemon = detailedPokemon;
            state.currentOffset = 0;

            displayPokemon(detailedPokemon);
        } catch (error) {
            console.error('Error loading initial Pokemon:', error);
            showNoResults();
        } finally {
            hideLoading();
        }
    }

    async function init() {
        modal.init();
        filters.init();
        filters.setFilterChangeCallback(handleFilterChange);
        elements.loadMoreBtn?.addEventListener('click', handleLoadMore);

        await loadInitialPokemon();
    }

    return {
        init,
        loadMore: handleLoadMore,
        refresh: loadInitialPokemon,
        state
    };
}

export { createPokedexApp };
