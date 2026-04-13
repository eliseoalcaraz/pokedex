/**
 * card.js - Pokemon Card Component
 * Handles the creation and rendering of Pokemon cards
 */

(function() {
    'use strict';

    const { formatPokemonId, getPokemonImageUrl, capitalize, createElement } = window.PokedexUtils;

    /**
     * Create a type badge element
     * @param {string} type - Pokemon type
     * @returns {HTMLElement} Type badge element
     */
    function createTypeBadge(type) {
        return createElement('span', {
            className: `type-badge type-badge--${type.toLowerCase()}`
        }, [type.toLowerCase()]);
    }

    /**
     * Create a Pokemon card element
     * @param {Object} pokemon - Pokemon data object
     * @param {Function} onClick - Click handler function
     * @returns {HTMLElement} Pokemon card element
     */
    function createPokemonCard(pokemon, onClick) {
        const { id, name, types } = pokemon;
        const primaryType = types[0]?.type?.name || types[0] || 'normal';
        
        // Create card structure
        const card = createElement('article', {
            className: 'pokemon-card',
            dataset: { 
                id: id.toString(),
                type: primaryType.toLowerCase()
            },
            tabindex: '0',
            role: 'button',
            'aria-label': `View details for ${capitalize(name)}`
        });

        // Card header with ID
        const header = createElement('div', { className: 'pokemon-card__header' }, [
            createElement('span', { className: 'pokemon-card__id' }, [`#${formatPokemonId(id)}`])
        ]);

        // Image container
        const imageContainer = createElement('div', { className: 'pokemon-card__image-container' }, [
            createElement('div', { className: 'pokemon-card__image-bg' }),
            createElement('img', {
                className: 'pokemon-card__image',
                src: getPokemonImageUrl(id),
                alt: capitalize(name),
                loading: 'lazy'
            })
        ]);

        // Handle image load error - use fallback
        const img = imageContainer.querySelector('img');
        img.onerror = function() {
            // Try official artwork as fallback
            this.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
            this.onerror = function() {
                // Final fallback to basic sprite
                this.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
                this.onerror = null;
            };
        };

        // Info section with name and types
        const typesContainer = createElement('div', { className: 'pokemon-card__types' });
        
        // Extract type names from the pokemon data
        const typeNames = types.map(t => {
            if (typeof t === 'string') return t;
            return t.type?.name || 'normal';
        });
        
        typeNames.forEach(type => {
            typesContainer.appendChild(createTypeBadge(type));
        });

        const info = createElement('div', { className: 'pokemon-card__info' }, [
            createElement('h2', { className: 'pokemon-card__name' }, [capitalize(name)]),
            typesContainer
        ]);

        // Assemble card
        card.appendChild(header);
        card.appendChild(imageContainer);
        card.appendChild(info);

        // Add click handler
        card.addEventListener('click', () => onClick(pokemon));
        
        // Add keyboard accessibility
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(pokemon);
            }
        });

        return card;
    }

    /**
     * Render a list of Pokemon cards into a container
     * @param {HTMLElement} container - Container element
     * @param {Array} pokemonList - Array of Pokemon data
     * @param {Function} onCardClick - Click handler for cards
     * @param {boolean} append - Whether to append or replace cards
     */
    function renderPokemonCards(container, pokemonList, onCardClick, append = false) {
        if (!container) return;

        // Clear container if not appending
        if (!append) {
            container.innerHTML = '';
        }

        // Create document fragment for better performance
        const fragment = document.createDocumentFragment();

        pokemonList.forEach(pokemon => {
            const card = createPokemonCard(pokemon, onCardClick);
            fragment.appendChild(card);
        });

        container.appendChild(fragment);
    }

    /**
     * Create a loading skeleton card
     * @returns {HTMLElement} Skeleton card element
     */
    function createSkeletonCard() {
        const card = createElement('article', {
            className: 'pokemon-card pokemon-card--skeleton',
            'aria-hidden': 'true'
        });

        card.innerHTML = `
            <div class="pokemon-card__header">
                <span class="pokemon-card__id skeleton-text" style="width: 40px; height: 14px;"></span>
            </div>
            <div class="pokemon-card__image-container">
                <div class="pokemon-card__image skeleton-image"></div>
            </div>
            <div class="pokemon-card__info">
                <div class="pokemon-card__name skeleton-text" style="width: 80px; height: 20px; margin: 0 auto 8px;"></div>
                <div class="pokemon-card__types">
                    <span class="type-badge skeleton-text" style="width: 60px; height: 20px;"></span>
                </div>
            </div>
        `;

        return card;
    }

    /**
     * Show loading skeletons in the grid
     * @param {HTMLElement} container - Container element
     * @param {number} count - Number of skeletons to show
     */
    function showLoadingSkeletons(container, count = 10) {
        if (!container) return;

        const fragment = document.createDocumentFragment();
        
        for (let i = 0; i < count; i++) {
            fragment.appendChild(createSkeletonCard());
        }
        
        container.appendChild(fragment);
    }

    /**
     * Remove loading skeletons from the grid
     * @param {HTMLElement} container - Container element
     */
    function removeLoadingSkeletons(container) {
        if (!container) return;

        const skeletons = container.querySelectorAll('.pokemon-card--skeleton');
        skeletons.forEach(skeleton => skeleton.remove());
    }

    // Export card functions
    window.PokedexCard = {
        createTypeBadge,
        createPokemonCard,
        renderPokemonCards,
        createSkeletonCard,
        showLoadingSkeletons,
        removeLoadingSkeletons
    };

})();
