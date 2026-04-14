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

function createPokemonCard(pokemon, onClick, index = 0) {
    const { id, name, types } = pokemon;
    const primaryType = types[0]?.type?.name || types[0] || 'normal';

    // Outer wrapper for flip animation
    const cardWrapper = createElement('div', {
        className: 'pokemon-card-wrapper',
        style: `--flip-delay: ${index * 80}ms`,
        tabindex: '-1',
        role: 'button',
        'aria-label': `View details for ${capitalize(name)}`
    });

    const card = createElement('article', {
        className: 'pokemon-card',
        dataset: {
            id: String(id),
            type: primaryType.toLowerCase()
        }
    });

    // Card back (Pokemon card back design)
    const cardBack = createElement('div', { className: 'pokemon-card__back' });
    cardBack.innerHTML = `
        <div class="pokemon-card__back-inner">
            <div class="pokemon-card__back-pattern"></div>
            <div class="pokemon-card__back-logo">
                <img src="assets/icons/pokeball.svg" alt="" class="pokemon-card__back-pokeball">
            </div>
        </div>
    `;

    // Card front
    const cardFront = createElement('div', { className: 'pokemon-card__front' });

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

    cardFront.append(header, imageContainer, info);
    card.append(cardBack, cardFront);
    cardWrapper.appendChild(card);
    attachCardInteractions(cardWrapper, pokemon, onClick);

    return cardWrapper;
}

function renderPokemonCards(container, pokemonList, onCardClick, append = false) {
    if (!container) {
        return;
    }

    if (!append) {
        container.innerHTML = '';
    }

    const startIndex = append ? container.children.length : 0;
    const fragment = document.createDocumentFragment();
    pokemonList.forEach((pokemon, index) => {
        fragment.appendChild(createPokemonCard(pokemon, onCardClick, startIndex + index));
    });

    container.appendChild(fragment);

    // Trigger flip animation after a delay to show card backs first
    setTimeout(() => {
        requestAnimationFrame(() => {
            const cards = container.querySelectorAll('.pokemon-card-wrapper:not(.flipped):not(.pokemon-card-wrapper--loading)');
            cards.forEach(card => {
                const pokemonCard = card.querySelector('.pokemon-card');
                
                // Listen for animation end to enable interaction
                const handleTransitionEnd = (e) => {
                    if (e.propertyName === 'transform') {
                        card.classList.add('interactive');
                        card.setAttribute('tabindex', '0');
                        pokemonCard.removeEventListener('transitionend', handleTransitionEnd);
                    }
                };
                
                pokemonCard.addEventListener('transitionend', handleTransitionEnd);
                card.classList.add('flipped');
            });
        });
    }, 300);
}

function createLoadingCard(index = 0) {
    const cardWrapper = createElement('div', {
        className: 'pokemon-card-wrapper pokemon-card-wrapper--loading',
        style: `--flip-delay: ${index * 80}ms`,
        'aria-hidden': 'true'
    });

    const card = createElement('div', {
        className: 'pokemon-card'
    });

    // Card back (Pokemon card back design) - shown during loading
    const cardBack = createElement('div', { className: 'pokemon-card__back' });
    cardBack.innerHTML = `
        <div class="pokemon-card__back-inner">
            <div class="pokemon-card__back-pattern"></div>
            <div class="pokemon-card__back-logo">
                <img src="assets/icons/pokeball.svg" alt="" class="pokemon-card__back-pokeball">
            </div>
        </div>
    `;

    // Empty front face
    const cardFront = createElement('div', { className: 'pokemon-card__front pokemon-card__front--loading' });

    card.append(cardBack, cardFront);
    cardWrapper.appendChild(card);

    return cardWrapper;
}

function showLoadingCards(container, count = 10) {
    if (!container) {
        return;
    }

    // Start index from existing non-loading cards for proper stagger effect
    const existingCards = container.querySelectorAll('.pokemon-card-wrapper:not(.pokemon-card-wrapper--loading)').length;
    
    const fragment = document.createDocumentFragment();
    Array.from({ length: count }, (_, index) => createLoadingCard(existingCards + index))
        .forEach(card => fragment.appendChild(card));

    container.appendChild(fragment);
}

function removeLoadingCards(container) {
    if (!container) {
        return;
    }

    container.querySelectorAll('.pokemon-card-wrapper--loading').forEach(card => card.remove());
}

export {
    createPokemonCard,
    createLoadingCard,
    createTypeBadge,
    removeLoadingCards,
    renderPokemonCards,
    showLoadingCards
};
