import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
  }

  const TMDB_API_KEY = process.env.TMDB_API_KEY;

  if (!TMDB_API_KEY) {
    return NextResponse.json({ error: "TMDB API key is missing" }, { status: 500 });
  }

  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false`
    );
    const movies = response.data.results.slice(0, 5); // Limit to 5 results
    return NextResponse.json(movies);
  } catch (error) {
    console.error("Error fetching movies:", error);
    return NextResponse.json({ error: "Failed to fetch movies" }, { status: 500 });
  }
}