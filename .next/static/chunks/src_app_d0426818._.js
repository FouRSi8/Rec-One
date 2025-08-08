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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/axios/lib/axios.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$MatrixBackground$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/MatrixBackground.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
function MoviePreferenceSelector() {
    _s();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const year = searchParams.get("year");
    const [selectedMovies, setSelectedMovies] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [searchQuery, setSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [searchResults, setSearchResults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const TMDB_API_KEY = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.TMDB_API_KEY;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MoviePreferenceSelector.useEffect": ()=>{
            if (searchQuery && TMDB_API_KEY) {
                setLoading(true);
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get("https://api.themoviedb.org/3/search/movie?api_key=".concat(TMDB_API_KEY, "&query=").concat(encodeURIComponent(searchQuery), "&include_adult=false")).then({
                    "MoviePreferenceSelector.useEffect": (response)=>{
                        setSearchResults(response.data.results.slice(0, 5)); // Limit to 5 results
                    }
                }["MoviePreferenceSelector.useEffect"]).catch({
                    "MoviePreferenceSelector.useEffect": (error)=>{
                        console.error("Error fetching search results:", error);
                    }
                }["MoviePreferenceSelector.useEffect"]).finally({
                    "MoviePreferenceSelector.useEffect": ()=>{
                        setLoading(false);
                    }
                }["MoviePreferenceSelector.useEffect"]);
            } else {
                setSearchResults([]);
            }
        }
    }["MoviePreferenceSelector.useEffect"], [
        searchQuery,
        TMDB_API_KEY
    ]);
    const handleMovieSelect = (movie)=>{
        if (!selectedMovies.some((m)=>m.id === movie.id) && selectedMovies.length < 3) {
            setSelectedMovies([
                ...selectedMovies,
                movie
            ]);
            setSearchQuery(""); // Clear search after selection
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
            fontFamily: "'Courier New', monospace"
        },
        className: "jsx-5be63dc6ed7d1b88" + " " + "min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black to-gray-900 text-white font-mono relative",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$MatrixBackground$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/src/app/language-mood/page.js",
                lineNumber: 60,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                style: {
                    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)"
                },
                className: "jsx-5be63dc6ed7d1b88" + " " + "text-6xl font-extrabold mb-8 text-white tracking-wider animate-pulse z-10",
                children: "Rec'One"
            }, void 0, false, {
                fileName: "[project]/src/app/language-mood/page.js",
                lineNumber: 61,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)"
                },
                className: "jsx-5be63dc6ed7d1b88" + " " + "text-lg mb-6 text-gray-300 italic z-10",
                children: "Select three movies you like"
            }, void 0, false, {
                fileName: "[project]/src/app/language-mood/page.js",
                lineNumber: 64,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-5be63dc6ed7d1b88" + " " + "text-center z-10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        style: {
                            textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)"
                        },
                        className: "jsx-5be63dc6ed7d1b88" + " " + "text-xl font-semibold text-gray-200 mb-4",
                        children: [
                            "Selected Year: ",
                            year || "Not set"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/language-mood/page.js",
                        lineNumber: 68,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-5be63dc6ed7d1b88" + " " + "mb-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                style: {
                                    textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)"
                                },
                                className: "jsx-5be63dc6ed7d1b88" + " " + "text-lg font-semibold text-gray-200 mb-2",
                                children: "Search and Select 3 Movies"
                            }, void 0, false, {
                                fileName: "[project]/src/app/language-mood/page.js",
                                lineNumber: 74,
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
                                className: "jsx-5be63dc6ed7d1b88" + " " + "p-2 rounded-lg bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 w-full max-w-xs"
                            }, void 0, false, {
                                fileName: "[project]/src/app/language-mood/page.js",
                                lineNumber: 77,
                                columnNumber: 11
                            }, this),
                            loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "jsx-5be63dc6ed7d1b88" + " " + "text-gray-400 mt-2",
                                children: "Loading..."
                            }, void 0, false, {
                                fileName: "[project]/src/app/language-mood/page.js",
                                lineNumber: 86,
                                columnNumber: 23
                            }, this),
                            searchResults.length > 0 && !loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-5be63dc6ed7d1b88" + " " + "mt-2 max-h-40 overflow-y-auto scrollbar-none",
                                children: searchResults.map((movie)=>{
                                    var _movie_release_date;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        onClick: ()=>handleMovieSelect(movie),
                                        style: {
                                            fontFamily: "'Courier New', monospace",
                                            textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)"
                                        },
                                        className: "jsx-5be63dc6ed7d1b88" + " " + "p-2 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600",
                                        children: [
                                            movie.title,
                                            " (",
                                            (_movie_release_date = movie.release_date) === null || _movie_release_date === void 0 ? void 0 : _movie_release_date.split("-")[0],
                                            ")"
                                        ]
                                    }, movie.id, true, {
                                        fileName: "[project]/src/app/language-mood/page.js",
                                        lineNumber: 90,
                                        columnNumber: 17
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/src/app/language-mood/page.js",
                                lineNumber: 88,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/language-mood/page.js",
                        lineNumber: 73,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-5be63dc6ed7d1b88" + " " + "mb-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                style: {
                                    textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)"
                                },
                                className: "jsx-5be63dc6ed7d1b88" + " " + "text-lg font-semibold text-gray-200 mb-2",
                                children: [
                                    "Selected Movies (",
                                    selectedMovies.length,
                                    "/3)"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/language-mood/page.js",
                                lineNumber: 105,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-5be63dc6ed7d1b88" + " " + "grid grid-cols-1 gap-2 max-w-md mx-auto",
                                children: selectedMovies.map((movie)=>{
                                    var _movie_release_date;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontFamily: "'Courier New', monospace",
                                            textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)"
                                        },
                                        className: "jsx-5be63dc6ed7d1b88" + " " + "p-2 bg-gray-700 rounded-lg flex justify-between items-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-5be63dc6ed7d1b88",
                                                children: [
                                                    movie.title,
                                                    " (",
                                                    (_movie_release_date = movie.release_date) === null || _movie_release_date === void 0 ? void 0 : _movie_release_date.split("-")[0],
                                                    ")"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/language-mood/page.js",
                                                lineNumber: 115,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>handleRemoveMovie(movie.id),
                                                style: {
                                                    fontFamily: "'Courier New', monospace"
                                                },
                                                className: "jsx-5be63dc6ed7d1b88" + " " + "ml-2 px-2 bg-red-500 text-white rounded-lg hover:bg-red-600",
                                                children: "Remove"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/language-mood/page.js",
                                                lineNumber: 116,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, movie.id, true, {
                                        fileName: "[project]/src/app/language-mood/page.js",
                                        lineNumber: 110,
                                        columnNumber: 15
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/src/app/language-mood/page.js",
                                lineNumber: 108,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/language-mood/page.js",
                        lineNumber: 104,
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
                        className: "jsx-5be63dc6ed7d1b88" + " " + "mt-6 px-6 py-2 bg-green-500 text-black font-semibold rounded-lg hover:bg-green-600 transition duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed",
                        children: "Next"
                    }, void 0, false, {
                        fileName: "[project]/src/app/language-mood/page.js",
                        lineNumber: 128,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/language-mood/page.js",
                lineNumber: 67,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)"
                },
                className: "jsx-5be63dc6ed7d1b88" + " " + "absolute bottom-4 text-gray-400 text-sm opacity-70 z-10",
                children: "Powered by subreddit sentiment analysis"
            }, void 0, false, {
                fileName: "[project]/src/app/language-mood/page.js",
                lineNumber: 138,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                id: "5be63dc6ed7d1b88",
                children: ".scrollbar-none.jsx-5be63dc6ed7d1b88{scrollbar-width:none}.scrollbar-none.jsx-5be63dc6ed7d1b88::-webkit-scrollbar{display:none}"
            }, void 0, false, void 0, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/language-mood/page.js",
        lineNumber: 59,
        columnNumber: 5
    }, this);
}
_s(MoviePreferenceSelector, "TP327mJ2xwrzRxh+Wu+5Zh82wnM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = MoviePreferenceSelector;
var _c;
__turbopack_context__.k.register(_c, "MoviePreferenceSelector");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=src_app_d0426818._.js.map