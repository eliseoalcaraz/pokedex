export const CONFIG = {
    API_BASE_URL: 'https://pokeapi.co/api/v2',
    IMAGE_BASE_URL: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full',
    POKEMON_PER_PAGE: 10,
    MAX_POKEMON_ID: 1010,
    DEBOUNCE_DELAY: 300
};

export const POKEMON_TYPES = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice',
    'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
    'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

export const TYPE_WEAKNESSES = {
    normal: ['fighting'],
    fire: ['water', 'ground', 'rock'],
    water: ['electric', 'grass'],
    electric: ['ground'],
    grass: ['fire', 'ice', 'poison', 'flying', 'bug'],
    ice: ['fire', 'fighting', 'rock', 'steel'],
    fighting: ['flying', 'psychic', 'fairy'],
    poison: ['ground', 'psychic'],
    ground: ['water', 'grass', 'ice'],
    flying: ['electric', 'ice', 'rock'],
    psychic: ['bug', 'ghost', 'dark'],
    bug: ['fire', 'flying', 'rock'],
    rock: ['water', 'grass', 'fighting', 'ground', 'steel'],
    ghost: ['ghost', 'dark'],
    dragon: ['ice', 'dragon', 'fairy'],
    dark: ['fighting', 'bug', 'fairy'],
    steel: ['fire', 'fighting', 'ground'],
    fairy: ['poison', 'steel']
};

export const TYPE_RESISTANCES = {
    normal: ['ghost'],
    fire: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'],
    water: ['fire', 'water', 'ice', 'steel'],
    electric: ['electric', 'flying', 'steel'],
    grass: ['water', 'electric', 'grass', 'ground'],
    ice: ['ice'],
    fighting: ['bug', 'rock', 'dark'],
    poison: ['grass', 'fighting', 'poison', 'bug', 'fairy'],
    ground: ['poison', 'rock', 'electric'],
    flying: ['grass', 'fighting', 'bug', 'ground'],
    psychic: ['fighting', 'psychic'],
    bug: ['grass', 'fighting', 'ground'],
    rock: ['normal', 'fire', 'poison', 'flying'],
    ghost: ['poison', 'bug', 'normal', 'fighting'],
    dragon: ['fire', 'water', 'electric', 'grass'],
    dark: ['ghost', 'dark', 'psychic'],
    steel: ['normal', 'grass', 'ice', 'flying', 'psychic', 'bug', 'rock', 'dragon', 'steel', 'fairy', 'poison'],
    fairy: ['fighting', 'bug', 'dark', 'dragon']
};
