(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/src/app/components/MatrixBackground.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>MatrixBackground
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function MatrixBackground() {
    _s();
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MatrixBackground.useEffect": ()=>{
            const canvas = canvasRef.current;
            const ctx = canvas === null || canvas === void 0 ? void 0 : canvas.getContext("2d");
            if (!ctx) return;
            canvas.height = window.innerHeight;
            canvas.width = window.innerWidth;
            const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            const fontSize = 14;
            const columns = canvas.width / fontSize;
            const drops = Array(Math.floor(columns)).fill(0);
            const draw = {
                "MatrixBackground.useEffect.draw": ()=>{
                    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = "#22C55E";
                    ctx.font = "".concat(fontSize, "px monospace");
                    for(let i = 0; i < drops.length; i++){
                        const text = chars.charAt(Math.floor(Math.random() * chars.length));
                        const x = i * fontSize;
                        const y = drops[i] * fontSize;
                        ctx.fillText(text, x, y);
                        if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
                        drops[i]++;
                    }
                }
            }["MatrixBackground.useEffect.draw"];
            const interval = setInterval(draw, 33);
            const resizeCanvas = {
                "MatrixBackground.useEffect.resizeCanvas": ()=>{
                    canvas.height = window.innerHeight;
                    canvas.width = window.innerWidth;
                }
            }["MatrixBackground.useEffect.resizeCanvas"];
            window.addEventListener("resize", resizeCanvas);
            return ({
                "MatrixBackground.useEffect": ()=>{
                    clearInterval(interval);
                    window.removeEventListener("resize", resizeCanvas);
                }
            })["MatrixBackground.useEffect"];
        }
    }["MatrixBackground.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
        ref: canvasRef,
        className: "absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
    }, void 0, false, {
        fileName: "[project]/src/app/components/MatrixBackground.js",
        lineNumber: 50,
        columnNumber: 10
    }, this);
}
_s(MatrixBackground, "UJgi7ynoup7eqypjnwyX/s32POg=");
_c = MatrixBackground;
var _c;
__turbopack_context__.k.register(_c, "MatrixBackground");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/language-mood/page.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>MoviePreferenceSelector
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$MatrixBackground$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/MatrixBackground.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
// Separate component that uses useSearchParams
function MoviePreferenceSelectorContent() {
    _s();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const year = searchParams.get("year");
    const [selectedMovies, setSelectedMovies] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [searchQuery, setSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [searchResults, setSearchResults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MoviePreferenceSelectorContent.useEffect": ()=>{
            if (!year) {
                router.push("/"); // Redirect to year selection if no year is provided
                return;
            }
            if (searchQuery) {
                setLoading(true);
                fetch("/api/movies?q=".concat(encodeURIComponent(searchQuery), "&year=").concat(year)).then({
                    "MoviePreferenceSelectorContent.useEffect": (response)=>{
                        if (!response.ok) throw new Error("Network response was not ok");
                        return response.json();
                    }
                }["MoviePreferenceSelectorContent.useEffect"]).then({
                    "MoviePreferenceSelectorContent.useEffect": (data)=>{
                        setSearchResults(data);
                    }
                }["MoviePreferenceSelectorContent.useEffect"]).catch({
                    "MoviePreferenceSelectorContent.useEffect": (error)=>{
                        console.error("Error fetching search results:", error);
                        setSearchResults([]);
                    }
                }["MoviePreferenceSelectorContent.useEffect"]).finally({
                    "MoviePreferenceSelectorContent.useEffect": ()=>{
                        setLoading(false);
                    }
                }["MoviePreferenceSelectorContent.useEffect"]);
            } else {
                setSearchResults([]);
            }
        }
    }["MoviePreferenceSelectorContent.useEffect"], [
        searchQuery,
        year,
        router
    ]);
    const handleMovieSelect = (movie)=>{
        if (!selectedMovies.some((m)=>m.id === movie.id) && selectedMovies.length < 3) {
            setSelectedMovies([
                ...selectedMovies,
                movie
            ]);
            setSearchQuery("");
        }
    };
    const handleRemoveMovie = (movieId)=>{
        setSelectedMovies(selectedMovies.filter((m)=>m.id !== movieId));
    };
    const handleNext = ()=>{
        if (selectedMovies.length === 3 && year) {
            const movieIds = selectedMovies.map((m)=>m.id).join(",");
            router.push("/movie?year=".concat(year, "&movieIds=").concat(movieIds));
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            fontFamily: "'Courier New', monospace",
            backgroundImage: "url('/matrix.jpg')"
        },
        className: "jsx-cb4c8906e2eb1b52" + " " + "min-h-screen flex flex-col items-center justify-center bg-cover bg-center relative",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    zIndex: 0
                },
                className: "jsx-cb4c8906e2eb1b52" + " " + "absolute inset-0 backdrop-blur-md"
            }, void 0, false, {
                fileName: "[project]/src/app/language-mood/page.js",
                lineNumber: 71,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$MatrixBackground$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/src/app/language-mood/page.js",
                lineNumber: 72,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                style: {
                    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)"
                },
                className: "jsx-cb4c8906e2eb1b52" + " " + "text-6xl font-extrabold mb-8 text-white tracking-wider animate-pulse z-20",
                children: "Rec'One"
            }, void 0, false, {
                fileName: "[project]/src/app/language-mood/page.js",
                lineNumber: 73,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)"
                },
                className: "jsx-cb4c8906e2eb1b52" + " " + "text-lg mb-6 text-gray-300 italic z-20",
                children: "Select three movies you like"
            }, void 0, false, {
                fileName: "[project]/src/app/language-mood/page.js",
                lineNumber: 76,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-cb4c8906e2eb1b52" + " " + "text-center z-20",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        style: {
                            textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)"
                        },
                        className: "jsx-cb4c8906e2eb1b52" + " " + "text-xl font-semibold text-gray-200 mb-4",
                        children: [
                            "Selected Year: ",
                            year || "Not set"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/language-mood/page.js",
                        lineNumber: 80,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-cb4c8906e2eb1b52" + " " + "mb-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                style: {
                                    textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)"
                                },
                                className: "jsx-cb4c8906e2eb1b52" + " " + "text-lg font-semibold text-gray-200 mb-2",
                                children: "Search and Select 3 Movies"
                            }, void 0, false, {
                                fileName: "[project]/src/app/language-mood/page.js",
                                lineNumber: 86,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                value: searchQuery,
                                onChange: (e)=>setSearchQuery(e.target.value),
                                placeholder: "Search movies...",
                                style: {
                                    fontFamily: "'Courier New', monospace",
                                    textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)"
                                },
                                "aria-label": "Search for movies",
                                className: "jsx-cb4c8906e2eb1b52" + " " + "p-2 rounded-lg bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 w-full max-w-xs"
                            }, void 0, false, {
                                fileName: "[project]/src/app/language-mood/page.js",
                                lineNumber: 89,
                                columnNumber: 11
                            }, this),
                            loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)"
                                },
                                className: "jsx-cb4c8906e2eb1b52" + " " + "text-gray-400 mt-2",
                                children: "Loading..."
                            }, void 0, false, {
                                fileName: "[project]/src/app/language-mood/page.js",
                                lineNumber: 98,
                                columnNumber: 23
                            }, this),
                            searchQuery && searchResults.length > 0 && !loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-cb4c8906e2eb1b52" + " " + "mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-2xl mx-auto max-h-96 overflow-y-auto scrollbar-none",
                                children: searchResults.map((movie)=>{
                                    var _movie_release_date;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        onClick: ()=>handleMovieSelect(movie),
                                        style: {
                                            fontFamily: "'Courier New', monospace",
                                            textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)",
                                            width: "200px",
                                            height: "300px"
                                        },
                                        className: "jsx-cb4c8906e2eb1b52" + " " + "fade-in bg-gray-700 rounded-lg cursor-pointer transition-all duration-300 hover:border-2 hover:border-green-500 hover:p-1 shadow-md hover:shadow-lg relative",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-cb4c8906e2eb1b52" + " " + "w-full h-full overflow-hidden rounded-lg",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                    src: "https://image.tmdb.org/t/p/w200".concat(movie.poster_path),
                                                    alt: movie.title,
                                                    width: 200,
                                                    height: 300,
                                                    className: "w-full h-full object-cover",
                                                    onError: (e)=>{
                                                        e.target.src = "https://via.placeholder.com/200x300";
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/language-mood/page.js",
                                                    lineNumber: 114,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/language-mood/page.js",
                                                lineNumber: 113,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontFamily: "'Courier New', monospace",
                                                    textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)"
                                                },
                                                className: "jsx-cb4c8906e2eb1b52" + " " + "absolute bottom-0 left-0 w-full bg-black bg-opacity-70 text-white text-center p-2 rounded-b-lg",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "jsx-cb4c8906e2eb1b52" + " " + "font-semibold truncate",
                                                        children: [
                                                            movie.title,
                                                            " (",
                                                            (_movie_release_date = movie.release_date) === null || _movie_release_date === void 0 ? void 0 : _movie_release_date.split("-")[0],
                                                            ")"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/language-mood/page.js",
                                                        lineNumber: 130,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "jsx-cb4c8906e2eb1b52" + " " + "text-xs",
                                                        children: [
                                                            "Click to select (",
                                                            selectedMovies.length + 1,
                                                            "/3)"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/language-mood/page.js",
                                                        lineNumber: 131,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/language-mood/page.js",
                                                lineNumber: 123,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, movie.id, true, {
                                        fileName: "[project]/src/app/language-mood/page.js",
                                        lineNumber: 102,
                                        columnNumber: 17
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/src/app/language-mood/page.js",
                                lineNumber: 100,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/language-mood/page.js",
                        lineNumber: 85,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-cb4c8906e2eb1b52" + " " + "mb-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                style: {
                                    textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)"
                                },
                                className: "jsx-cb4c8906e2eb1b52" + " " + "text-lg font-semibold text-gray-200 mb-2",
                                children: [
                                    "Selected Movies (",
                                    selectedMovies.length,
                                    "/3)"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/language-mood/page.js",
                                lineNumber: 141,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-cb4c8906e2eb1b52" + " " + "grid grid-cols-1 gap-2 max-w-md mx-auto",
                                children: selectedMovies.map((movie)=>{
                                    var _movie_release_date;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontFamily: "'Courier New', monospace",
                                            textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)"
                                        },
                                        className: "jsx-cb4c8906e2eb1b52" + " " + "p-2 bg-gray-700 rounded-lg flex justify-between items-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-cb4c8906e2eb1b52",
                                                children: [
                                                    movie.title,
                                                    " (",
                                                    (_movie_release_date = movie.release_date) === null || _movie_release_date === void 0 ? void 0 : _movie_release_date.split("-")[0],
                                                    ")"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/language-mood/page.js",
                                                lineNumber: 151,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>handleRemoveMovie(movie.id),
                                                style: {
                                                    fontFamily: "'Courier New', monospace"
                                                },
                                                className: "jsx-cb4c8906e2eb1b52" + " " + "ml-2 px-2 bg-red-500 text-white rounded-lg hover:bg-red-600",
                                                children: "Remove"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/language-mood/page.js",
                                                lineNumber: 152,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, movie.id, true, {
                                        fileName: "[project]/src/app/language-mood/page.js",
                                        lineNumber: 146,
                                        columnNumber: 15
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/src/app/language-mood/page.js",
                                lineNumber: 144,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/language-mood/page.js",
                        lineNumber: 140,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleNext,
                        disabled: selectedMovies.length !== 3 || !year,
                        style: {
                            fontFamily: "'Courier New', monospace",
                            textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)"
                        },
                        "aria-label": "Proceed to movie recommendation",
                        className: "jsx-cb4c8906e2eb1b52" + " " + "mt-6 px-6 py-2 bg-green-500 text-black font-semibold rounded-lg hover:bg-green-600 transition duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed",
                        children: "Next"
                    }, void 0, false, {
                        fileName: "[project]/src/app/language-mood/page.js",
                        lineNumber: 164,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/language-mood/page.js",
                lineNumber: 79,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)"
                },
                className: "jsx-cb4c8906e2eb1b52" + " " + "absolute bottom-4 text-gray-400 text-sm opacity-70 z-20",
                children: "Powered by subreddit sentiment analysis"
            }, void 0, false, {
                fileName: "[project]/src/app/language-mood/page.js",
                lineNumber: 174,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                id: "cb4c8906e2eb1b52",
                children: "@keyframes fadeIn{0%{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}.fade-in.jsx-cb4c8906e2eb1b52{animation:.3s ease-out forwards fadeIn}.scrollbar-none.jsx-cb4c8906e2eb1b52{scrollbar-width:none}.scrollbar-none.jsx-cb4c8906e2eb1b52::-webkit-scrollbar{display:none}"
            }, void 0, false, void 0, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/language-mood/page.js",
        lineNumber: 64,
        columnNumber: 5
    }, this);
}
_s(MoviePreferenceSelectorContent, "TP327mJ2xwrzRxh+Wu+5Zh82wnM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = MoviePreferenceSelectorContent;
// Loading fallback component
function LoadingFallback() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen flex items-center justify-center bg-black",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-white text-xl",
            style: {
                fontFamily: "'Courier New', monospace"
            },
            children: "Loading..."
        }, void 0, false, {
            fileName: "[project]/src/app/language-mood/page.js",
            lineNumber: 206,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/language-mood/page.js",
        lineNumber: 205,
        columnNumber: 5
    }, this);
}
_c1 = LoadingFallback;
function MoviePreferenceSelector() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
        fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LoadingFallback, {}, void 0, false, {
            fileName: "[project]/src/app/language-mood/page.js",
            lineNumber: 216,
            columnNumber: 25
        }, void 0),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MoviePreferenceSelectorContent, {}, void 0, false, {
            fileName: "[project]/src/app/language-mood/page.js",
            lineNumber: 217,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/language-mood/page.js",
        lineNumber: 216,
        columnNumber: 5
    }, this);
}
_c2 = MoviePreferenceSelector;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "MoviePreferenceSelectorContent");
__turbopack_context__.k.register(_c1, "LoadingFallback");
__turbopack_context__.k.register(_c2, "MoviePreferenceSelector");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=src_app_d0426818._.js.map