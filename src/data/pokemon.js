// Pokémon icónicos por tipo — id para sprites de PokeAPI
// sprite: https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{id}.png

export const POKEMON_BY_TYPE = {
  normal:   [{ id: 143, name: 'Snorlax' }, { id: 133, name: 'Eevee' }, { id: 234, name: 'Stantler' }, { id: 59, name: 'Arcanine' }],
  fire:     [{ id: 6, name: 'Charizard' }, { id: 257, name: 'Blaziken' }, { id: 609, name: 'Chandelure' }, { id: 38, name: 'Ninetales' }],
  water:    [{ id: 9, name: 'Blastoise' }, { id: 134, name: 'Vaporeon' }, { id: 395, name: 'Empoleon' }, { id: 131, name: 'Lapras' }],
  electric: [{ id: 25, name: 'Pikachu' }, { id: 135, name: 'Jolteon' }, { id: 466, name: 'Electivire' }, { id: 587, name: 'Emolga' }],
  grass:    [{ id: 3, name: 'Venusaur' }, { id: 254, name: 'Sceptile' }, { id: 470, name: 'Leafeon' }, { id: 357, name: 'Tropius' }],
  ice:      [{ id: 131, name: 'Lapras' }, { id: 471, name: 'Glaceon' }, { id: 144, name: 'Articuno' }, { id: 478, name: 'Froslass' }],
  fighting: [{ id: 448, name: 'Lucario' }, { id: 107, name: 'Hitmonchan' }, { id: 297, name: 'Hariyama' }, { id: 237, name: 'Hitmontop' }],
  poison:   [{ id: 89, name: 'Muk' }, { id: 452, name: 'Drapion' }, { id: 211, name: 'Qwilfish' }, { id: 317, name: 'Swalot' }],
  ground:   [{ id: 99, name: 'Kingler' }, { id: 105, name: 'Marowak' }, { id: 450, name: 'Hippowdon' }, { id: 330, name: 'Flygon' }],
  flying:   [{ id: 18, name: 'Pidgeot' }, { id: 142, name: 'Aerodactyl' }, { id: 334, name: 'Altaria' }, { id: 277, name: 'Swellow' }],
  psychic:  [{ id: 65, name: 'Alakazam' }, { id: 196, name: 'Espeon' }, { id: 150, name: 'Mewtwo' }, { id: 282, name: 'Gardevoir' }],
  bug:      [{ id: 212, name: 'Scizor' }, { id: 291, name: 'Ninjask' }, { id: 558, name: 'Crustle' }, { id: 123, name: 'Scyther' }],
  rock:     [{ id: 248, name: 'Tyranitar' }, { id: 76, name: 'Golem' }, { id: 377, name: 'Regirock' }, { id: 141, name: 'Kabutops' }],
  ghost:    [{ id: 94, name: 'Gengar' }, { id: 609, name: 'Chandelure' }, { id: 487, name: 'Giratina' }, { id: 477, name: 'Dusknoir' }],
  dragon:   [{ id: 149, name: 'Dragonite' }, { id: 445, name: 'Garchomp' }, { id: 373, name: 'Salamence' }, { id: 230, name: 'Kingdra' }],
  dark:     [{ id: 197, name: 'Umbreon' }, { id: 359, name: 'Absol' }, { id: 442, name: 'Spiritomb' }, { id: 215, name: 'Sneasel' }],
  steel:    [{ id: 306, name: 'Aggron' }, { id: 376, name: 'Metagross' }, { id: 227, name: 'Skarmory' }, { id: 385, name: 'Jirachi' }],
  fairy:    [{ id: 282, name: 'Gardevoir' }, { id: 700, name: 'Sylveon' }, { id: 303, name: 'Mawile' }, { id: 407, name: 'Roserade' }],
}

export function getSpriteUrl(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
}
