module.exports = {

"[project]/.next-internal/server/app/api/recommendations/route/actions.js [app-rsc] (server actions loader, ecmascript)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
}}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}}),
"[project]/src/app/api/recommendations/route.js [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "GET": ()=>GET
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$reddit$2e$js$2f$reddit$2e$min$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/reddit.js/reddit.min.js [app-route] (ecmascript)");
;
async function GET(request) {
    const { searchParams } = new URL(request.url);
    const movieIds = searchParams.get("movieIds")?.split(",");
    const year = searchParams.get("year");
    if (!movieIds || movieIds.length !== 3 || !year) {
        return NextResponse.json({
            error: "Please provide exactly 3 movie IDs and a year"
        }, {
            status: 400
        });
    }
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID;
    const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;
    const REDDIT_USER_AGENT = process.env.REDDIT_USER_AGENT;
    if (!TMDB_API_KEY || !REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET || !REDDIT_USER_AGENT) {
        return NextResponse.json({
            error: "API keys or credentials are missing"
        }, {
            status: 500
        });
    }
    try {
        // Instantiate Reddit client
        const reddit = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$reddit$2e$js$2f$reddit$2e$min$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"]({
            clientId: REDDIT_CLIENT_ID,
            clientSecret: REDDIT_CLIENT_SECRET,
            userAgent: REDDIT_USER_AGENT
        });
        // Rest of your logic...
        const movieDetails = await Promise.all(movieIds.map((id)=>axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=credits`).then((res)=>res.data)));
        const commonTraits = analyzeCommonTraits(movieDetails);
        const positiveMatch = await getPositiveRecommendation(commonTraits, year, movieIds, reddit);
        const oppositeMatch = await getOppositeRecommendation(movieDetails, positiveMatch, reddit);
        return NextResponse.json({
            positiveMatch,
            oppositeMatch
        });
    } catch (error) {
        console.error("Error generating recommendations:", error);
        return NextResponse.json({
            error: "Failed to generate recommendations"
        }, {
            status: 500
        });
    }
} // Keep your existing functions (analyzeCommonTraits, getPositiveRecommendation, etc.)...
}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__21588f4c._.js.map