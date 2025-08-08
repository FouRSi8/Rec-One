"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MatrixBackground from "../components/MatrixBackground";

export default function MoviePreferenceSelector() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const year = searchParams.get("year");
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchQuery) {
      setLoading(true);
      fetch(`/api/movies?q=${encodeURIComponent(searchQuery)}`)
        .then((response) => {
          if (!response.ok) throw new Error("Network response was not ok");
          return response.json();
        })
        .then((data) => {
          setSearchResults(data);
        })
        .catch((error) => {
          console.error("Error fetching search results:", error);
          setSearchResults([]);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setSearchResults([]); // Explicitly clear search results when searchQuery is empty
    }
  }, [searchQuery]);

  const handleMovieSelect = (movie) => {
    if (!selectedMovies.some((m) => m.id === movie.id) && selectedMovies.length < 3) {
      setSelectedMovies([...selectedMovies, movie]);
      setSearchQuery(""); // Clear search after selection
    }
  };

  const handleRemoveMovie = (movieId) => {
    setSelectedMovies(selectedMovies.filter((m) => m.id !== movieId));
  };

  const handleNext = () => {
    if (selectedMovies.length === 3 && year) {
      const movieIds = selectedMovies.map((m) => m.id).join(",");
      router.push(`/movie?year=${year}&movieIds=${movieIds}`);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center relative"
      style={{
        fontFamily: "'Courier New', monospace",
        backgroundImage: "url('/matrix.jpg')",
      }}
    >
      <div className="absolute inset-0 backdrop-blur-md" style={{ backgroundColor: "rgba(0, 0, 0, 0.6)", zIndex: 0 }}></div>
      <MatrixBackground />
      <h1 className="text-6xl font-extrabold mb-8 text-white tracking-wider animate-pulse z-20" style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)" }}>
        Take&apos;One
      </h1>
      <p className="text-lg mb-6 text-gray-300 italic z-20" style={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)" }}>
        Select three movies you like
      </p>
      <div className="text-center z-20">
        <h2 className="text-xl font-semibold text-gray-200 mb-4" style={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)" }}>
          Selected Year: {year || "Not set"}
        </h2>

        {/* Movie Search */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-2" style={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)" }}>
            Search and Select 3 Movies
          </h3>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movies..."
            className="p-2 rounded-lg bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 w-full max-w-xs"
            style={{ fontFamily: "'Courier New', monospace", textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)" }}
            aria-label="Search for movies"
          />
          {loading && <p className="text-gray-400 mt-2" style={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)" }}>Loading...</p>}
          {searchQuery && searchResults.length > 0 && !loading && ( // Only show results if searchQuery is non-empty
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-2xl mx-auto max-h-96 overflow-y-auto scrollbar-none">
              {searchResults.map((movie) => (
                <div
                  key={movie.id}
                  onClick={() => handleMovieSelect(movie)}
                  className="fade-in bg-gray-700 rounded-lg cursor-pointer transition-all duration-300 hover:border-2 hover:border-green-500 hover:p-1 shadow-md hover:shadow-lg relative"
                  style={{
                    fontFamily: "'Courier New', monospace",
                    textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)",
                    width: "200px",
                    height: "300px",
                  }}
                >
                  <div className="w-full h-full overflow-hidden rounded-lg">
                    <img
                      src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = "https://via.placeholder.com/200x300"; }} // Fallback image
                    />
                  </div>
                  <div
                    className="absolute bottom-0 left-0 w-full bg-black bg-opacity-70 text-white text-center p-2 rounded-b-lg"
                    style={{
                      fontFamily: "'Courier New', monospace",
                      textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
                    }}
                  >
                    <p className="font-semibold truncate">{movie.title} ({movie.release_date?.split("-")[0]})</p>
                    <p className="text-xs">Click to select ({selectedMovies.length + 1}/3)</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Movies */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-2" style={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)" }}>
            Selected Movies ({selectedMovies.length}/3)
          </h3>
          <div className="grid grid-cols-1 gap-2 max-w-md mx-auto">
            {selectedMovies.map((movie) => (
              <div
                key={movie.id}
                className="p-2 bg-gray-700 rounded-lg flex justify-between items-center"
                style={{ fontFamily: "'Courier New', monospace", textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)" }}
              >
                <span>{movie.title} ({movie.release_date?.split("-")[0]})</span>
                <button
                  onClick={() => handleRemoveMovie(movie.id)}
                  className="ml-2 px-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  style={{ fontFamily: "'Courier New', monospace" }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleNext}
          disabled={selectedMovies.length !== 3 || !year}
          className="mt-6 px-6 py-2 bg-green-500 text-black font-semibold rounded-lg hover:bg-green-500 transition duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontFamily: "'Courier New', monospace", textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)" }}
          aria-label="Proceed to movie recommendation"
        >
          Next
        </button>
      </div>
      <div className="absolute bottom-4 text-gray-400 text-sm opacity-70 z-20" style={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)" }}>
        Powered by subreddit sentiment analysis
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .scrollbar-none {
          scrollbar-width: none; /* Firefox */
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Edge */
        }
      `}</style>
    </div>
  );
}