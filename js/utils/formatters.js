import { CONFIG, TYPE_RESISTANCES, TYPE_WEAKNESSES } from '../config/constants.js';

function formatPokemonId(id) {
    return String(id).padStart(3, '0');
}

function getPokemonImageUrl(id) {
    return `${CONFIG.IMAGE_BASE_URL}/${formatPokemonId(id)}.png`;
}

function capitalize(value) {
    if (!value) {
        return '';
    }

    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function formatHeight(height) {
    const meters = (height / 10).toFixed(1);
    const feet = Math.floor(height * 0.328084);
    const inches = Math.round((height * 0.328084 - feet) * 12);

    return `${meters} m (${feet}'${inches}")`;
}

function formatWeight(weight) {
    const kilograms = (weight / 10).toFixed(1);
    const pounds = (weight * 0.220462).toFixed(1);

    return `${kilograms} kg (${pounds} lbs)`;
}

function getWeaknesses(types) {
    const uniqueWeaknesses = new Set();

    types.forEach(type => {
        const typeKey = type.toLowerCase();
        TYPE_WEAKNESSES[typeKey]?.forEach(weakness => uniqueWeaknesses.add(weakness));
    });

    return [...uniqueWeaknesses]
        .filter(weakness => {
            return !types.some(type => {
                const typeKey = type.toLowerCase();
                return TYPE_RESISTANCES[typeKey]?.includes(weakness);
            });
        })
        .sort();
}

function formatStatName(statName) {
    const labels = {
        hp: 'HP',
        attack: 'Attack',
        defense: 'Defense',
        'special-attack': 'Sp. Atk',
        'special-defense': 'Sp. Def',
        speed: 'Speed'
    };

    return labels[statName] || capitalize(statName);
}

function getStatClass(statName) {
    const classes = {
        hp: 'stat-fill--hp',
        attack: 'stat-fill--attack',
        defense: 'stat-fill--defense',
        'special-attack': 'stat-fill--sp-attack',
        'special-defense': 'stat-fill--sp-defense',
        speed: 'stat-fill--speed'
    };

    return classes[statName] || '';
}

function calculateStatPercentage(value, maxValue = 255) {
    return Math.min((value / maxValue) * 100, 100);
}

export {
    calculateStatPercentage,
    capitalize,
    formatHeight,
    formatPokemonId,
    formatStatName,
    formatWeight,
    getPokemonImageUrl,
    getStatClass,
    getWeaknesses
};
