document.addEventListener("DOMContentLoaded", () => {
    const pokeForm = document.getElementById('pokeForm');
    const pokemonNameInput = document.getElementById('pokemon-name');
    const pokemonTypeInput = document.getElementById('pokemonType');
    const pokeCountInput = document.getElementById('pokeCount');
    const parentCards = document.getElementById('parentCards');
    const loader = document.getElementsByClassName('loading')[0]; // Corrected
    const scrollContainer = document.getElementById('scroll');

    pokeForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const pokemonName = pokemonNameInput.value.trim().toLowerCase();
        const pokemonType = pokemonTypeInput.value.trim().toLowerCase();
        const pokeCount = pokeCountInput.value.trim();

        // Show loader and scroll section when submit button is clicked
        loader.style.display = 'block'; // Show loader
        scrollContainer.style.display = 'block'; // Show scroll container

        // Validate inputs
        if (!pokemonName && !pokemonType) {
            alert("Please enter either a Pokémon name or type!");
            loader.style.display = 'none'; // Hide loader if validation fails
            return;
        }

        if (!pokemonName && (pokeCount === '' || isNaN(pokeCount) || pokeCount <= 0)) {
            alert("Please enter a valid number of Pokémon cards!");
            loader.style.display = 'none'; // Hide loader if validation fails
            return;
        }

        // Fetch the Pokémon data based on name or type
        fetchPokemonData(pokemonName, pokemonType, pokeCount);
    });

    function fetchPokemonData(name, type, count) {
        parentCards.innerHTML = ''; // Clear previous cards
        const promises = [];

        if (name) {
            promises.push(fetchSinglePokemonByName(name));
        } else if (type) {
            promises.push(fetchMultiplePokemonByType(type, count));
        }

        //promise concurrency
        Promise.all(promises)
            .then(data => {
                loader.style.display = 'none'; // Hide loader after fetching
                displayPokemonCards(data.flat());
            })
            .catch(error => {
                loader.style.display = 'none'; // Hide loader on error
                console.error('Error fetching Pokémon data:', error);
                alert('Failed to fetch Pokémon data. Please try again.');
            });
    }

    function fetchSinglePokemonByName(name) {
        const url = `https://pokeapi.co/api/v2/pokemon/${name}`;
        return fetch(url)
            .then(response => response.json()) //returns a json that is stored to pokemon, and then it's stored as an array
            .then(pokemon => [formatPokemonData(pokemon)])
            .catch(error => {
                console.error(`Error fetching Pokémon ${name}:`, error);
                alert(`Pokémon with name ${name} not found.`);
                return [];
            });
    }

    function fetchMultiplePokemonByType(type, count) {
        const url = `https://pokeapi.co/api/v2/type/${type}`;
        return fetch(url)
            .then(response => response.json())
            .then(data => {
                //console.log(data);
                const pokemons = data.pokemon.slice(0, count);
                const pokePromises = pokemons.map(p => fetch(p.pokemon.url).then(res => res.json()));
                return Promise.all(pokePromises).then(results => results.map(result => formatPokemonData(result)));
            })
            .catch(error => {
                console.error(`Error fetching Pokémon type ${type}:`, error);
                alert(`Pokémon of type ${type} not found.`);
                return [];
            });
    }

    function formatPokemonData(pokemon) {
        const { id, name, stats, types, sprites } = pokemon;
        return {
            id,
            name,
            hp: stats[0].base_stat,
            attack: stats[1].base_stat,
            defense: stats[2].base_stat,
            types: types.map(t => t.type.name),
            sprite: sprites.other['dream_world']['front_default']
        };
    }

    function displayPokemonCards(pokemonArray) {
        pokemonArray.forEach(pokemon => {
            const card = document.createElement('div');
            card.classList.add('cards');

            card.innerHTML = `
                <div class="card-img">
                    <img src="${pokemon.sprite}" alt="${pokemon.name}">
                </div>
                <div class="card-content">
                    <span class="title">${capitalizeFirstLetter(pokemon.name)}</span>
                    <span class="type-class">${pokemon.types.map(type => `<span class="card-type">${capitalizeFirstLetter(type)}</span>`).join(', ')}</span>
                    <div class="card-details">
                        <span class="stats">
                            <span class="hp">HP: ${pokemon.hp}</span>
                            <span class="attack">Attack: ${pokemon.attack}</span>
                            <span class="defense">Defense: ${pokemon.defense}</span>
                        </span>
                    </div>
                </div>
            `;
            parentCards.appendChild(card);
        });

        scrollContainer.scrollIntoView({ behavior: 'smooth' });
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function fetchCutePokemon() {
        const randomPokemonId = Math.floor(Math.random() * 100) + 1; 
        const pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${randomPokemonId}`;
    
        fetch(pokemonUrl)
            .then(response => response.json())
            .then(data => {
                const pokemonImage = data.sprites.other['official-artwork']['front_default'];
                const pokemonImageElement = document.getElementById('pokemon-image');
                pokemonImageElement.src = pokemonImage;
                pokemonImageElement.alt = data.name;
            })
            .catch(error => console.error('Error fetching Pokémon image:', error));
    }
    
    fetchCutePokemon();    
});
