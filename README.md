# Pokédex

A modern, responsive Pokemon catalogue web application built with vanilla HTML, CSS, and JavaScript.

![Pokedex Preview](assets/images/preview.png)

## Features

### Home Page
- **Card View List**: Beautiful grid layout of Pokemon cards
- **Search**: Search Pokemon by name or ID number
- **Filter**: Filter Pokemon by type
- **Sort**: Sort Pokemon by ID (ascending/descending) or name (A-Z/Z-A)
- **Load More**: Initial load of 10 Pokemon with "Load More" functionality

### Pokemon Card
- Displays Pokemon ID, name, image, and type(s)
- Color-coded backgrounds based on primary type
- Hover effects and smooth animations
- Click to view detailed information

### Detail View (Modal)
- Full Pokemon details including:
  - ID Number and Name
  - High-quality image
  - Height and Weight
  - Type(s)
  - Abilities (including hidden abilities)
  - Base Stats with visual bars
  - **Weaknesses** (calculated from type)
- Previous/Next navigation buttons
- Keyboard navigation support (Arrow keys, Escape)
- Responsive design for all screen sizes

## Project Structure

```
pokedex/
├── index.html              # Main HTML file
├── css/
│   ├── style.css           # Base styles and CSS variables
│   ├── components.css      # Component-specific styles
│   └── responsive.css      # Media queries and responsive design
├── js/
│   ├── main.js             # Module entry point
│   ├── app/
│   │   └── pokedex-app.js  # App controller / orchestration
│   ├── components/
│   │   ├── card.js         # Pokemon card rendering
│   │   ├── filters.js      # Search, sort, and type filter UI
│   │   └── modal.js        # Pokemon detail modal
│   ├── config/
│   │   └── constants.js    # Shared config and type metadata
│   ├── services/
│   │   └── pokemon-api.js  # API and caching layer
│   ├── state/
│   │   └── app-state.js    # App state factory
│   └── utils/
│       ├── cache.js        # Expiring in-memory cache
│       ├── dom.js          # DOM helper utilities
│       ├── formatters.js   # Formatting helpers
│       └── helpers.js      # Search and general helpers
├── assets/
│   ├── icons/
│   │   └── pokeball.svg    # Pokeball icon
│   ├── images/             # Static images
│   └── fonts/              # Custom fonts (if needed)
└── README.md               # This file
```

## API Usage

This application uses the following APIs:

- **PokéAPI** (https://pokeapi.co/) - For Pokemon data
- **Pokemon Assets** (https://assets.pokemon.com/) - For Pokemon images

### Image Format
Pokemon images are fetched from:
```
https://assets.pokemon.com/assets/cms2/img/pokedex/full/{id}.png
```
Where `{id}` is a 3-digit ID (e.g., 001, 025, 150)

## Type Weakness Chart

The weakness system is based on the official Pokemon type effectiveness chart. When a Pokemon has multiple types, the weaknesses are calculated by:

1. Combining all weaknesses from both types
2. Removing types that are resisted by any of the Pokemon's types

| Type | Weaknesses |
|------|------------|
| Normal | Fighting |
| Fire | Water, Ground, Rock |
| Water | Electric, Grass |
| Electric | Ground |
| Grass | Fire, Ice, Poison, Flying, Bug |
| Ice | Fire, Fighting, Rock, Steel |
| Fighting | Flying, Psychic, Fairy |
| Poison | Ground, Psychic |
| Ground | Water, Grass, Ice |
| Flying | Electric, Ice, Rock |
| Psychic | Bug, Ghost, Dark |
| Bug | Fire, Flying, Rock |
| Rock | Water, Grass, Fighting, Ground, Steel |
| Ghost | Ghost, Dark |
| Dragon | Ice, Dragon, Fairy |
| Dark | Fighting, Bug, Fairy |
| Steel | Fire, Fighting, Ground |
| Fairy | Poison, Steel |

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Accessibility Features

- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus management
- Color contrast compliant
- Reduced motion support
- Screen reader friendly

## Performance Optimizations

- Lazy loading for images
- API response caching
- Debounced search input
- Efficient DOM updates with document fragments
- CSS animations with GPU acceleration

## Getting Started

1. Clone or download the repository
2. Open `index.html` in your web browser
3. No build process or dependencies required!

### Local Server (Optional)
For the best experience, serve the files through a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (npx)
npx serve

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## Customization

### Changing the Number of Pokemon per Load
Edit `CONFIG.POKEMON_PER_PAGE` in `js/config/constants.js`:
```javascript
const CONFIG = {
    POKEMON_PER_PAGE: 10,  // Change this value
    // ...
};
```

### Adding Custom Styles
The CSS uses CSS Custom Properties (variables) for easy theming. Edit the `:root` section in `css/style.css`:
```css
:root {
    --color-primary: #dc0a2d;    /* Change primary color */
    --color-secondary: #3b4cca;  /* Change secondary color */
    /* ... */
}
```

## License

This project is for educational purposes. Pokemon and Pokemon character names are trademarks of Nintendo.

## Credits

- Data provided by [PokéAPI](https://pokeapi.co/)
- Pokemon images from [Pokemon.com](https://www.pokemon.com/)
- Type effectiveness chart from [Eurogamer](https://www.eurogamer.net/pokemon-go-type-chart-effectiveness-weaknesses)
