// Escenarios de batalla para Fase 4
// Cada escenario: tu Pokémon, rival, movimientos disponibles, respuesta correcta y explicación

export const BATTLE_SCENARIOS = [
  {
    id: 1,
    your: { id: 445, name: 'Garchomp', types: ['dragon', 'ground'] },
    rival: { id: 212, name: 'Scizor', types: ['bug', 'steel'] },
    moves: [
      { name: 'Earthquake', type: 'ground' },
      { name: 'Dragon Claw', type: 'dragon' },
      { name: 'Stone Edge', type: 'rock' },
      { name: 'Fire Fang', type: 'fire' },
    ],
    correct: 'Fire Fang',
    explanation: 'Scizor es Bug/Acero. Tierra hace ×1 (Acero resiste), Dragón hace ×1, Roca hace ×1. Fuego es súper efectivo contra Acero y Bicho: ×2×2 = ×4.',
  },
  {
    id: 2,
    your: { id: 248, name: 'Tyranitar', types: ['rock', 'dark'] },
    rival: { id: 448, name: 'Lucario', types: ['fighting', 'steel'] },
    moves: [
      { name: 'Stone Edge', type: 'rock' },
      { name: 'Crunch', type: 'dark' },
      { name: 'Earthquake', type: 'ground' },
      { name: 'Ice Punch', type: 'ice' },
    ],
    correct: 'Earthquake',
    explanation: 'Lucario es Lucha/Acero. Roca hace ×0.5 (Acero resiste), Siniestro ×0.5 (Acero resiste), Hielo ×0.5 (Acero resiste). Tierra hace ×2 contra Acero y ×1 contra Lucha = ×2.',
  },
  {
    id: 3,
    your: { id: 6, name: 'Charizard', types: ['fire', 'flying'] },
    rival: { id: 149, name: 'Dragonite', types: ['dragon', 'flying'] },
    moves: [
      { name: 'Flamethrower', type: 'fire' },
      { name: 'Air Slash', type: 'flying' },
      { name: 'Dragon Pulse', type: 'dragon' },
      { name: 'Thunder Punch', type: 'electric' },
    ],
    correct: 'Dragon Pulse',
    explanation: 'Dragonite es Dragón/Volador. Fuego ×0.5 (Dragón resiste), Volador ×1, Eléctrico ×0.5 (Dragón resiste). Dragón es súper efectivo contra Dragón: ×2. Aunque es arriesgado, es la mejor opción ofensiva.',
  },
  {
    id: 4,
    your: { id: 376, name: 'Metagross', types: ['steel', 'psychic'] },
    rival: { id: 94, name: 'Gengar', types: ['ghost', 'poison'] },
    moves: [
      { name: 'Meteor Mash', type: 'steel' },
      { name: 'Psychic', type: 'psychic' },
      { name: 'Earthquake', type: 'ground' },
      { name: 'Thunder Punch', type: 'electric' },
    ],
    correct: 'Earthquake',
    explanation: 'Gengar es Fantasma/Veneno. Acero ×0.5 (resiste), Psíquico ×1 (Fantasma es inmune a... espera, no — Fantasma es débil a Fantasma y Siniestro). Tierra hace ×2 contra Veneno. La mejor opción disponible.',
  },
  {
    id: 5,
    your: { id: 196, name: 'Espeon', types: ['psychic'] },
    rival: { id: 197, name: 'Umbreon', types: ['dark'] },
    moves: [
      { name: 'Psychic', type: 'psychic' },
      { name: 'Shadow Ball', type: 'ghost' },
      { name: 'Dazzling Gleam', type: 'fairy' },
      { name: 'Signal Beam', type: 'bug' },
    ],
    correct: 'Dazzling Gleam',
    explanation: 'Umbreon es Siniestro. Psíquico no tiene efecto (×0) contra Siniestro. Fantasma ×0.5 (Siniestro resiste). Bicho ×2, pero Hada también es ×2 y es la mejor cubierta general contra Siniestro en competitivo.',
  },
  {
    id: 6,
    your: { id: 395, name: 'Empoleon', types: ['water', 'steel'] },
    rival: { id: 3, name: 'Venusaur', types: ['grass', 'poison'] },
    moves: [
      { name: 'Surf', type: 'water' },
      { name: 'Flash Cannon', type: 'steel' },
      { name: 'Ice Beam', type: 'ice' },
      { name: 'Earthquake', type: 'ground' },
    ],
    correct: 'Ice Beam',
    explanation: 'Venusaur es Planta/Veneno. Agua ×0.5 (Planta resiste), Acero ×0.5 (Veneno resiste — en realidad Acero es neutro contra Planta ×1 y ×0.5 contra Veneno = ×0.5). Hielo es súper efectivo contra Planta ×2. La mejor elección.',
  },
  {
    id: 7,
    your: { id: 91, name: 'Cloyster', types: ['water', 'ice'] },
    rival: { id: 149, name: 'Dragonite', types: ['dragon', 'flying'] },
    moves: [
      { name: 'Surf', type: 'water' },
      { name: 'Blizzard', type: 'ice' },
      { name: 'Rock Blast', type: 'rock' },
      { name: 'Spike Cannon', type: 'normal' },
    ],
    correct: 'Blizzard',
    explanation: 'Dragonite es Dragón/Volador. Hielo hace ×2 contra Dragón y ×2 contra Volador = ×4. Es una de las debilidades críticas más conocidas en competitivo. Roca también ×2 pero Hielo es ×4.',
  },
  {
    id: 8,
    your: { id: 260, name: 'Swampert', types: ['water', 'ground'] },
    rival: { id: 254, name: 'Sceptile', types: ['grass'] },
    moves: [
      { name: 'Earthquake', type: 'ground' },
      { name: 'Waterfall', type: 'water' },
      { name: 'Ice Punch', type: 'ice' },
      { name: 'Stone Edge', type: 'rock' },
    ],
    correct: 'Ice Punch',
    explanation: 'Sceptile es Planta pura. Tierra ×1 (Planta resiste tierra), Agua ×0.5 (Planta resiste agua). Hielo es súper efectivo contra Planta ×2. Swampert aprendiendo Ice Punch es justamente para cubrir su única debilidad: el tipo Planta.',
  },
]
