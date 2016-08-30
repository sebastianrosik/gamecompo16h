let ids = 0;

export function getNextId () {
  return ids++;
}

let firstNames = [
  'Barbara',
  'Alojzy',
  'Hermenegilda',
  'Ambrozja',
  'Grafira',
  'Glazuria',
  'Gleb',
  'Zbylut',
  'Majkiel',
  'Fabrycjo'
];

let lastNames = [
  'Nowak',
  'Kowalski',
  'Miksa',
  'Szymkowskyy',
  'Koldwind'
];

export function getRandomName() {
  return firstNames[Math.round(Math.random() * (firstNames.length -1))] + ' ' +
          lastNames[Math.round(Math.random() * (lastNames.length -1))]
}
