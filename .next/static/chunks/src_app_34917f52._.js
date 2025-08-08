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
"[project]/src/app/movie/page.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>MovieRecommendation
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
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
// Mock data (replace with API data later)
const mockMovies = [
    {
        id: 1,
        title: "Inception",
        year: 2010,
        language: "English",
        genres: [
            "Action",
            "Sci-Fi",
            "Thriller"
        ],
        poster: "https://via.placeholder.com/200x300",
        description: "A thief enters dreams to steal secrets."
    },
    {
        id: 2,
        title: "The Shawshank Redemption",
        year: 1994,
        language: "English",
        genres: [
            "Drama"
        ],
        poster: "https://via.placeholder.com/200x300",
        description: "Hope and friendship in prison."
    },
    {
        id: 3,
        title: "Parasite",
        year: 2019,
        language: "Korean",
        genres: [
            "Drama",
            "Thriller"
        ],
        poster: "https://via.placeholder.com/200x300",
        description: "A family cons their way into wealth."
    },
    {
        id: 4,
        title: "Spirited Away",
        year: 2001,
        language: "Japanese",
        genres: [
            "Animation",
            "Fantasy"
        ],
        poster: "https://via.placeholder.com/200x300",
        description: "A girl navigates a magical world."
    }
];
function MovieRecommendation() {
    console.log("TMDB API Key:", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.TMDB_API_KEY);
}
_c = MovieRecommendation;
// Replace with your TMDB API key
const TMDB_API_KEY = "YOUR_TMDB_API_KEY";
// Replace with your Reddit API credentials
const REDDIT_CLIENT_ID = "YOUR_REDDIT_CLIENT_ID";
const REDDIT_CLIENT_SECRET = "YOUR_REDDIT_CLIENT_SECRET";
const REDDIT_USERNAME = "YOUR_REDDIT_USERNAME";
const REDDIT_PASSWORD = "YOUR_REDDIT_PASSWORD";
function MovieRecommendation() {
    var _searchParams_get;
    _s();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const year = parseInt(searchParams.get("year")) || null;
    const language = searchParams.get("language") || "";
    const genres = ((_searchParams_get = searchParams.get("genres")) === null || _searchParams_get === void 0 ? void 0 : _searchParams_get.split(",")) || [];
    const [currentMovieIndex, setCurrentMovieIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [movieDetails, setMovieDetails] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [sentimentScore, setSentimentScore] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Filter movies based on parameters
    const filteredMovies = mockMovies.filter((movie)=>(!year || movie.year >= year) && (!language || movie.language === language) && (!genres.length || genres.every((genre)=>movie.genres.includes(genre))));
    const currentMovie = filteredMovies[currentMovieIndex] || null;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MovieRecommendation.useEffect": ()=>{
            if (currentMovie) {
                fetchMovieDetails(currentMovie.title);
                fetchRedditSentiment(currentMovie.title);
            }
        }
    }["MovieRecommendation.useEffect"], [
        currentMovie
    ]);
    const fetchMovieDetails = async (title)=>{
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get("https://api.themoviedb.org/3/search/movie?api_key=".concat(TMDB_API_KEY, "&query=").concat(encodeURIComponent(title)));
            const movie = response.data.results[0];
            if (movie) {
                setMovieDetails({
                    rating: movie.vote_average,
                    runtime: movie.runtime,
                    overview: movie.overview,
                    release_date: movie.release_date
                });
            }
        } catch (error) {
            console.error("Error fetching movie details:", error);
        }
    };
    const fetchRedditSentiment = async (title)=>{
        try {
            // Authenticate with Reddit API
            const tokenResponse = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post("https://www.reddit.com/api/v1/access_token", "grant_type=password&username=".concat(REDDIT_USERNAME, "&password=").concat(REDDIT_PASSWORD), {
                auth: {
                    username: REDDIT_CLIENT_ID,
                    password: REDDIT_CLIENT_SECRET
                },
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            });
            const token = tokenResponse.data.access_token;
            // Search for posts in r/movies
            const searchResponse = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get("https://oauth.reddit.com/r/movies/search?q=".concat(encodeURIComponent(title), "&limit=10"), {
                headers: {
                    Authorization: "Bearer ".concat(token)
                }
            });
            const posts = searchResponse.data.data.children;
            let positive = 0, negative = 0, neutral = 0;
            posts.forEach((post)=>{
                const text = post.data.title + " " + (post.data.selftext || "");
                // Simple sentiment analysis (replace with VADER or a model later)
                if (text.toLowerCase().includes("good") || text.toLowerCase().includes("great")) positive++;
                else if (text.toLowerCase().includes("bad") || text.toLowerCase().includes("terrible")) negative++;
                else neutral++;
            });
            const total = positive + negative + neutral;
            const score = total > 0 ? (positive - negative) / total : 0;
            setSentimentScore((score * 100).toFixed(1)); // Scale to percentage
        } catch (error) {
            console.error("Error fetching Reddit sentiment:", error);
        }
    };
    const handleNextMovie = ()=>{
        setCurrentMovieIndex((prev)=>(prev + 1) % filteredMovies.length || 0);
    };
    const handleBack = ()=>{
        router.push("/language-mood");
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black to-gray-900 text-white font-sans relative",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$MatrixBackground$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/src/app/movie/page.js",
                lineNumber: 124,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                className: "text-6xl font-extrabold mb-8 text-white tracking-wider drop-shadow-[0_0_10px_rgba(34,197,94,0.7)] animate-pulse z-10",
                style: {
                    fontFamily: "'Cinzel', serif"
                },
                children: "Rec'One"
            }, void 0, false, {
                fileName: "[project]/src/app/movie/page.js",
                lineNumber: 125,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-lg mb-6 text-gray-300 italic z-10",
                children: "Your movie recommendation"
            }, void 0, false, {
                fileName: "[project]/src/app/movie/page.js",
                lineNumber: 128,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center z-10",
                children: currentMovie ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-md mx-auto",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                            src: currentMovie.poster,
                            alt: currentMovie.title,
                            className: "w-full h-auto rounded-lg mb-4"
                        }, void 0, false, {
                            fileName: "[project]/src/app/movie/page.js",
                            lineNumber: 132,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-2xl font-semibold text-gray-200",
                            children: [
                                currentMovie.title,
                                " (",
                                currentMovie.year,
                                ")"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/movie/page.js",
                            lineNumber: 133,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-gray-300 mb-2",
                            children: [
                                "Language: ",
                                currentMovie.language
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/movie/page.js",
                            lineNumber: 134,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-gray-300 mb-2",
                            children: [
                                "Genres: ",
                                currentMovie.genres.join(", ")
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/movie/page.js",
                            lineNumber: 135,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-gray-400 mb-2",
                            children: [
                                "Description: ",
                                currentMovie.description
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/movie/page.js",
                            lineNumber: 136,
                            columnNumber: 13
                        }, this),
                        movieDetails && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-gray-300 mb-2",
                                    children: [
                                        "IMDb Rating: ",
                                        movieDetails.rating,
                                        "/10"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/movie/page.js",
                                    lineNumber: 139,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-gray-300 mb-2",
                                    children: [
                                        "Runtime: ",
                                        movieDetails.runtime,
                                        " mins"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/movie/page.js",
                                    lineNumber: 140,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-gray-400 mb-2",
                                    children: [
                                        "Plot: ",
                                        movieDetails.overview
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/movie/page.js",
                                    lineNumber: 141,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-gray-300 mb-2",
                                    children: [
                                        "Release Date: ",
                                        movieDetails.release_date
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/movie/page.js",
                                    lineNumber: 142,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true),
                        sentimentScore !== null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-gray-300 mb-2",
                            children: [
                                "Reddit Sentiment Score: ",
                                sentimentScore,
                                "%"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/movie/page.js",
                            lineNumber: 146,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleNextMovie,
                            className: "px-6 py-2 bg-green-500 text-black font-semibold rounded-lg hover:bg-green-600 transition duration-300 transform hover:scale-105",
                            "aria-label": "Get next movie recommendation",
                            children: "Rec'One"
                        }, void 0, false, {
                            fileName: "[project]/src/app/movie/page.js",
                            lineNumber: 148,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleBack,
                            className: "ml-4 px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-300",
                            "aria-label": "Return to genre selection",
                            children: "Back"
                        }, void 0, false, {
                            fileName: "[project]/src/app/movie/page.js",
                            lineNumber: 155,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/movie/page.js",
                    lineNumber: 131,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-gray-400",
                    children: "No movies found matching your criteria."
                }, void 0, false, {
                    fileName: "[project]/src/app/movie/page.js",
                    lineNumber: 164,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/movie/page.js",
                lineNumber: 129,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute bottom-4 text-gray-400 text-sm opacity-70 z-10",
                children: "Powered by subreddit sentiment analysis"
            }, void 0, false, {
                fileName: "[project]/src/app/movie/page.js",
                lineNumber: 167,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/movie/page.js",
        lineNumber: 123,
        columnNumber: 5
    }, this);
}
_s(MovieRecommendation, "3nUdW9rCHdcHTLuk+uETizVfHU4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c1 = MovieRecommendation;
var _c, _c1;
__turbopack_context__.k.register(_c, "MovieRecommendation");
__turbopack_context__.k.register(_c1, "MovieRecommendation");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=src_app_34917f52._.js.map