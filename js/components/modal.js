import { formatPokemonId, getPokemonImageUrl, capitalize, formatHeight, formatWeight, getWeaknesses, formatStatName, getStatClass, calculateStatPercentage } from '../utils/formatters.js';

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
    const { id, name, types, height, weight, stats, abilities } = pokemon;
    const primaryType = types[0]?.type?.name || 'normal';
    const typeNames = types.map(type => type.type?.name || type).filter(Boolean);
    const weaknesses = getWeaknesses(typeNames);
    const totalStats = stats.reduce((sum, stat) => sum + stat.base_stat, 0);

    const typesHTML = typeNames.map(type => (
        `<span class="type-badge type-badge--${type.toLowerCase()}">${capitalize(type)}</span>`
    )).join('');

    const weaknessesHTML = weaknesses.map(type => (
        `<span class="type-badge type-badge--${type}">${capitalize(type)}</span>`
    )).join('');

    const abilitiesHTML = abilities.map(ability => {
        const nameLabel = capitalize(ability.ability.name.replace('-', ' '));
        return `<span class="ability-badge ${ability.is_hidden ? 'ability-badge--hidden' : ''}" title="${ability.is_hidden ? 'Hidden Ability' : ''}">${nameLabel}${ability.is_hidden ? ' (Hidden)' : ''}</span>`;
    }).join('');

    const statsHTML = stats.map(stat => {
        const percentage = calculateStatPercentage(stat.base_stat);
        return `
            <div class="pokemon-detail__stat">
                <span class="pokemon-detail__stat-name">${formatStatName(stat.stat.name)}</span>
                <div class="pokemon-detail__stat-bar">
                    <div class="pokemon-detail__stat-fill ${getStatClass(stat.stat.name)}" style="width: ${percentage}%"></div>
                </div>
                <span class="pokemon-detail__stat-value">${stat.base_stat}</span>
            </div>
        `;
    }).join('');

    return `
        <div class="pokemon-detail">
            <div class="pokemon-detail__layout">
                <aside class="pokemon-detail__sidebar" style="background: ${getTypeHeaderColor(primaryType)}; color: white;">
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
                </aside>
                
                <div class="pokemon-detail__main">
                    <section class="pokemon-detail__section pokemon-detail__section--stats">
                        <h3 class="pokemon-detail__section-title">Base Stats</h3>
                        <div class="pokemon-detail__stats">
                            ${statsHTML}
                        </div>
                    </section>

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
                            <h3 class="pokemon-detail__section-title">Weaknesses</h3>
                            <div class="pokemon-detail__weaknesses">
                                ${weaknessesHTML || '<span class="ability-badge">None</span>'}
                            </div>
                        </section>
                    </div>
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
