// api/genres.js
// Esta función se encarga únicamente de obtener la lista de géneros.

export default async function handler(request, response) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return response.status(500).json({ error: 'La API key no está configurada en el servidor.' });
  }

  const { contentType } = request.query;
  if (!contentType || (contentType !== 'movie' && contentType !== 'tv')) {
      return response.status(400).json({ error: 'Tipo de contenido no válido.' });
  }

  const tmdbUrl = `https://api.themoviedb.org/3/genre/${contentType}/list?api_key=${apiKey}&language=es-ES`;

  try {
    const tmdbResponse = await fetch(tmdbUrl);
    if (!tmdbResponse.ok) {
      const errorData = await tmdbResponse.json();
      return response.status(tmdbResponse.status).json(errorData);
    }
    const data = await tmdbResponse.json();
    response.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate'); // Cache por 1 día
    return response.status(200).json(data);
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: 'Ocurrió un error interno en el servidor.' });
  }
}
