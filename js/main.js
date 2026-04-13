/**
 * main.js - Main Application Entry Point
 * Orchestrates the Pokedex application, handles API calls and state management
 */

(function() {
    'use strict';

    // Import utilities and components
    const { 
        CONFIG, 
        cache, 
        showElement, 
        hideElement, 
        extractPokemonId 
    } = window.PokedexUtils;
    
    const { renderPokemonCards } = window.PokedexCard;
    const { initModal, openModal, updateModal } = window.PokedexModal;
    const { 
        initFilters, 
        setFilterChangeCallback, 
        applyFiltersAndSort, 
        hasActiveFilters 
    } = window.PokedexFilters;

    // ==========================================
    // APPLICATION STATE
    // ==========================================
    
    const state = {
        allPokemon: [],           // All fetched Pokemon basic data
        detailedPokemon: new Map(), // Cached detailed Pokemon data
        typeFilteredPokemon: new Map(), // Cached pokemon lists by type
        displayedPokemon: [],     // Currently displayed Pokemon (after filters)
        currentOffset: 0,         // Current pagination offset
        isLoading: false,         // Loading state
        hasMorePokemon: true,     // Whether there are more Pokemon to load
        currentPokemonId: null,   // Currently viewed Pokemon ID in modal
        filterRequestId: 0,       // Tracks the latest async filter request
    };

    // ==========================================
    // DOM ELEMENTS
    // ==========================================
    
    const elements = {
        grid: document.getElementById('pokemonGrid'),
        loader: document.getElementById('loader'),
        loadMoreContainer: document.getElementById('loadMoreContainer'),
        loadMoreBtn: document.getElementById('loadMoreBtn'),
        noResults: document.getElementById('noResults'),
    };

    // ==========================================
    // API FUNCTIONS
    // ==========================================

    /**
     * Fetch data from API with caching
     * @param {string} url - API URL
     * @returns {Promise<Object>} API response data
     */
    async function fetchWithCache(url) {
        // Check cache first
        const cached = cache.get(url);
        if (cached) return cached;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // Cache the response
            cache.set(url, data);
            
            return data;
        } catch (error) {
            console.error('API fetch error:', error);
            throw error;
        }
    }

    /**
     * Fetch Pokemon list from API
     * @param {number} limit - Number of Pokemon to fetch
     * @param {number} offset - Starting offset
     * @returns {Promise<Array>} Array of Pokemon basic data
     */
    async function fetchPokemonList(limit = CONFIG.POKEMON_PER_PAGE, offset = 0) {
        const url = `${CONFIG.API_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`;
        const data = await fetchWithCache(url);
        return data.results;
    }

    /**
     * Fetch all Pokemon that belong to a specific type
     * @param {string} type - Pokemon type name
     * @returns {Promise<Array>} Array of detailed Pokemon data
     */
    async function fetchPokemonByType(type) {
        const url = `${CONFIG.API_BASE_URL}/type/${type.toLowerCase()}`;
        const data = await fetchWithCache(url);

        const uniquePokemon = new Map();

        data.pokemon.forEach(({ pokemon }) => {
            const id = extractPokemonId(pokemon.url);

            // Keep the filter aligned with the supported dex range.
            if (!id || id > CONFIG.MAX_POKEMON_ID || uniquePokemon.has(id)) {
                return;
            }

            uniquePokemon.set(id, pokemon);
        });

        return fetchMultiplePokemonDetails(Array.from(uniquePokemon.values()));
    }

    /**
     * Fetch detailed Pokemon data
     * @param {string|number} idOrUrl - Pokemon ID or API URL
     * @returns {Promise<Object>} Detailed Pokemon data
     */
    async function fetchPokemonDetails(idOrUrl) {
        let url;
        let id;

        if (typeof idOrUrl === 'number' || !isNaN(parseInt(idOrUrl))) {
            id = parseInt(idOrUrl);
            url = `${CONFIG.API_BASE_URL}/pokemon/${id}`;
        } else if (typeof idOrUrl === 'string' && idOrUrl.startsWith('http')) {
            url = idOrUrl;
            id = extractPokemonId(idOrUrl);
        } else {
            url = `${CONFIG.API_BASE_URL}/pokemon/${idOrUrl}`;
        }

        // Check if we already have this Pokemon's details
        if (id && state.detailedPokemon.has(id)) {
            return state.detailedPokemon.get(id);
        }

        const data = await fetchWithCache(url);
        
        // Cache in state
        if (data.id) {
            state.detailedPokemon.set(data.id, data);
        }

        return data;
    }

    /**
     * Fetch multiple Pokemon details in parallel
     * @param {Array} pokemonList - Array of Pokemon basic data
     * @returns {Promise<Array>} Array of detailed Pokemon data
     */
    async function fetchMultiplePokemonDetails(pokemonList) {
        const promises = pokemonList.map(pokemon => {
            const id = extractPokemonId(pokemon.url);
            return fetchPokemonDetails(id).catch(error => {
                console.error(`Failed to fetch Pokemon ${id}:`, error);
                return null;
            });
        });

        const results = await Promise.all(promises);
        return results.filter(pokemon => pokemon !== null);
    }

    // ==========================================
    // UI FUNCTIONS
    // ==========================================

    /**
     * Show loading state
     */
    function showLoading() {
        state.isLoading = true;
        showElement(elements.loader);
        if (elements.loadMoreBtn) {
            elements.loadMoreBtn.disabled = true;
        }
    }

    /**
     * Hide loading state
     */
    function hideLoading() {
        state.isLoading = false;
        hideElement(elements.loader);
        if (elements.loadMoreBtn) {
            elements.loadMoreBtn.disabled = false;
        }
    }

    /**
     * Update Load More button visibility
     */
    function updateLoadMoreVisibility() {
        if (!elements.loadMoreContainer) return;

        // Hide if filtering (show all filtered results at once)
        // or if no more Pokemon to load
        if (hasActiveFilters() || !state.hasMorePokemon) {
            hideElement(elements.loadMoreContainer);
        } else {
            showElement(elements.loadMoreContainer);
        }
    }

    /**
     * Show no results message
     */
    function showNoResults() {
        hideElement(elements.loader);
        hideElement(elements.loadMoreContainer);
        showElement(elements.noResults);
    }

    /**
     * Hide no results message
     */
    function hideNoResults() {
        hideElement(elements.noResults);
    }

    /**
     * Display Pokemon in the grid
     * @param {Array} pokemonList - Array of Pokemon to display
     * @param {boolean} append - Whether to append or replace
     */
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

    /**
     * Merge fetched pokemon into the loaded collection without duplicates
     * @param {Array} pokemonList - Array of detailed Pokemon data
     */
    function mergePokemonIntoState(pokemonList) {
        const mergedPokemon = new Map(
            state.allPokemon.map(pokemon => [pokemon.id, pokemon])
        );

        pokemonList.forEach(pokemon => {
            mergedPokemon.set(pokemon.id, pokemon);
        });

        state.allPokemon = Array.from(mergedPokemon.values());
    }

    // ==========================================
    // EVENT HANDLERS
    // ==========================================

    /**
     * Handle Pokemon card click
     * @param {Object} pokemon - Clicked Pokemon data
     */
    async function handleCardClick(pokemon) {
        try {
            showLoading();
            
            // Fetch full details if we don't have them
            let detailedPokemon = state.detailedPokemon.get(pokemon.id);
            if (!detailedPokemon) {
                detailedPokemon = await fetchPokemonDetails(pokemon.id);
            }

            state.currentPokemonId = pokemon.id;

            // Open modal with navigation
            openModal(detailedPokemon, getNavigationInfo(pokemon.id));
            
        } catch (error) {
            console.error('Error fetching Pokemon details:', error);
            alert('Failed to load Pokemon details. Please try again.');
        } finally {
            hideLoading();
        }
    }

    /**
     * Get navigation info for modal
     * @param {number} pokemonId - Current Pokemon ID
     * @returns {Object} Navigation info
     */
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

    /**
     * Navigate to a different Pokemon in the modal
     * @param {number} pokemonId - Target Pokemon ID
     */
    async function navigatePokemon(pokemonId) {
        if (pokemonId < 1 || pokemonId > CONFIG.MAX_POKEMON_ID) return;

        try {
            // Show loading in modal
            const modalBody = document.getElementById('modalBody');
            if (modalBody) {
                modalBody.innerHTML = `
                    <div class="loader" style="padding: 80px 0;">
                        <div class="loader__spinner"></div>
                        <p class="loader__text">Loading...</p>
                    </div>
                `;
            }

            let pokemon = state.detailedPokemon.get(pokemonId);
            if (!pokemon) {
                pokemon = await fetchPokemonDetails(pokemonId);
            }

            state.currentPokemonId = pokemonId;
            updateModal(pokemon, getNavigationInfo(pokemonId));

        } catch (error) {
            console.error('Error navigating to Pokemon:', error);
        }
    }

    /**
     * Handle Load More button click
     */
    async function handleLoadMore() {
        if (state.isLoading || !state.hasMorePokemon) return;

        try {
            showLoading();

            // Fetch next batch
            const newPokemonList = await fetchPokemonList(
                CONFIG.POKEMON_PER_PAGE,
                state.currentOffset + CONFIG.POKEMON_PER_PAGE
            );

            if (newPokemonList.length === 0) {
                state.hasMorePokemon = false;
                hideLoading();
                updateLoadMoreVisibility();
                return;
            }

            // Fetch details for new Pokemon
            const detailedPokemon = await fetchMultiplePokemonDetails(newPokemonList);

            // Update state
            state.allPokemon = [...state.allPokemon, ...detailedPokemon];
            state.currentOffset += CONFIG.POKEMON_PER_PAGE;

            // Check if we've reached the limit
            if (state.currentOffset >= CONFIG.MAX_POKEMON_ID) {
                state.hasMorePokemon = false;
            }

            // Apply filters and display
            const filtered = applyFiltersAndSort(state.allPokemon);
            displayPokemon(detailedPokemon, true);

        } catch (error) {
            console.error('Error loading more Pokemon:', error);
            alert('Failed to load more Pokemon. Please try again.');
        } finally {
            hideLoading();
        }
    }

    /**
     * Handle filter changes
     * @param {Object} filterState - New filter state
     */
    async function handleFilterChange(filterState) {
        const requestId = ++state.filterRequestId;

        try {
            showLoading();

            let sourcePokemon = state.allPokemon;

            if (filterState.typeFilter !== 'all') {
                const typeKey = filterState.typeFilter.toLowerCase();

                if (!state.typeFilteredPokemon.has(typeKey)) {
                    const typePokemon = await fetchPokemonByType(typeKey);
                    state.typeFilteredPokemon.set(typeKey, typePokemon);
                    mergePokemonIntoState(typePokemon);
                }

                sourcePokemon = state.typeFilteredPokemon.get(typeKey) || [];
            }

            const filtered = applyFiltersAndSort(sourcePokemon);

            if (requestId !== state.filterRequestId) {
                return;
            }

            state.displayedPokemon = filtered;
            displayPokemon(filtered, false);
        } catch (error) {
            if (requestId !== state.filterRequestId) {
                return;
            }

            console.error('Error applying filters:', error);
            alert('Failed to apply filters. Please try again.');
        } finally {
            if (requestId === state.filterRequestId) {
                hideLoading();
            }
        }
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================

    /**
     * Load initial Pokemon data
     */
    async function loadInitialPokemon() {
        try {
            showLoading();

            // Fetch initial Pokemon list
            const pokemonList = await fetchPokemonList(CONFIG.POKEMON_PER_PAGE, 0);

            // Fetch details for all Pokemon
            const detailedPokemon = await fetchMultiplePokemonDetails(pokemonList);

            // Update state
            state.allPokemon = detailedPokemon;
            state.currentOffset = 0;

            // Display Pokemon
            displayPokemon(detailedPokemon);

        } catch (error) {
            console.error('Error loading initial Pokemon:', error);
            showNoResults();
        } finally {
            hideLoading();
        }
    }

    /**
     * Initialize the application
     */
    async function init() {
        console.log('Initializing Pokedex...');

        // Initialize components
        initModal();
        initFilters();

        // Set up filter change callback
        setFilterChangeCallback(handleFilterChange);

        // Set up Load More button
        if (elements.loadMoreBtn) {
            elements.loadMoreBtn.addEventListener('click', handleLoadMore);
        }

        // Load initial Pokemon
        await loadInitialPokemon();

        console.log('Pokedex initialized successfully!');
    }

    // Start the application when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose some functions globally for debugging
    window.Pokedex = {
        state,
        loadMore: handleLoadMore,
        refresh: loadInitialPokemon
    };

})();
