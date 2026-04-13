/**
 * utils.js - Utility functions and constants for the Pokedex application
 * Contains helper functions, type data, and configuration
 */

// ==========================================
// CONFIGURATION
// ==========================================

const CONFIG = {
    API_BASE_URL: 'https://pokeapi.co/api/v2',
    IMAGE_BASE_URL: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full',
    POKEMON_PER_PAGE: 10,
    MAX_POKEMON_ID: 1010, // Latest Pokemon ID supported
    DEBOUNCE_DELAY: 300,
};

// ==========================================
// POKEMON TYPE DATA
// ==========================================

/**
 * Complete Pokemon type list
 */
const POKEMON_TYPES = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice',
    'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
    'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

/**
 * Type weaknesses chart
 * Maps each Pokemon type to an array of types that are super effective against it
 * Based on: https://www.eurogamer.net/pokemon-go-type-chart-effectiveness-weaknesses
 */
const TYPE_WEAKNESSES = {
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

/**
 * Double weaknesses for dual types (4x damage)
 * Some type combinations have overlapping weaknesses
 */
const TYPE_RESISTANCES = {
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

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Format Pokemon ID to 3-digit string (e.g., 1 -> "001")
 * @param {number} id - Pokemon ID
 * @returns {string} Formatted ID
 */
function formatPokemonId(id) {
    return String(id).padStart(3, '0');
}

/**
 * Get Pokemon image URL
 * @param {number} id - Pokemon ID
 * @returns {string} Image URL
 */
function getPokemonImageUrl(id) {
    const formattedId = formatPokemonId(id);
    return `${CONFIG.IMAGE_BASE_URL}/${formattedId}.png`;
}

/**
 * Capitalize first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Format height from decimeters to meters and feet
 * @param {number} height - Height in decimeters
 * @returns {string} Formatted height string
 */
function formatHeight(height) {
    const meters = (height / 10).toFixed(1);
    const feet = Math.floor(height * 0.328084);
    const inches = Math.round((height * 0.328084 - feet) * 12);
    return `${meters} m (${feet}'${inches}")`;
}

/**
 * Format weight from hectograms to kilograms and pounds
 * @param {number} weight - Weight in hectograms
 * @returns {string} Formatted weight string
 */
function formatWeight(weight) {
    const kg = (weight / 10).toFixed(1);
    const lbs = (weight * 0.220462).toFixed(1);
    return `${kg} kg (${lbs} lbs)`;
}

/**
 * Get weaknesses for a Pokemon based on its types
 * @param {string[]} types - Array of Pokemon types
 * @returns {string[]} Array of weakness types
 */
function getWeaknesses(types) {
    const weaknessSet = new Set();
    const resistanceSet = new Set();

    // Collect all weaknesses and resistances
    types.forEach(type => {
        const typeLower = type.toLowerCase();
        
        // Add weaknesses
        if (TYPE_WEAKNESSES[typeLower]) {
            TYPE_WEAKNESSES[typeLower].forEach(w => weaknessSet.add(w));
        }
        
        // Add resistances
        if (TYPE_RESISTANCES[typeLower]) {
            TYPE_RESISTANCES[typeLower].forEach(r => resistanceSet.add(r));
        }
    });

    // Filter out types that the Pokemon resists
    // A Pokemon is only weak to a type if it's not resisted by any of its types
    const weaknesses = Array.from(weaknessSet).filter(w => {
        // Check if any of the Pokemon's types resist this weakness
        return !types.some(type => {
            const typeLower = type.toLowerCase();
            return TYPE_RESISTANCES[typeLower] && TYPE_RESISTANCES[typeLower].includes(w);
        });
    });

    // Sort alphabetically and return unique values
    return [...new Set(weaknesses)].sort();
}

/**
 * Format stat name for display
 * @param {string} statName - API stat name
 * @returns {string} Formatted stat name
 */
function formatStatName(statName) {
    const statNames = {
        'hp': 'HP',
        'attack': 'Attack',
        'defense': 'Defense',
        'special-attack': 'Sp. Atk',
        'special-defense': 'Sp. Def',
        'speed': 'Speed'
    };
    return statNames[statName] || capitalize(statName);
}

/**
 * Get CSS class for stat bar color
 * @param {string} statName - API stat name
 * @returns {string} CSS class name
 */
function getStatClass(statName) {
    const statClasses = {
        'hp': 'stat-fill--hp',
        'attack': 'stat-fill--attack',
        'defense': 'stat-fill--defense',
        'special-attack': 'stat-fill--sp-attack',
        'special-defense': 'stat-fill--sp-defense',
        'speed': 'stat-fill--speed'
    };
    return statClasses[statName] || '';
}

/**
 * Calculate stat bar width percentage
 * @param {number} value - Stat value
 * @param {number} maxValue - Maximum stat value (default 255)
 * @returns {number} Percentage value
 */
function calculateStatPercentage(value, maxValue = 255) {
    return Math.min((value / maxValue) * 100, 100);
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Create a DOM element with attributes and children
 * @param {string} tag - HTML tag name
 * @param {Object} attributes - Element attributes
 * @param {Array} children - Child elements or text
 * @returns {HTMLElement} Created element
 */
function createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    
    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'dataset') {
            Object.entries(value).forEach(([dataKey, dataValue]) => {
                element.dataset[dataKey] = dataValue;
            });
        } else if (key.startsWith('on') && typeof value === 'function') {
            const eventName = key.slice(2).toLowerCase();
            element.addEventListener(eventName, value);
        } else {
            element.setAttribute(key, value);
        }
    });
    
    // Add children
    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else if (child instanceof Node) {
            element.appendChild(child);
        }
    });
    
    return element;
}

/**
 * Show an element
 * @param {HTMLElement} element - Element to show
 */
function showElement(element) {
    if (element) {
        element.hidden = false;
    }
}

/**
 * Hide an element
 * @param {HTMLElement} element - Element to hide
 */
function hideElement(element) {
    if (element) {
        element.hidden = true;
    }
}

/**
 * Extract Pokemon ID from URL or return the ID if it's already a number
 * @param {string|number} input - Pokemon URL or ID
 * @returns {number} Pokemon ID
 */
function extractPokemonId(input) {
    if (typeof input === 'number') return input;
    
    // Extract ID from URL like "https://pokeapi.co/api/v2/pokemon/25/"
    const match = input.match(/\/pokemon\/(\d+)\/?$/);
    if (match) return parseInt(match[1], 10);
    
    // Try to parse as number
    const num = parseInt(input, 10);
    return isNaN(num) ? null : num;
}

/**
 * Simple local storage cache for API responses
 */
const cache = {
    data: new Map(),
    
    /**
     * Get cached data
     * @param {string} key - Cache key
     * @returns {*} Cached data or null
     */
    get(key) {
        const item = this.data.get(key);
        if (!item) return null;
        
        // Check if expired (1 hour cache)
        if (Date.now() - item.timestamp > 3600000) {
            this.data.delete(key);
            return null;
        }
        
        return item.data;
    },
    
    /**
     * Set cache data
     * @param {string} key - Cache key
     * @param {*} data - Data to cache
     */
    set(key, data) {
        this.data.set(key, {
            data,
            timestamp: Date.now()
        });
    },
    
    /**
     * Clear all cache
     */
    clear() {
        this.data.clear();
    }
};

// Export utilities for use in other modules
// Using window object for vanilla JS module pattern
window.PokedexUtils = {
    CONFIG,
    POKEMON_TYPES,
    TYPE_WEAKNESSES,
    formatPokemonId,
    getPokemonImageUrl,
    capitalize,
    formatHeight,
    formatWeight,
    getWeaknesses,
    formatStatName,
    getStatClass,
    calculateStatPercentage,
    debounce,
    createElement,
    showElement,
    hideElement,
    extractPokemonId,
    cache
};
