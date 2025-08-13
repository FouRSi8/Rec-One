"use client";

import { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

function MovieRecommendationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const year = searchParams.get("year");
  const movieIds = useMemo(() => {
    const ids = searchParams.get("movieIds")?.split(",").filter(id => id?.trim()) || [];
    return ids.length === 3 ? ids : null;
  }, [searchParams]);

  const [recommendations, setRecommendations] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useOtherLanguages, setUseOtherLanguages] = useState(false);
  const abortControllerRef = useRef(null);
  const canvasRef = useRef(null);

  // Haptic feedback function
  const triggerHaptic = (duration = 50) => {
    if (navigator.vibrate) {
      navigator.vibrate(duration);
    }
  };

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (!movieIds || !year || !year.includes("-")) {
      setError("Please select exactly 3 movies and a valid year range (e.g., 2010-2020).");
      setLoading(false);
      setRecommendations([]);
      return;
    }

    setLoading(true);
    setError(null);
    setRecommendations([]);
    setCurrentIndex(0);

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const timeoutId = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (!signal.aborted) {
        setError("Request timed out after 20 seconds");
        setLoading(false);
      }
    }, 20000);

    const [minYear, maxYear] = year.split("-").map(Number);
    if (isNaN(minYear) || isNaN(maxYear) || minYear > maxYear) {
      setError("Invalid year range format. Use minYear-maxYear (e.g., 2010-2020).");
      setLoading(false);
      clearTimeout(timeoutId);
      return;
    }

    let fetchUrl = `/api/recommendations?movieIds=${movieIds.join(",")}&year=${year}`;
    if (useOtherLanguages) {
      fetchUrl += `&otherLanguages=true`;
    }

    fetch(fetchUrl, { signal })
      .then((response) => {
        if (signal.aborted) return null;
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (signal.aborted || !data) return;
        clearTimeout(timeoutId);

        if (data.error) {
          throw new Error(data.error);
        }

        const recs = data.allRecommendations || [];
        console.log("Received recommendations:", recs);

        const inputMovieIds = movieIds.map(id => id.toString());
        const filteredRecommendations = recs
          .filter(rec => {
            if (!rec?.release_date) {
              console.warn(`Recommendation ${rec?.title} missing release_date, skipping`);
              return false;
            }
            const releaseYear = new Date(rec.release_date).getFullYear();
            const isInRange = releaseYear >= minYear && releaseYear <= maxYear;
            const isNotInput = !inputMovieIds.includes(rec.id?.toString());
            if (!isInRange) console.warn(`Recommendation ${rec.title} (${releaseYear}) outside ${minYear}-${maxYear}`);
            if (!isNotInput) console.warn(`Recommendation ${rec.title} matches input ID ${rec.id}`);
            return isInRange && isNotInput;
          })
          .map(rec => ({
            ...rec,
            genres: rec.genres || [],
            credits: rec.credits || { crew: [], cast: [] },
            overview: rec.overview || "No summary available",
            poster_path: rec.poster_path || "/default-poster.jpg",
          }));

        if (filteredRecommendations.length > 0) {
          setRecommendations(filteredRecommendations);
          setError(null);
        } else {
          throw new Error("No valid recommendations found for the selected year range.");
        }
      })
      .catch((fetchError) => {
        if (signal.aborted) return;
        clearTimeout(timeoutId);
        setError(fetchError.message || "Failed to fetch recommendations");
        console.error("Fetch Error:", fetchError);
      })
      .finally(() => {
        if (!signal.aborted) {
          setLoading(false);
        }
        clearTimeout(timeoutId);
      });

    return () => {
      clearTimeout(timeoutId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [movieIds, year, useOtherLanguages]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn("Canvas element not found");
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("2D context not supported");
      return;
    }

    const resizeCanvas = () => {
      canvas.height = window.innerHeight;
      canvas.width = window.innerWidth;
    };
    
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const fontSize = window.innerWidth < 640 ? 10 : 14;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(0);

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#22C55E";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        ctx.fillText(text, x, y);
        if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  const handleNextRecommendation = () => {
    triggerHaptic(100); // Longer vibration for navigation
    if (currentIndex < recommendations.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      console.log("Reached the last recommendation");
    }
  };

  const handleOtherLanguages = () => {
    triggerHaptic(50); // Short vibration for action
    setUseOtherLanguages(true);
  };

  const handleBackToMatrix = () => {
    triggerHaptic(100); // Longer vibration for navigation
    router.push("/");
  };

  const currentRecommendation = recommendations[currentIndex];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start bg-cover bg-center overflow-hidden relative px-4 sm:px-6"
      style={{
        backgroundImage: "url('/matrix.jpg')",
        fontFamily: "'Courier New', monospace",
      }}
    >
      <div className="absolute inset-0 backdrop-blur-md" style={{ backgroundColor: "rgba(0, 0, 0, 0.6)", zIndex: 0 }}></div>
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none z-10" />
      <h1 className="text-4xl sm:text-6xl font-extrabold mt-6 sm:mt-8 text-white tracking-wider animate-pulse z-20" style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)" }}>
        Rec&apos;One
      </h1>
      <p className="text-base sm:text-lg mb-4 sm:mb-6 text-gray-300 italic z-20" style={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)" }}>
        Discover your perfect movie match
      </p>
      <div className="w-full max-w-full sm:max-w-6xl flex flex-col sm:flex-row items-start justify-between px-0 sm:px-6 py-6 sm:py-8 z-20">
        <div className="w-full sm:w-1/3 flex items-center justify-center mb-6 sm:mb-0">
          {loading && <div className="text-base sm:text-xl animate-pulse text-white">Scanning Matrix...</div>}
          {error && <div className="text-red-500 text-base sm:text-xl">{error}</div>}
          {!loading && !error && currentRecommendation && (
            <Image
              src={`https://image.tmdb.org/t/p/w300${currentRecommendation.poster_path}`}
              alt={currentRecommendation.title || "Movie Poster"}
              width={200}
              height={300}
              className="w-full max-w-[150px] sm:max-w-xs h-auto object-contain rounded-lg shadow-md border-2 border-white hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.7)] transition-transform duration-300"
              onError={(e) => { e.target.src = "/default-poster.jpg"; e.target.alt = "Default Poster"; }}
            />
          )}
          {!loading && !error && !currentRecommendation && (
            <div className="text-base sm:text-xl text-white">No match found...</div>
          )}
        </div>
        <div className="w-full sm:w-2/3 sm:pl-8">
          <h2 className="text-lg sm:text-2xl font-semibold mb-4 text-white" style={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)" }}>
            Selected Year Range: {year || "Not set"}
          </h2>
          {loading && <p className="text-base sm:text-lg animate-pulse text-white">Analyzing data streams...</p>}
          {error && <p className="text-red-500 text-base sm:text-lg">{error}</p>}
          {!loading && !error && currentRecommendation && (
            <div className="space-y-3">
              <h3 className="text-xl sm:text-3xl font-bold mb-2 text-white" style={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)" }}>
                Recommended: {currentRecommendation.title || "Untitled"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                <p className="text-sm sm:text-lg"><strong>Release Date:</strong> {currentRecommendation.release_date ? new Date(currentRecommendation.release_date).toLocaleDateString() : "N/A"}</p>
                <p className="text-sm sm:text-lg"><strong>Genres:</strong> {currentRecommendation.genres?.map((g) => g.name).join(", ") || "N/A"}</p>
                <div className="text-sm sm:text-lg">
                  <strong>TMDB Rating:</strong> {currentRecommendation.vote_average ? `${currentRecommendation.vote_average.toFixed(1)} / 10` : "N/A"}
                  {currentRecommendation.vote_count && (
                    <span className="text-xs sm:text-sm text-gray-300 ml-2">({currentRecommendation.vote_count} votes)</span>
                  )}
                </div>
                <p className="text-sm sm:text-lg"><strong>Runtime:</strong> {currentRecommendation.runtime || "N/A"} minutes</p>
                <p className="text-sm sm:text-lg"><strong>Director:</strong> {currentRecommendation.credits?.crew?.filter(c => c.job === 'Director').map(d => d.name).join(", ") || "N/A"}</p>
                <p className="text-sm sm:text-lg"><strong>Writer:</strong> {currentRecommendation.credits?.crew?.filter(c => ['Writer', 'Screenplay', 'Story'].includes(c.job)).map(w => w.name).join(", ") || "N/A"}</p>
                <p className="text-sm sm:text-lg"><strong>Production:</strong> {currentRecommendation.production_companies?.map(c => c.name).join(", ") || "N/A"}</p>
                <p className="text-sm sm:text-lg"><strong>Music:</strong> {currentRecommendation.credits?.crew?.filter(c => ['Original Music Composer', 'Music'].includes(c.job)).map(m => m.name).join(", ") || "N/A"}</p>
                <p className="text-sm sm:text-lg"><strong>Original Language:</strong> {currentRecommendation.original_language?.toUpperCase() || "N/A"}</p>
              </div>
              <p className="text-sm sm:text-lg"><strong>Summary:</strong> {currentRecommendation.overview?.substring(0, 150) || "No summary available."}{currentRecommendation.overview?.length > 150 ? "..." : ""}</p>
              {currentRecommendation.credits?.cast?.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-base sm:text-xl font-semibold text-white mb-2" style={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)" }}>
                    Top Cast
                  </h4>
                  <div className="flex flex-wrap gap-2 sm:gap-4">
                    {currentRecommendation.credits.cast.map((actor, index) => (
                      <div key={index} className="flex items-center space-x-2 sm:space-x-3">
                        {actor.profile_path ? (
                          <Image
                            src={`https://image.tmdb.org/t/p/w92${actor.profile_path}`}
                            alt={actor.name || "Cast Member"}
                            width={40}
                            height={40}
                            className="w-10 sm:w-12 h-10 sm:h-12 object-cover rounded-full border-2 border-white shadow-md"
                            onError={(e) => { e.target.src = "/default-profile.jpg"; e.target.alt = "Default Profile"; }}
                          />
                        ) : (
                          <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs border-2 border-white shadow-md">
                            N/A
                          </div>
                        )}
                        <span className="text-sm sm:text-lg text-white" style={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)" }}>
                          {actor.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {currentRecommendation.totalScore && currentRecommendation.totalScore > 0 && (
                <div className="mt-2">
                  {currentRecommendation.strategyUsed && (
                    <p className="text-blue-300 text-xs sm:text-sm">Strategy: {currentRecommendation.strategyUsed}</p>
                  )}
                </div>
              )}
              <div className="flex flex-wrap gap-2 sm:gap-4 mt-4">
                <button
                  onClick={handleNextRecommendation}
                  disabled={currentIndex >= recommendations.length - 1}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-green-500 text-black font-semibold rounded-md hover:bg-green-600 transition duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed touch-target"
                  style={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)" }}
                  aria-label="View next recommendation"
                >
                  Next
                </button>
                <button
                  onClick={handleBackToMatrix}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-green-500 text-black font-semibold rounded-md hover:bg-green-600 transition duration-300 transform hover:scale-105 touch-target"
                  style={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)" }}
                  aria-label="Back to movie selection"
                >
                  Back to Matrix
                </button>
                <button
                  onClick={handleOtherLanguages}
                  disabled={useOtherLanguages}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500 text-black font-semibold rounded-md hover:bg-blue-600 transition duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed touch-target"
                  style={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)" }}
                  aria-label="View recommendations in other languages"
                >
                  {useOtherLanguages ? "Loading Other Languages..." : "Other Languages"}
                </button>
              </div>
            </div>
          )}
          {!loading && !error && !currentRecommendation && (
            <p className="text-base sm:text-lg text-white">No recommendation available...</p>
          )}
        </div>
      </div>
      <div className="absolute bottom-4 right-4 sm:right-6 text-gray-400 text-xs sm:text-sm opacity-70 z-20" style={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)" }}>
        Powered by TMDB
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .scrollbar-none { scrollbar-width: none; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .touch-target {
          min-width: 44px;
          min-height: 44px;
          padding: 8px;
        }
        @media (max-width: 640px) {
          .text-4xl {
            font-size: 2rem;
          }
          .text-base {
            font-size: 0.875rem;
          }
          .text-xs {
            font-size: 0.75rem;
          }
          .max-w-6xl {
            max-width: 100%;
          }
          .gap-4 {
            gap: 0.5rem;
          }
          .px-6 {
            padding-left: 0.5rem;
            padding-right: 0.5rem;
          }
          .py-8 {
            padding-top: 1rem;
            padding-bottom: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-white text-xl animate-pulse" style={{ fontFamily: "'Courier New', monospace" }}>
        Loading Matrix...
      </div>
    </div>
  );
}

export default function MovieRecommendation() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MovieRecommendationContent />
    </Suspense>
  );
}