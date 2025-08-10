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
  const [showChangelog, setShowChangelog] = useState(false);

  // Sample changelog data - replace with your actual changelog
  const changelog = [
    {
      version: "1.3",
      date: "2025-08-10",
      changes: [
        "Introduced Other Language filter-",
        "Now you can get more movies of a different language with the same criteria",
        "Other minor bug fixes"

      ]
    },
    {
      version: "1.2",
      date: "2025-08-10",
      changes: [
        "Introduced Changelog",
        "Improved Movie recommendation engine",
        "Dominant Language based result system introduced",
        "Version 2.0 will introduce a more responsive ui"

      ]
    },
    {
      version: "1.1",
      date: "2025-08-09",
      changes: [
        "Introduced range selection functionality",
        "Added visual feedback for selected years",
        "Implemented better error handling",
        "Enhanced accessibility features"
      ]
    },
    {
      version: "1.0",
      date: "2025-08-09",
      changes: [
        "Initial release of Rec'One",
        "Basic year selection functionality",
        "Movie recommendation engine",
        "Added Matrix-style background animation",
        "Clean and intuitive interface"
      ]
    }
  ];

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

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showChangelog) {
        setShowChangelog(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showChangelog]);

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
      
      {/* Changelog Button */}
      <button
        onClick={() => setShowChangelog(true)}
        className="fixed top-6 right-6 group flex items-center gap-2 px-4 py-2 bg-gray-800/80 hover:bg-green-500/20 border border-green-500/30 hover:border-green-400 text-green-400 hover:text-green-300 rounded-lg transition-all duration-300 backdrop-blur-sm z-30 transform hover:scale-105"
        style={{ 
          fontFamily: "'Courier New', monospace", 
          textShadow: '0 0 10px rgba(34, 197, 94, 0.5)' 
        }}
        aria-label="View changelog"
      >
        <div className="relative">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75"></div>
        </div>
        <span className="text-sm font-mono">
          <span className="hidden sm:inline">CHANGELOG</span>
          <span className="sm:hidden">LOG</span>
        </span>
        <div className="text-xs opacity-60 group-hover:opacity-100 transition-opacity duration-300">
          v{changelog[0].version}
        </div>
      </button>

      {/* Main Content */}
      <h1 className="text-6xl font-extrabold mb-8 text-white tracking-wider animate-pulse z-20" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>
        Rec&apos;One
      </h1>
     
      <div className="text-center z-20">
        <h2 className="text-xl font-semibold text-gray-200 mb-4" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>
          Choose Movie Release Years {selectedYears.length > 0 ? `(${Math.min(...selectedYears)}-${Math.max(...selectedYears)})` : ''}
        </h2>
        <p className="text-sm mb-2 text-gray-300 italic z-20" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>
          Click Once to select all years ahead
        </p>
        <p className="text-sm mb-2 text-gray-300 italic z-20" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>
          Click Twice to select a specific year
        </p>
        <p className="text-sm mb-6 text-gray-300 italic z-20" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>
          Click on two years to select the interval (inclusive)
        </p>
        
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
        version {changelog[0].version}
      </div>

      {/* Changelog Modal */}
      {showChangelog && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && setShowChangelog(false)}
        >
          <div className="bg-gray-900/95 border border-green-500/30 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden backdrop-blur-md animate-slide-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-green-500/20">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-4 h-4 bg-green-400 rounded-full animate-ping opacity-75"></div>
                </div>
                <h2 
                  className="text-2xl font-bold text-green-400"
                  style={{ 
                    fontFamily: "'Courier New', monospace",
                    textShadow: '0 0 10px rgba(34, 197, 94, 0.5)' 
                  }}
                >
                  CHANGELOG
                </h2>
              </div>
              <button
                onClick={() => setShowChangelog(false)}
                className="text-gray-400 hover:text-white transition-colors duration-200 p-2 hover:bg-gray-800 rounded-lg group"
                aria-label="Close changelog"
              >
                <svg className="w-5 h-5 transform group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh] scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-green-600">
              <div className="space-y-6">
                {changelog.map((version, index) => (
                  <div 
                    key={version.version} 
                    className={`border border-green-500/20 rounded-lg p-5 bg-gray-800/30 hover:bg-gray-800/50 transition-all duration-300 animate-fade-in-delayed`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span 
                          className="text-xl font-bold text-green-400"
                          style={{ 
                            fontFamily: "'Courier New', monospace",
                            textShadow: '0 0 5px rgba(34, 197, 94, 0.3)' 
                          }}
                        >
                          v{version.version}
                        </span>
                        {index === 0 && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <span className="text-gray-400 text-sm font-mono">
                        {version.date}
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {version.changes.map((change, changeIndex) => (
                        <li 
                          key={changeIndex}
                          className="flex items-start gap-3 text-gray-300 text-sm leading-relaxed"
                        >
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span>{change}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-green-500/20 bg-gray-900/50">
              <div className="flex items-center justify-between">
                <p className="text-gray-400 text-xs font-mono">
                  Press <kbd className="px-2 py-1 bg-gray-800 rounded text-green-400 border border-green-500/30">ESC</kbd> to close
                </p>
                <button
                  onClick={() => setShowChangelog(false)}
                  className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 rounded-lg transition-all duration-200 text-sm font-mono hover:scale-105"
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&display=swap');
        
        .scrollbar-none {
          scrollbar-width: none;
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: #059669 #1f2937;
        }

        .scrollbar-thin::-webkit-scrollbar {
          width: 8px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 4px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #059669;
          border-radius: 4px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #10b981;
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-up {
          from { 
            opacity: 0; 
            transform: translateY(20px) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }

        @keyframes fade-in-delayed {
          from { 
            opacity: 0; 
            transform: translateX(-20px); 
          }
          to { 
            opacity: 1; 
            transform: translateX(0); 
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }

        .animate-fade-in-delayed {
          animation: fade-in-delayed 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}