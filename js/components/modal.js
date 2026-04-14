import { CONFIG } from '../config/constants.js';
import {
    calculateStatPercentage,
    capitalize,
    formatDisplayName,
    formatFlavorText,
    formatGenerationName,
    formatHeight,
    formatPokemonId,
    formatStatName,
    formatWeight,
    getEnglishGenus,
    getPokemonImageUrl,
    getPokemonProgress,
    getStatClass,
    getWeaknesses
} from '../utils/formatters.js';

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

function createPokemonDetailHTML(pokemon) {
    const { id, name, types, height, weight, stats, abilities, moves = [], species = {} } = pokemon;
    const primaryType = types[0]?.type?.name || 'normal';
    const typeNames = types.map(type => type.type?.name || type).filter(Boolean);
    const weaknesses = getWeaknesses(typeNames);
    const totalStats = stats.reduce((sum, stat) => sum + stat.base_stat, 0);
    const category = getEnglishGenus(species.genera);
    const fieldSummary = formatFlavorText(species.flavor_text_entries);
    const generation = formatGenerationName(species.generation);
    const shape = formatDisplayName(species.shape?.name);
    const habitat = species.habitat ? formatDisplayName(species.habitat.name) : 'Unknown';
    const progress = getPokemonProgress(id, CONFIG.MAX_POKEMON_ID);
    const hpStat = stats.find(s => s.stat.name === 'hp')?.base_stat || 0;
    const moveEntries = moves
        .map(move => {
            const moveName = move.move?.name;

            if (!moveName) {
                return null;
            }

            const levelUpLevels = move.version_group_details
                ?.filter(detail => detail.move_learn_method?.name === 'level-up')
                .map(detail => detail.level_learned_at)
                .filter(level => typeof level === 'number');

            return {
                level: levelUpLevels?.length ? Math.min(...levelUpLevels) : null,
                name: moveName
            };
        })
        .filter(Boolean);
    const uniqueMoves = [...new Set(moveEntries.map(move => move.name))];
    const preferredMoves = [...new Set(
        moveEntries
            .filter(move => move.level !== null)
            .sort((left, right) => left.level - right.level || left.name.localeCompare(right.name))
            .map(move => move.name)
    )];
    
    // Card 1: Show 2 moves
    const showcaseMoves = (preferredMoves.length > 0 ? preferredMoves : uniqueMoves)
        .slice(0, 2)
        .map(moveName => formatDisplayName(moveName));
    
    // Card 2: Show more moves (next 4)
    const additionalMoves = (preferredMoves.length > 0 ? preferredMoves : uniqueMoves)
        .slice(2, 6)
        .map(moveName => formatDisplayName(moveName));
    const remainingMoveCount = Math.max(uniqueMoves.length - 6, 0);

    // Card 1 weaknesses (2 max as energy icons)
    const weaknessesHTML = weaknesses.slice(0, 2).map(type => (
        `<span class="pokemon-card-tcg__energy pokemon-card-tcg__energy--${type}" title="${capitalize(type)}"></span>`
    )).join('');

    // Card 2 full weaknesses list
    const fullWeaknessesHTML = weaknesses.map(type => (
        `<span class="type-badge type-badge--${type}">${capitalize(type)}</span>`
    )).join('');

    const abilitiesHTML = abilities.map(ability => {
        const nameLabel = formatDisplayName(ability.ability.name);
        return `<span class="pokemon-card-tcg__ability ${ability.is_hidden ? 'pokemon-card-tcg__ability--hidden' : ''}">${nameLabel}${ability.is_hidden ? ' ✦' : ''}</span>`;
    }).join('');

    const movesHTML = showcaseMoves.map((move, index) => {
        const damage = (index + 1) * 20 + Math.floor(hpStat / 10);
        return `
            <div class="pokemon-card-tcg__attack">
                <div class="pokemon-card-tcg__attack-cost">
                    <span class="pokemon-card-tcg__energy pokemon-card-tcg__energy--${primaryType}"></span>
                </div>
                <div class="pokemon-card-tcg__attack-info">
                    <span class="pokemon-card-tcg__attack-name">${move}</span>
                </div>
                <span class="pokemon-card-tcg__attack-damage">${damage}</span>
            </div>
        `;
    }).join('');

    // Full stats for Card 2
    const statsHTML = stats.map(stat => {
        const percentage = calculateStatPercentage(stat.base_stat);
        return `
            <div class="pokemon-info-card__stat">
                <span class="pokemon-info-card__stat-name">${formatStatName(stat.stat.name)}</span>
                <span class="pokemon-info-card__stat-value">${stat.base_stat}</span>
                <div class="pokemon-info-card__stat-bar">
                    <div class="pokemon-info-card__stat-fill ${getStatClass(stat.stat.name)}" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    }).join('');

    const typeIconsHTML = typeNames.map(type => (
        `<span class="pokemon-card-tcg__energy pokemon-card-tcg__energy--${type.toLowerCase()}" title="${capitalize(type)}"></span>`
    )).join('');

    const typeBadgesHTML = typeNames.map(type => (
        `<span class="type-badge type-badge--${type.toLowerCase()}">${capitalize(type)}</span>`
    )).join('');

    const additionalMovesHTML = additionalMoves.map(move => (
        `<span class="pokemon-info-card__move-chip">${move}</span>`
    )).join('');

    return `
        <div class="pokemon-cards-wrapper">
            <!-- Card 1: TCG Battle Card -->
            <div class="pokemon-card-tcg pokemon-card-tcg--${primaryType}">
                <div class="pokemon-card-tcg__inner">
                    <!-- Card Header -->
                    <div class="pokemon-card-tcg__header">
                        <div class="pokemon-card-tcg__stage">Basic Pokémon</div>
                        <h2 class="pokemon-card-tcg__name" id="modalTitle">${capitalize(name)}</h2>
                        <div class="pokemon-card-tcg__hp">
                            <span class="pokemon-card-tcg__hp-value">${hpStat}</span>
                            <span class="pokemon-card-tcg__hp-label">HP</span>
                            ${typeIconsHTML}
                        </div>
                    </div>

                    <!-- Card Image Frame -->
                    <div class="pokemon-card-tcg__image-frame">
                        <div class="pokemon-card-tcg__image-container">
                            <img 
                                class="pokemon-card-tcg__image" 
                                src="${getPokemonImageUrl(id)}" 
                                alt="${capitalize(name)}"
                                onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png'"
                            >
                        </div>
                        <div class="pokemon-card-tcg__image-caption">
                            ${category}. Height: ${formatHeight(height)}, Weight: ${formatWeight(weight)}
                        </div>
                    </div>

                    <!-- Abilities -->
                    ${abilities.length > 0 ? `
                    <div class="pokemon-card-tcg__abilities-section">
                        <span class="pokemon-card-tcg__abilities-label">Abilities:</span>
                        ${abilitiesHTML}
                    </div>
                    ` : ''}

                    <!-- Attacks -->
                    <div class="pokemon-card-tcg__attacks">
                        ${movesHTML || '<div class="pokemon-card-tcg__no-moves">No moves learned</div>'}
                    </div>

                    <!-- Weakness / Resistance / Retreat -->
                    <div class="pokemon-card-tcg__footer-stats">
                        <div class="pokemon-card-tcg__footer-stat">
                            <span class="pokemon-card-tcg__footer-label">weakness</span>
                            <div class="pokemon-card-tcg__footer-value">
                                ${weaknessesHTML || '<span class="pokemon-card-tcg__none">—</span>'}
                                ${weaknesses.length > 0 ? '<span class="pokemon-card-tcg__modifier">×2</span>' : ''}
                            </div>
                        </div>
                        <div class="pokemon-card-tcg__footer-stat">
                            <span class="pokemon-card-tcg__footer-label">resistance</span>
                            <div class="pokemon-card-tcg__footer-value">
                                <span class="pokemon-card-tcg__none">—</span>
                            </div>
                        </div>
                        <div class="pokemon-card-tcg__footer-stat">
                            <span class="pokemon-card-tcg__footer-label">retreat cost</span>
                            <div class="pokemon-card-tcg__footer-value">
                                <span class="pokemon-card-tcg__energy pokemon-card-tcg__energy--colorless"></span>
                            </div>
                        </div>
                    </div>

                    <!-- Flavor Text -->
                    <div class="pokemon-card-tcg__flavor">
                        ${fieldSummary}
                    </div>

                    <!-- Card Footer -->
                    <div class="pokemon-card-tcg__card-footer">
                        <span class="pokemon-card-tcg__card-number">${formatPokemonId(id)}/${CONFIG.MAX_POKEMON_ID}</span>
                        <span class="pokemon-card-tcg__rarity">●</span>
                        <span class="pokemon-card-tcg__set">${generation}</span>
                    </div>
                </div>
            </div>

            <!-- Card 2: Detailed Info Card -->
            <div class="pokemon-info-card pokemon-info-card--${primaryType}">
                <div class="pokemon-info-card__inner">
                    <!-- Header -->
                    <div class="pokemon-info-card__header">
                        <div class="pokemon-info-card__title-row">
                            <span class="pokemon-info-card__id">#${formatPokemonId(id)}</span>
                            <h3 class="pokemon-info-card__name">${capitalize(name)}</h3>
                        </div>
                        <div class="pokemon-info-card__types">
                            ${typeBadgesHTML}
                        </div>
                    </div>

                    <!-- Base Stats (2-column) -->
                    <div class="pokemon-info-card__stats-section">
                        <div class="pokemon-info-card__section-header">
                            <span class="pokemon-info-card__section-label">Base Stats</span>
                            <span class="pokemon-info-card__total-value">${totalStats}</span>
                        </div>
                        <div class="pokemon-info-card__stats">
                            ${statsHTML}
                        </div>
                    </div>

                    <!-- Pokédex Data + Weaknesses Row -->
                    <div class="pokemon-info-card__row">
                        <div class="pokemon-info-card__data-section">
                            <span class="pokemon-info-card__section-label">Data</span>
                            <div class="pokemon-info-card__data-grid">
                                <div class="pokemon-info-card__data-item">
                                    <span class="pokemon-info-card__data-label">Gen</span>
                                    <span class="pokemon-info-card__data-value">${generation}</span>
                                </div>
                                <div class="pokemon-info-card__data-item">
                                    <span class="pokemon-info-card__data-label">Habitat</span>
                                    <span class="pokemon-info-card__data-value">${habitat}</span>
                                </div>
                                <div class="pokemon-info-card__data-item">
                                    <span class="pokemon-info-card__data-label">Shape</span>
                                    <span class="pokemon-info-card__data-value">${shape}</span>
                                </div>
                                <div class="pokemon-info-card__data-item">
                                    <span class="pokemon-info-card__data-label">Exp</span>
                                    <span class="pokemon-info-card__data-value">${pokemon.base_experience ?? 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                        <div class="pokemon-info-card__weaknesses-section">
                            <span class="pokemon-info-card__section-label">Weaknesses</span>
                            <div class="pokemon-info-card__weaknesses">
                                ${fullWeaknessesHTML || '<span class="pokemon-info-card__none">None</span>'}
                            </div>
                        </div>
                    </div>

                    <!-- More Moves -->
                    ${additionalMoves.length > 0 ? `
                    <div class="pokemon-info-card__moves-section">
                        <div class="pokemon-info-card__moves-header">
                            <span class="pokemon-info-card__section-label">More Moves</span>
                            ${remainingMoveCount > 0 ? `<span class="pokemon-info-card__moves-count">+${remainingMoveCount}</span>` : ''}
                        </div>
                        <div class="pokemon-info-card__moves">
                            ${additionalMovesHTML}
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

function createPokemonModal() {
    const elements = {
        modal: document.getElementById('pokemonModal'),
        overlay: document.getElementById('modalOverlay'),
        content: document.getElementById('modalContent'),
        body: document.getElementById('modalBody'),
        closeBtn: document.getElementById('modalClose'),
        prevBtn: document.getElementById('prevPokemon'),
        nextBtn: document.getElementById('nextPokemon')
    };

    function updateNavigation(navigation) {
        if (elements.prevBtn) {
            elements.prevBtn.disabled = !navigation.hasPrev;
            elements.prevBtn.onclick = navigation.onPrev || null;
        }

        if (elements.nextBtn) {
            elements.nextBtn.disabled = !navigation.hasNext;
            elements.nextBtn.onclick = navigation.onNext || null;
        }
    }

    function renderPokemon(pokemon, navigation = {}) {
        elements.body.innerHTML = createPokemonDetailHTML(pokemon);
        updateNavigation(navigation);
    }

    function close() {
        elements.modal.hidden = true;
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleModalKeydown);

        const firstCard = document.getElementById('pokemonGrid')?.querySelector('.pokemon-card');
        firstCard?.focus();
    }

    function handleModalKeydown(event) {
        if (event.key === 'Escape') {
            close();
        } else if (event.key === 'ArrowLeft' && elements.prevBtn && !elements.prevBtn.disabled) {
            elements.prevBtn.click();
        } else if (event.key === 'ArrowRight' && elements.nextBtn && !elements.nextBtn.disabled) {
            elements.nextBtn.click();
        }
    }

    function open(pokemon, navigation = {}) {
        renderPokemon(pokemon, navigation);
        elements.modal.hidden = false;
        document.body.style.overflow = 'hidden';
        elements.closeBtn?.focus();
        document.addEventListener('keydown', handleModalKeydown);
    }

    function update(pokemon, navigation = {}) {
        if (elements.modal.hidden) {
            open(pokemon, navigation);
            return;
        }

        renderPokemon(pokemon, navigation);
    }

    function init() {
        elements.closeBtn?.addEventListener('click', close);
        elements.overlay?.addEventListener('click', close);
        elements.content?.addEventListener('click', event => {
            event.stopPropagation();
        });
    }

    return {
        close,
        createPokemonDetailHTML,
        init,
        open,
        update
    };
}

export { createPokemonModal };
