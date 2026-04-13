function createAppState() {
    return {
        allPokemon: [],
        displayedPokemon: [],
        typeFilteredPokemon: new Map(),
        currentOffset: 0,
        isLoading: false,
        hasMorePokemon: true,
        currentPokemonId: null,
        filterRequestId: 0
    };
}

export { createAppState };
