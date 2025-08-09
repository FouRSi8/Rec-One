"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function YearSelector() {
  const router = useRouter();
  const canvasRef = useRef(null);
  const currentYear = 2025;
  const startYear = 1900;
  const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => currentYear - i);

  const [selectedYears, setSelectedYears] = useState([]);
  const [firstClickedYear, setFirstClickedYear] = useState(null);

  const handleYearClick = (year) => {
    if (!firstClickedYear) {
      // First click: select from clicked year to current year
      const newSelectedYears = Array.from(
        { length: currentYear - year + 1 },
        (_, i) => year + i
      );
      setSelectedYears(newSelectedYears);
      setFirstClickedYear(year);
    } else if (firstClickedYear === year) {
      // Second click on same year: select only that year
      setSelectedYears([year]);
      setFirstClickedYear(null);
    } else {
      // Second click on different year: select range between clicks
      const start = Math.min(firstClickedYear, year);
      const end = Math.max(firstClickedYear, year);
      const newSelectedYears = Array.from(
        { length: end - start + 1 },
        (_, i) => start + i
      );
      setSelectedYears(newSelectedYears);
      setFirstClickedYear(null);
    }
  };

  const handleNext = () => {
    if (selectedYears.length === 0) {
      alert('Please select at least one year.');
      return;
    }
    const yearRange = `${Math.min(...selectedYears)}-${Math.max(...selectedYears)}`;
    router.push(`/language-mood?year=${yearRange}`);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(0);

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#22C55E';
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
    window.addEventListener('resize', resizeCanvas);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center relative"
      style={{
        fontFamily: "'Courier New', monospace",
        backgroundImage: "url('/matrix.jpg')",
      }}
    >
      <div className="absolute inset-0 backdrop-blur-md" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 0 }}></div>
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none z-10" />
      <h1 className="text-6xl font-extrabold mb-8 text-white tracking-wider animate-pulse z-20" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>
        Rec&apos;One
      </h1>
      <p className="text-lg mb-6 text-gray-300 italic z-20" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>
        Click Once to select all years ahead
      </p>
      <p className="text-lg mb-6 text-gray-300 italic z-20" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>
        Click Twice to select a specific year
      </p>
      <p className="text-lg mb-6 text-gray-300 italic z-20" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>
        Click on two years to select the interval
      </p>
      <div className="text-center z-20">
        <h2 className="text-xl font-semibold text-gray-200 mb-4" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>
          Choose Movie Release Years {selectedYears.length > 0 ? `(${Math.min(...selectedYears)}-${Math.max(...selectedYears)})` : ''}
        </h2>
        <div className="grid grid-cols-10 gap-2 max-w-2xl mx-auto p-4 max-h-96 overflow-y-auto scrollbar-none" role="grid" aria-label="Year selection grid">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => handleYearClick(year)}
              className={`p-2 rounded-lg transition duration-200 ${
                selectedYears.includes(year)
                  ? 'bg-green-500 text-black'
                  : 'bg-gray-800 text-gray-200 hover:bg-green-500 hover:text-black'
              }`}
              style={{ fontFamily: "'Courier New', monospace", textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}
              aria-label={`Select year ${year}`}
            >
              {year}
            </button>
          ))}
        </div>
        <div className="flex justify-center gap-2 mt-2">
          <button
            onClick={handleNext}
            disabled={selectedYears.length === 0}
            className="px-6 py-2 bg-green-500 text-black font-semibold rounded-lg hover:bg-green-600 transition duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: "'Courier New', monospace", textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}
            aria-label="Proceed to next step"
          >
            Next
          </button>
        </div>
      </div>
      <div className="absolute bottom-4 text-gray-400 text-sm opacity-70 z-20" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>
        Powered by Pure Vibe-coding
      </div>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&display=swap');
        .scrollbar-none {
          scrollbar-width: none;
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}