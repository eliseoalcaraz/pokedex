/**
 * modal.js - Pokemon Detail Modal Component
 * Handles the display of detailed Pokemon information
 */

(function() {
    'use strict';

    const {
        formatPokemonId,
        getPokemonImageUrl,
        capitalize,
        formatHeight,
        formatWeight,
        getWeaknesses,
        formatStatName,
        getStatClass,
        calculateStatPercentage,
        createElement,
        CONFIG
    } = window.PokedexUtils;

    const { createTypeBadge } = window.PokedexCard;

    // Modal elements cache
    let modalElements = null;

    /**
     * Initialize modal elements cache
     */
    function initModalElements() {
        modalElements = {
            modal: document.getElementById('pokemonModal'),
            overlay: document.getElementById('modalOverlay'),
            content: document.getElementById('modalContent'),
            body: document.getElementById('modalBody'),
            closeBtn: document.getElementById('modalClose'),
            prevBtn: document.getElementById('prevPokemon'),
            nextBtn: document.getElementById('nextPokemon')
        };
    }

    /**
     * Get type background color for header
     * @param {string} type - Pokemon type
     * @returns {string} CSS gradient string
     */
    function getTypeHeaderColor(type) {
        const colors = {
            normal: 'linear-gradient(135deg, #A8A878 0%, #8a8a5c 100%)',
            fire: 'linear-gradient(135deg, #F08030 0%, #c65e1a 100%)',
            water: 'linear-gradient(135deg, #6890F0 0%, #4a70c4 100%)',
            electric: 'linear-gradient(135deg, #F8D030 0%, #c4a820 100%)',
            grass: 'linear-gradient(135deg, #78C850 0%, #5ca038 100%)',
            ice: 'linear-gradient(135deg, #98D8D8 0%, #72b8b8 100%)',
            fighting: 'linear-gradient(135deg, #C03028 0%, #8c201c 100%)',
            poison: 'linear-gradient(135deg, #A040A0 0%, #6c306c 100%)',
            ground: 'linear-gradient(135deg, #E0C068 0%, #b8a050 100%)',
            flying: 'linear-gradient(135deg, #A890F0 0%, #7c68c4 100%)',
            psychic: 'linear-gradient(135deg, #F85888 0%, #c44068 100%)',
            bug: 'linear-gradient(135deg, #A8B820 0%, #808c14 100%)',
            rock: 'linear-gradient(135deg, #B8A038 0%, #8c7828 100%)',
            ghost: 'linear-gradient(135deg, #705898 0%, #4c3c6c 100%)',
            dragon: 'linear-gradient(135deg, #7038F8 0%, #4c20c4 100%)',
            dark: 'linear-gradient(135deg, #705848 0%, #4c3c30 100%)',
            steel: 'linear-gradient(135deg, #B8B8D0 0%, #8c8ca8 100%)',
            fairy: 'linear-gradient(135deg, #EE99AC 0%, #c47488 100%)'
        };
        return colors[type.toLowerCase()] || colors.normal;
    }

    /**
     * Create the detailed Pokemon view HTML
     * @param {Object} pokemon - Full Pokemon data
     * @returns {string} HTML string
     */
    function createPokemonDetailHTML(pokemon) {
        const { id, name, types, height, weight, stats, abilities } = pokemon;
        
        // Get primary type for styling
        const primaryType = types[0]?.type?.name || 'normal';
        const typeNames = types.map(t => t.type?.name || t).filter(Boolean);
        
        // Get weaknesses
        const weaknesses = getWeaknesses(typeNames);
        
        // Build types HTML
        const typesHTML = typeNames.map(type => 
            `<span class="type-badge type-badge--${type.toLowerCase()}">${capitalize(type)}</span>`
        ).join('');
        
        // Build weaknesses HTML
        const weaknessesHTML = weaknesses.map(type => 
            `<span class="type-badge type-badge--${type}">${capitalize(type)}</span>`
        ).join('');
        
        // Build stats HTML
        const statsHTML = stats.map(stat => {
            const percentage = calculateStatPercentage(stat.base_stat);
            const statClass = getStatClass(stat.stat.name);
            return `
                <div class="pokemon-detail__stat">
                    <span class="pokemon-detail__stat-name">${formatStatName(stat.stat.name)}</span>
                    <div class="pokemon-detail__stat-bar">
                        <div class="pokemon-detail__stat-fill ${statClass}" style="width: ${percentage}%"></div>
                    </div>
                    <span class="pokemon-detail__stat-value">${stat.base_stat}</span>
                </div>
            `;
        }).join('');
        
        // Build abilities HTML
        const abilitiesHTML = abilities.map(ability => {
            const isHidden = ability.is_hidden;
            const name = capitalize(ability.ability.name.replace('-', ' '));
            return `<span class="ability-badge ${isHidden ? 'ability-badge--hidden' : ''}" title="${isHidden ? 'Hidden Ability' : ''}">${name}${isHidden ? ' (Hidden)' : ''}</span>`;
        }).join('');
        
        // Calculate total stats
        const totalStats = stats.reduce((sum, stat) => sum + stat.base_stat, 0);

        return `
            <div class="pokemon-detail__header" style="background: ${getTypeHeaderColor(primaryType)}; color: white;">
                <div class="pokemon-detail__hero">
                    <div class="pokemon-detail__identity">
                        <span class="pokemon-detail__id">#${formatPokemonId(id)}</span>
                        <h2 class="pokemon-detail__name" id="modalTitle">${capitalize(name)}</h2>
                        <div class="pokemon-detail__types">
                            ${typesHTML}
                        </div>
                    </div>
                    <div class="pokemon-detail__image-container">
                        <div class="pokemon-detail__image-bg"></div>
                        <img 
                            class="pokemon-detail__image" 
                            src="${getPokemonImageUrl(id)}" 
                            alt="${capitalize(name)}"
                            onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png'"
                        >
                    </div>
                </div>
            </div>
            
            <div class="pokemon-detail__content">
                <div class="pokemon-detail__content-grid">
                    <section class="pokemon-detail__section">
                        <h3 class="pokemon-detail__section-title">About</h3>
                        <div class="pokemon-detail__info-grid">
                            <div class="pokemon-detail__info-item">
                                <span class="pokemon-detail__info-label">Height</span>
                                <span class="pokemon-detail__info-value">${formatHeight(height)}</span>
                            </div>
                            <div class="pokemon-detail__info-item">
                                <span class="pokemon-detail__info-label">Weight</span>
                                <span class="pokemon-detail__info-value">${formatWeight(weight)}</span>
                            </div>
                            <div class="pokemon-detail__info-item">
                                <span class="pokemon-detail__info-label">Base Exp</span>
                                <span class="pokemon-detail__info-value">${pokemon.base_experience || 'N/A'}</span>
                            </div>
                            <div class="pokemon-detail__info-item">
                                <span class="pokemon-detail__info-label">Total Stats</span>
                                <span class="pokemon-detail__info-value">${totalStats}</span>
                            </div>
                        </div>
                    </section>
                    
                    <section class="pokemon-detail__section">
                        <h3 class="pokemon-detail__section-title">Abilities</h3>
                        <div class="pokemon-detail__abilities">
                            ${abilitiesHTML}
                        </div>
                    </section>
                    
                    <section class="pokemon-detail__section pokemon-detail__section--wide">
                        <h3 class="pokemon-detail__section-title">Base Stats</h3>
                        <div class="pokemon-detail__stats">
                            ${statsHTML}
                        </div>
                    </section>
                    
                    <section class="pokemon-detail__section">
                        <h3 class="pokemon-detail__section-title">Weaknesses</h3>
                        <div class="pokemon-detail__weaknesses">
                            ${weaknessesHTML || '<span class="ability-badge">None</span>'}
                        </div>
                    </section>
                </div>
            </div>
        `;
    }

    /**
     * Open the modal with Pokemon details
     * @param {Object} pokemon - Pokemon data
     * @param {Object} navigation - Navigation info { hasPrev, hasNext, onPrev, onNext }
     */
    function openModal(pokemon, navigation = {}) {
        if (!modalElements) {
            initModalElements();
        }

        const { modal, body, prevBtn, nextBtn } = modalElements;
        
        // Render Pokemon details
        body.innerHTML = createPokemonDetailHTML(pokemon);
        
        // Update navigation buttons
        if (prevBtn) {
            prevBtn.disabled = !navigation.hasPrev;
            prevBtn.onclick = navigation.onPrev || null;
        }
        
        if (nextBtn) {
            nextBtn.disabled = !navigation.hasNext;
            nextBtn.onclick = navigation.onNext || null;
        }
        
        // Show modal
        modal.hidden = false;
        document.body.style.overflow = 'hidden';
        
        // Focus management
        modalElements.closeBtn?.focus();
        
        // Add escape key listener
        document.addEventListener('keydown', handleModalKeydown);
    }

    /**
     * Close the modal
     */
    function closeModal() {
        if (!modalElements) {
            initModalElements();
        }

        const { modal } = modalElements;
        
        modal.hidden = true;
        document.body.style.overflow = '';
        
        // Remove escape key listener
        document.removeEventListener('keydown', handleModalKeydown);
        
        // Return focus to the grid
        const grid = document.getElementById('pokemonGrid');
        const firstCard = grid?.querySelector('.pokemon-card');
        firstCard?.focus();
    }

    /**
     * Handle keyboard events in modal
     * @param {KeyboardEvent} e - Keyboard event
     */
    function handleModalKeydown(e) {
        if (e.key === 'Escape') {
            closeModal();
        } else if (e.key === 'ArrowLeft') {
            const prevBtn = document.getElementById('prevPokemon');
            if (prevBtn && !prevBtn.disabled) {
                prevBtn.click();
            }
        } else if (e.key === 'ArrowRight') {
            const nextBtn = document.getElementById('nextPokemon');
            if (nextBtn && !nextBtn.disabled) {
                nextBtn.click();
            }
        }
    }

    /**
     * Initialize modal event listeners
     */
    function initModal() {
        initModalElements();

        const { closeBtn, overlay } = modalElements;
        
        // Close button click
        closeBtn?.addEventListener('click', closeModal);
        
        // Overlay click
        overlay?.addEventListener('click', closeModal);
        
        // Prevent modal content clicks from closing
        modalElements.content?.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    /**
     * Update modal content (for navigation)
     * @param {Object} pokemon - Pokemon data
     * @param {Object} navigation - Navigation info
     */
    function updateModal(pokemon, navigation = {}) {
        if (!modalElements || !modalElements.modal || modalElements.modal.hidden) {
            return openModal(pokemon, navigation);
        }

        const { body, prevBtn, nextBtn } = modalElements;
        
        // Update content
        body.innerHTML = createPokemonDetailHTML(pokemon);
        
        // Update navigation
        if (prevBtn) {
            prevBtn.disabled = !navigation.hasPrev;
            prevBtn.onclick = navigation.onPrev || null;
        }
        
        if (nextBtn) {
            nextBtn.disabled = !navigation.hasNext;
            nextBtn.onclick = navigation.onNext || null;
        }
    }

    // Export modal functions
    window.PokedexModal = {
        initModal,
        openModal,
        closeModal,
        updateModal,
        createPokemonDetailHTML
    };

})();
