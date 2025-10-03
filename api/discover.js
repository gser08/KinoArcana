// api/discover.js
// Esta función se encarga de las búsquedas principales.

export default async function handler(request, response) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return response.status(500).json({ error: 'La API key no está configurada en el servidor.' });
  }

  const frontendParams = request.query;
  const contentType = frontendParams.contentType || 'movie';
  delete frontendParams.contentType; 

  const params = new URLSearchParams({
    api_key: apiKey,
    ...frontendParams,
  });

  const tmdbUrl = `https://api.themoviedb.org/3/discover/${contentType}?${params}`;

  try {
    const tmdbResponse = await fetch(tmdbUrl);
    if (!tmdbResponse.ok) {
      const errorData = await tmdbResponse.json();
      return response.status(tmdbResponse.status).json(errorData);
    }
    const data = await tmdbResponse.json();
    response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return response.status(200).json(data);
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: 'Ocurrió un error interno en el servidor.' });
  }
}

