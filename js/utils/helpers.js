function debounce(callback, wait) {
    let timeoutId;

    return (...args) => {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
            callback(...args);
        }, wait);
    };
}

function extractPokemonId(input) {
    if (typeof input === 'number') {
        return input;
    }

    const match = String(input).match(/\/pokemon\/(\d+)\/?$/);
    if (match) {
        return parseInt(match[1], 10);
    }

    const parsedNumber = parseInt(input, 10);
    return Number.isNaN(parsedNumber) ? null : parsedNumber;
}

function normalizeSearchQuery(query) {
    return String(query || '').toLowerCase().trim();
}

function getNumericSearchId(query) {
    const normalizedQuery = normalizeSearchQuery(query).replace(/^#/, '');

    if (!/^\d+$/.test(normalizedQuery)) {
        return null;
    }

    return parseInt(normalizedQuery, 10);
}

function isNumericSearchQuery(query) {
    return getNumericSearchId(query) !== null;
}

function matchesPokemonSearch(pokemon, query) {
    const normalizedQuery = normalizeSearchQuery(query);

    if (!normalizedQuery) {
        return true;
    }

    if (isNumericSearchQuery(normalizedQuery)) {
        const pokemonId = extractPokemonId(pokemon.id ?? pokemon.url);
        const searchId = getNumericSearchId(normalizedQuery);
        return pokemonId !== null && searchId !== null && pokemonId === searchId;
    }

    return String(pokemon.name || '').toLowerCase().includes(normalizedQuery);
}

export {
    debounce,
    extractPokemonId,
    getNumericSearchId,
    isNumericSearchQuery,
    matchesPokemonSearch,
    normalizeSearchQuery
};
