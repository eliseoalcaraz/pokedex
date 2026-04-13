import { CONFIG } from '../config/constants.js';
import { createExpiringCache } from '../utils/cache.js';
import { extractPokemonId } from '../utils/helpers.js';

function createPokemonApi({ cache = createExpiringCache() } = {}) {
    const detailedPokemon = new Map();
    let pokemonIndexPromise = null;

    async function fetchWithCache(url) {
        const cachedResponse = cache.get(url);
        if (cachedResponse) {
            return cachedResponse;
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        cache.set(url, data);
        return data;
    }

    async function fetchPokemonList(limit = CONFIG.POKEMON_PER_PAGE, offset = 0) {
        const url = `${CONFIG.API_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`;
        const data = await fetchWithCache(url);
        return data.results;
    }

    async function fetchPokemonIndex() {
        if (!pokemonIndexPromise) {
            pokemonIndexPromise = fetchPokemonList(CONFIG.MAX_POKEMON_ID, 0);
        }

        return pokemonIndexPromise;
    }

    async function fetchPokemonDetails(idOrUrl) {
        let id = null;
        let url = null;

        if (typeof idOrUrl === 'number' || !Number.isNaN(parseInt(idOrUrl, 10))) {
            id = parseInt(idOrUrl, 10);
            url = `${CONFIG.API_BASE_URL}/pokemon/${id}`;
        } else if (typeof idOrUrl === 'string' && idOrUrl.startsWith('http')) {
            id = extractPokemonId(idOrUrl);
            url = idOrUrl;
        } else {
            url = `${CONFIG.API_BASE_URL}/pokemon/${idOrUrl}`;
        }

        if (id !== null && detailedPokemon.has(id)) {
            return detailedPokemon.get(id);
        }

        const data = await fetchWithCache(url);
        if (data.id) {
            detailedPokemon.set(data.id, data);
        }

        return data;
    }

    async function fetchMultiplePokemonDetails(pokemonList) {
        const results = await Promise.all(
            pokemonList.map(async pokemon => {
                const pokemonId = extractPokemonId(pokemon.url);

                try {
                    return await fetchPokemonDetails(pokemonId);
                } catch (error) {
                    console.error(`Failed to fetch Pokemon ${pokemonId}:`, error);
                    return null;
                }
            })
        );

        return results.filter(Boolean);
    }

    async function fetchPokemonByType(type) {
        const url = `${CONFIG.API_BASE_URL}/type/${type.toLowerCase()}`;
        const data = await fetchWithCache(url);
        const uniquePokemon = new Map();

        data.pokemon.forEach(({ pokemon }) => {
            const pokemonId = extractPokemonId(pokemon.url);
            if (!pokemonId || pokemonId > CONFIG.MAX_POKEMON_ID || uniquePokemon.has(pokemonId)) {
                return;
            }

            uniquePokemon.set(pokemonId, pokemon);
        });

        return fetchMultiplePokemonDetails([...uniquePokemon.values()]);
    }

    return {
        fetchPokemonByType,
        fetchPokemonDetails,
        fetchPokemonIndex,
        fetchPokemonList,
        fetchMultiplePokemonDetails,
        getCachedPokemon: id => detailedPokemon.get(id),
        hasCachedPokemon: id => detailedPokemon.has(id)
    };
}

export { createPokemonApi };
