// src/helper/movies.ts
// Converted from your pokemons.js / TVK movie list. (source images preserved). :contentReference[oaicite:4]{index=4}

export const TVK_MOVIES = [
  { name: 'Ghilli', image: '/img/ghilli.jpg' },
  { name: 'Master', image: '/img/master.jpg' },
  { name: 'Leo', image: '/img/leo.jpg' },
  { name: 'Beast', image: '/img/beast.jpg' },
  { name: 'Bigil', image: '/img/bigil.jpg' },
  { name: 'Mersal', image: '/img/mersal.jpg' },
  { name: 'Theri', image: '/img/theri.jpg' },
  { name: 'Sarkar', image: '/img/sarkar.jpg' },
];

export const getMovies = (count = 2) => {
  const res: { name: string; image: string; status: '' }[] = [];
  for (let i = 0; i < count; i++) {
    res.push({ name: TVK_MOVIES[i].name, image: TVK_MOVIES[i].image, status: '' });
    res.push({ name: TVK_MOVIES[i].name, image: TVK_MOVIES[i].image, status: '' });
  }
  // shuffle
  return res.sort(() => Math.random() - 0.5);
};
