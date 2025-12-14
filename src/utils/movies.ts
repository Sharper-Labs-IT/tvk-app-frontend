// src/helper/movies.ts
// Converted from your pokemons.js / TVK movie list. (source images preserved). :contentReference[oaicite:4]{index=4}

export const TVK_MOVIES = [
  { name: 'Ghilli', image: 'https://www.lab-1.nl/wp-content/uploads/2024/04/Ghilli-poster.jpg' },
  { name: 'Master', image: 'https://www.filmibeat.com/fanimg/movie/18364/master-photos-images-67380.jpg' },
  { name: 'Leo', image: 'https://wallpapercave.com/wp/wp14342027.jpg' },
  { name: 'Beast', image: 'https://www.kerala9.com/wp-content/uploads/2022/03/beast-tamil-movie-poster-002.jpg' },
  { name: 'Bigil', image: 'https://static.moviecrow.com/gallery/20190622/163585-bigil%203.jpg' },
  { name: 'Mersal', image: 'https://tse3.mm.bing.net/th/id/OIP.5RdBQEba4EhmFX5wy3kFBwHaHa?rs=1&pid=ImgDetMain&o=7&rm=3' },
  { name: 'Theri', image: 'https://m.media-amazon.com/images/M/MV5BMjE4ZmM4MjktN2JhZS00YmY2LWFkMjMtODFhZmNjMDBjM2IzXkEyXkFqcGc@._V1_.jpg' },
  { name: 'Sarkar', image: 'https://tse3.mm.bing.net/th/id/OIP.dYSGfseMmCT5kMf6yykMFwAAAA?rs=1&pid=ImgDetMain&o=7&rm=3' },
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
