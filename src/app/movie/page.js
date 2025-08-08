"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function MovieRecommendation() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const year = searchParams.get("year");
  
  // Memoize movieIds to prevent unnecessary re-renders
  const movieIds = useMemo(() => {
    const ids = searchParams.get("movieIds")?.split(",");
    return ids?.filter(id => id.trim()) || null;
  }, [searchParams]);

  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const abortControllerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Clear previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Validate movieIds
    if (!movieIds || movieIds.length !== 3) {
      setError("Please select exactly 3 movies.");
      setLoading(false);
      setRecommendation(null);
      return;
    }

    // Start fetching
    setLoading(true);
    setError(null);
    setRecommendation(null);
    
    // Create new AbortController for this request
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

    const movieIdsString = movieIds.join(",");
    
    fetch(`/api/recommendations?movieIds=${movieIdsString}&year=${year || ""}`, { 
      signal 
    })
      .then((response) => {
        if (signal.aborted) return null;
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (signal.aborted || !data) return;
        
        clearTimeout(timeoutId);
        
        if (data.error) throw new Error(data.error);
        
        const inputMovieIds = movieIds.map(id => id.toString());
        const recommendedId = data.recommendedMovie?.id?.toString();
        
        if (data.recommendedMovie && !inputMovieIds.includes(recommendedId)) {
          setRecommendation(data.recommendedMovie);
          setError(null);
        } else {
          throw new Error("Recommendation matches an input movie or no valid result");
        }
      })
      .catch((fetchError) => {
        if (signal.aborted) return;
        
        clearTimeout(timeoutId);
        setError(fetchError.message || "Failed to fetch recommendation");
        console.error("Fetch Error:", fetchError);
      })
      .finally(() => {
        if (!signal.aborted) {
          setLoading(false);
        }
        clearTimeout(timeoutId);
      });

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [movieIds, year]); // Only depend on movieIds and year

  // Matrix falling code effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.height = window.innerHeight;
      canvas.width = window.innerWidth;
    };
    
    resizeCanvas();

    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const fontSize = 14;
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
    window.addEventListener("resize", resizeCanvas);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start bg-cover bg-center overflow-hidden relative"
      style={{
        backgroundImage: "url('/matrix.jpg')",
        fontFamily: "'Courier New', monospace",
      }}
    >
      <div className="absolute inset-0 backdrop-blur-md" style={{ backgroundColor: "rgba(0, 0, 0, 0.6)", zIndex: 0 }}></div>
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none z-10" />
      <h1 className="text-6xl font-extrabold mt-8 text-white tracking-wider animate-pulse z-20" style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)" }}>
        Take&apos;One
      </h1>
      <p className="text-lg mb-6 text-gray-300 italic z-20" style={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)" }}>
        Discover your perfect movie match
      </p>
      <div className="w-full max-w-6xl flex items-center justify-between px-6 py-8 z-20">
        <div className="w-1/3 flex items-center justify-center">
          {loading && <div className="text-xl animate-pulse text-white">Scanning Matrix...</div>}
          {error && <div className="text-red-500 text-xl">{error}</div>}
          {!loading && !error && recommendation && (
            <img
              src={`https://image.tmdb.org/t/p/w300${recommendation.poster_path}`}
              alt={recommendation.title}
              className="w-full max-w-xs h-auto object-contain rounded-lg shadow-md border-2 border-white hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.7)] transition-transform duration-300"
              onError={(e) => { e.target.src = "https://via.placeholder.com/300x450"; }}
            />
          )}
          {!loading && !error && !recommendation && (
            <div className="text-xl text-white">No match found...</div>
          )}
        </div>
        <div className="w-2/3 pl-8">
          <h2 className="text-2xl font-semibold mb-4 text-white" style={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)" }}>
            Selected Year: {year || "Not set"}
          </h2>
          {loading && <p className="text-lg animate-pulse text-white">Analyzing data streams...</p>}
          {error && <p className="text-red-500 text-lg">{error}</p>}
          {!loading && !error && recommendation && (
            <div className="space-y-3">
              <h3 className="text-3xl font-bold mb-2 text-white" style={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)" }}>
                Recommended: {recommendation.title}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <p className="text-lg"><strong>Release Date:</strong> {new Date(recommendation.release_date).toLocaleDateString()}</p>
                <p className="text-lg"><strong>Genres:</strong> {recommendation.genres?.map((g) => g.name).join(", ") || "N/A"}</p>
                <p className="text-lg"><strong>Rating:</strong> {recommendation.vote_average || "N/A"} / 10</p>
                <p className="text-lg"><strong>Runtime:</strong> {recommendation.runtime || "N/A"} minutes</p>
                <p className="text-lg"><strong>Director:</strong> {recommendation.credits?.crew?.filter(c => c.job === 'Director').map(d => d.name).join(", ") || "N/A"}</p>
                <p className="text-lg"><strong>Writer:</strong> {recommendation.credits?.crew?.filter(c => ['Writer', 'Screenplay', 'Story'].includes(c.job)).map(w => w.name).join(", ") || "N/A"}</p>
                <p className="text-lg"><strong>Production:</strong> {recommendation.production_companies?.map(c => c.name).join(", ") || "N/A"}</p>
                <p className="text-lg"><strong>Music:</strong> {recommendation.credits?.crew?.filter(c => ['Original Music Composer', 'Music'].includes(c.job)).map(m => m.name).join(", ") || "N/A"}</p>
              </div>
              <p className="text-lg"><strong>Summary:</strong> {recommendation.overview?.substring(0, 200) || "No summary available."}{recommendation.overview?.length > 200 ? "..." : ""}</p>
              {recommendation.totalScore && recommendation.totalScore > 0 && (
                <div className="mt-2">
                  <p className="text-green-400 text-lg"><strong>Score:</strong> {Math.round(recommendation.totalScore)}</p>
                  {recommendation.strategyUsed && (
                    <p className="text-blue-300 text-sm">Strategy: {recommendation.strategyUsed}</p>
                  )}
                  {recommendation.redditSentimentScore && (
                    <p className="text-purple-300 text-sm">Sentiment: {recommendation.redditSentimentScore.toFixed(2)}</p>
                  )}
                </div>
              )}
            </div>
          )}
          {!loading && !error && !recommendation && (
            <p className="text-lg text-white">No recommendation available...</p>
          )}
          <button
            onClick={() => router.push("/")}
            className="mt-6 px-4 py-2 bg-green-500 text-black font-semibold rounded-md hover:bg-green-600 transition duration-300"
            style={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)" }}
            aria-label="Back to movie selection"
          >
            Back to Matrix
          </button>
        </div>
      </div>
      <div className="absolute bottom-4 right-6 text-gray-400 text-sm opacity-70 z-20" style={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)" }}>
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
        .max-w-6xl { max-width: 96rem; }
      `}</style>
    </div>
  );
}