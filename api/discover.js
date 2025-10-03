import { URLSearchParams } from 'url';

export default async function handler(request, response) {
    // 1. Desestructura todos los posibles parámetros de la consulta
    const {
        contentType,
        sortBy,
        genre,
        originalLanguage,
        startYear,
        endYear,
        startRating,
        endRating,
        startVoteCount,
        endVoteCount,
        language
    } = request.query;

    const API_KEY = process.env.TMDB_API_KEY;

    // 2. Verifica que la clave de API esencial esté configurada
    if (!API_KEY) {
        return response.status(500).json({ error: 'TMDB_API_KEY no está configurada en el servidor.' });
    }

    const API_BASE_URL = 'https://api.themoviedb.org/3';
    
    // 3. Inicializa URLSearchParams con los parámetros obligatorios
    const params = new URLSearchParams({
        api_key: API_KEY,
        language: language || 'es-ES',
        sort_by: sortBy || 'popularity.desc',
        include_adult: false,
    });
    
    // 4. Añade condicionalmente los filtros opcionales SOLO si existen
    // ¡Esta es la corrección crucial! Evitamos enviar parámetros con valores 'undefined'.
    if (genre) params.append('with_genres', genre);
    if (originalLanguage) params.append('with_original_language', originalLanguage);

    // Filtros de fecha
    const dateParamPrefix = contentType === 'movie' ? 'primary_release_date' : 'first_air_date';
    if (startYear) params.append(`${dateParamPrefix}.gte`, `${startYear}-01-01`);
    if (endYear) params.append(`${dateParamPrefix}.lte`, `${endYear}-12-31`);

    // Filtros de puntuación
    if (startRating) params.append('vote_average.gte', startRating);
    if (endRating) params.append('vote_average.lte', endRating);

    // Filtros de cantidad de votos
    if (startVoteCount) params.append('vote_count.gte', startVoteCount);
    if (endVoteCount) params.append('vote_count.lte', endVoteCount);

    // 5. Realiza la llamada fetch y maneja la respuesta
    try {
        const tmdbResponse = await fetch(`${API_BASE_URL}/discover/${contentType}?${params}`);
        
        if (!tmdbResponse.ok) {
            // Proporciona un registro de errores más detallado para la depuración
            const errorBody = await tmdbResponse.text();
            console.error('Error de la API de TMDB:', errorBody);
            return response.status(tmdbResponse.status).json({ error: `La solicitud a la API de TMDB falló: ${errorBody}` });
        }

        const data = await tmdbResponse.json();
        return response.status(200).json(data);

    } catch (error) {
        console.error('Error de fetch en el lado del servidor:', error);
        return response.status(500).json({ error: error.message });
    }
}

