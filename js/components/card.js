import { createElement } from '../utils/dom.js';
import { capitalize, formatPokemonId, getPokemonImageUrl } from '../utils/formatters.js';

function createTypeBadge(type) {
    return createElement('span', {
        className: `type-badge type-badge--${type.toLowerCase()}`
    }, [capitalize(type)]);
}

function extractTypeNames(types) {
    return types.map(type => {
        if (typeof type === 'string') {
            return type;
        }

        return type.type?.name || 'normal';
    });
}

function attachCardInteractions(card, pokemon, onClick) {
    card.addEventListener('click', () => onClick(pokemon));
    card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClick(pokemon);
        }
    });
}

function createPokemonCard(pokemon, onClick) {
    const { id, name, types } = pokemon;
    const primaryType = types[0]?.type?.name || types[0] || 'normal';

    const card = createElement('article', {
        className: 'pokemon-card',
        dataset: {
            id: String(id),
            type: primaryType.toLowerCase()
        },
        tabindex: '0',
        role: 'button',
        'aria-label': `View details for ${capitalize(name)}`
    });

    const header = createElement('div', { className: 'pokemon-card__header' }, [
        createElement('span', { className: 'pokemon-card__id' }, [`#${formatPokemonId(id)}`])
    ]);

    const imageContainer = createElement('div', { className: 'pokemon-card__image-container' }, [
        createElement('div', { className: 'pokemon-card__image-bg' }),
        createElement('img', {
            className: 'pokemon-card__image',
            src: getPokemonImageUrl(id),
            alt: capitalize(name),
            loading: 'lazy'
        })
    ]);

    const image = imageContainer.querySelector('img');
    image.onerror = function handleCardImageError() {
        this.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
        this.onerror = function handleArtworkFallbackError() {
            this.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
            this.onerror = null;
        };
    };

    const typeBadges = createElement('div', { className: 'pokemon-card__types' });
    extractTypeNames(types).forEach(type => {
        typeBadges.appendChild(createTypeBadge(type));
    });

    const info = createElement('div', { className: 'pokemon-card__info' }, [
        createElement('h2', { className: 'pokemon-card__name' }, [capitalize(name)]),
        typeBadges
    ]);

    card.append(header, imageContainer, info);
    attachCardInteractions(card, pokemon, onClick);

    return card;
}

function renderPokemonCards(container, pokemonList, onCardClick, append = false) {
    if (!container) {
        return;
    }

    if (!append) {
        container.innerHTML = '';
    }

    const fragment = document.createDocumentFragment();
    pokemonList.forEach(pokemon => {
        fragment.appendChild(createPokemonCard(pokemon, onCardClick));
    });

    container.appendChild(fragment);
}

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

function showLoadingSkeletons(container, count = 10) {
    if (!container) {
        return;
    }

    const fragment = document.createDocumentFragment();
    Array.from({ length: count }, () => createSkeletonCard())
        .forEach(card => fragment.appendChild(card));

    container.appendChild(fragment);
}

function removeLoadingSkeletons(container) {
    if (!container) {
        return;
    }

    container.querySelectorAll('.pokemon-card--skeleton').forEach(skeleton => skeleton.remove());
}

export {
    createPokemonCard,
    createSkeletonCard,
    createTypeBadge,
    removeLoadingSkeletons,
    renderPokemonCards,
    showLoadingSkeletons
};
