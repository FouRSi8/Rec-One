"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation"; // Import useRouter for navigation

export default function YearSelector() {
  const [selectedYear, setSelectedYear] = useState(null);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const canvasRef = useRef(null);
  const router = useRouter(); // Initialize router

  const handleYearClick = (year) => {
    setSelectedYear(year);
    setIsAllSelected(false); // Deselect "all" when a specific year is clicked
  };

  const handleSelectAllToggle = () => {
    if (!isAllSelected) {
      setSelectedYear("1900-2025"); // Select all years
      setIsAllSelected(true);
      // Visually highlight all years
      document.querySelectorAll(".year-button").forEach((btn) => {
        btn.classList.add("bg-green-500", "text-black");
        btn.classList.remove("bg-gray-800", "text-gray-200", "hover:bg-green-500", "hover:text-black");
      });
    } else {
      setSelectedYear(null); // Deselect all
      setIsAllSelected(false);
      // Reset all year buttons
      document.querySelectorAll(".year-button").forEach((btn) => {
        btn.classList.remove("bg-green-500", "text-black");
        btn.classList.add("bg-gray-800", "text-gray-200", "hover:bg-green-500", "hover:text-black");
      });
    }
  };

  const handleNext = () => {
    if (selectedYear) {
      const yearParam = selectedYear === "1900-2025" ? "all" : selectedYear;
      router.push(`/language-mood?year=${yearParam}`);
    }
  };

  // Matrix falling code effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Exit if canvas is not available
    const ctx = canvas.getContext("2d");
    if (!ctx) return; // Exit if 2d context is not supported

    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

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
    const resizeCanvas = () => {
      canvas.height = window.innerHeight;
      canvas.width = window.innerWidth;
    };
    window.addEventListener("resize", resizeCanvas);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  // Generate years from 1900 to current year (2025)
  const currentYear = new Date().getFullYear(); // 2025 as of August 05, 2025
  const years = Array.from({ length: currentYear - 1899 }, (_, i) => currentYear - i);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center relative"
      style={{
        fontFamily: "'Courier New', monospace",
        backgroundImage: "url('/matrix.jpg')",
      }}
    >
      <div className="absolute inset-0 backdrop-blur-md" style={{ backgroundColor: "rgba(0, 0, 0, 0.6)", zIndex: 0 }}></div>
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none z-10" />
      <h1 className="text-6xl font-extrabold mb-8 text-white tracking-wider animate-pulse z-20" style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)" }}>
        Take&apos;One
      </h1>
      <p className="text-lg mb-6 text-gray-300 italic z-20" style={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)" }}>
        Discover your perfect movie, one on track and one against.
      </p>
      <div className="text-center z-20">
        <h2 className="text-xl font-semibold text-gray-200 mb-4" style={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)" }}>
          Choose Base Year (all movies from this year onward)
        </h2>
        <div className="grid grid-cols-5 gap-2 max-w-2xl mx-auto p-4 max-h-96 overflow-y-auto scrollbar-none" role="grid" aria-label="Year selection grid">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => handleYearClick(year)}
              className={`p-2 rounded-lg transition duration-200 year-button ${
                selectedYear === year || selectedYear === "1900-2025"
                  ? "bg-green-500 text-black"
                  : "bg-gray-800 text-gray-200 hover:bg-green-500 hover:text-black"
              }`}
              style={{ fontFamily: "'Courier New', monospace", textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)" }}
              aria-label={`Select year ${year}`}
            >
              {year}
            </button>
          ))}
        </div>
        <div className="flex justify-center gap-2 mt-2"> {/* Flex container with horizontal gap */}
          <button
            onClick={handleSelectAllToggle}
            className="px-6 py-2 bg-green-500 text-black font-semibold rounded-lg hover:bg-green-600 transition duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: "'Courier New', monospace", textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)" }}
            aria-label={isAllSelected ? "Deselect all years" : "Select all years"}
          >
            {isAllSelected ? "Deselect All" : "Select All"}
          </button>
          <button
            onClick={handleNext}
            disabled={!selectedYear}
            className="px-6 py-2 bg-green-500 text-black font-semibold rounded-lg hover:bg-green-600 transition duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: "'Courier New', monospace", textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)" }}
            aria-label="Proceed to next step"
          >
            Next
          </button>
        </div>
      </div>
      <div className="absolute bottom-4 text-gray-400 text-sm opacity-70 z-20" style={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)" }}>
        Powered by Pure Vibe-coding
      </div>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&display=swap');
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