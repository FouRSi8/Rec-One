// import { NextResponse } from "next/server";
// import axios from "axios";

// export async function GET(request) {
//   const { searchParams } = new URL(request.url);
//   const movieIds = searchParams.get("movieIds")?.split(",");
//   const year = searchParams.get("year");

//   // Shorter timeout for individual requests
//   const axiosConfig = { timeout: 8000 };
  
//   // Insert title-to-ID mapping here if IDs are not numeric
//   let resolvedIds = movieIds;
//   if (movieIds.some((id) => isNaN(id))) {
//     const searchPromises = movieIds.map((title) =>
//       axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(title)}`, axiosConfig)
//         .catch(err => ({ data: { results: [] } })) // Handle individual failures
//     );
//     const searchResponses = await Promise.all(searchPromises);
//     resolvedIds = searchResponses.map((res) => res.data.results[0]?.id).filter((id) => id);
//     if (resolvedIds.length !== 3) {
//       return NextResponse.json({ error: "Could not map all titles to valid movie IDs" }, { status: 400 });
//     }
//   }

//   if (!resolvedIds || resolvedIds.length !== 3) {
//     return NextResponse.json({ error: "Exactly 3 movie IDs are required" }, { status: 400 });
//   }

//   const TMDB_API_KEY = process.env.TMDB_API_KEY;
//   const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID;
//   const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;

//   if (!TMDB_API_KEY) {
//     return NextResponse.json({ error: "Missing TMDB_API_KEY environment variable" }, { status: 500 });
//   }

//   try {
//     console.log("Fetching movie details for IDs:", resolvedIds);
    
//     // Fetch detailed movie information including credits
//     const movieDetailsPromises = resolvedIds.map(async (id) => {
//       try {
//         const [movieDetails, credits, keywords] = await Promise.all([
//           axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}`, axiosConfig),
//           axios.get(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${TMDB_API_KEY}`, axiosConfig),
//           axios.get(`https://api.themoviedb.org/3/movie/${id}/keywords?api_key=${TMDB_API_KEY}`, axiosConfig).catch(() => ({ data: { keywords: [] } }))
//         ]);
//         return {
//           ...movieDetails.data,
//           credits: credits.data,
//           keywords: keywords.data.keywords || []
//         };
//       } catch (error) {
//         console.error(`Failed to fetch details for movie ${id}:`, error.message);
//         throw error;
//       }
//     });

//     const inputMovies = await Promise.all(movieDetailsPromises);
//     console.log("Input movies:", inputMovies.map(m => ({ title: m.title, id: m.id, original_language: m.original_language })));

//     // Enhanced movie analysis with genre prioritization
//     const movieAnalysis = analyzeInputMoviesEnhanced(inputMovies);
//     console.log("Movie analysis:", movieAnalysis);

//     // Reddit recommendations with improved approach
//     let redditRecommendations = [];
//     let redditError = null;
    
//     if (REDDIT_CLIENT_ID && REDDIT_CLIENT_SECRET) {
//       try {
//         console.log("Attempting improved Reddit-based recommendations...");
//         const redditPromise = getImprovedRedditRecommendations(inputMovies, movieAnalysis, REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, axiosConfig);
//         const timeoutPromise = new Promise((_, reject) => 
//           setTimeout(() => reject(new Error('Reddit timeout')), 12000)
//         );
        
//         redditRecommendations = await Promise.race([redditPromise, timeoutPromise]);
//         console.log("Reddit recommendations found:", redditRecommendations.length);
//       } catch (error) {
//         console.log("Reddit API failed, falling back to TMDB:", error.message);
//         redditError = error.message;
//       }
//     }

//     // Enhanced strategies based on movie analysis - WITH PROPER TMDB IMPLEMENTATION
//     const strategies = await getEnhancedStrategiesWithTMDB(inputMovies, movieAnalysis, TMDB_API_KEY, axiosConfig);

//     // Collect recommendations more efficiently
//     const allRecommendations = [];
//     const minYear = parseInt(year, 10) || 2000;

//     // Add Reddit recommendations if available (with year filtering)
//     if (redditRecommendations.length > 0) {
//       const redditCandidates = await enhanceRedditRecommendationsWithTMDB(
//         redditRecommendations.slice(0, 8), // Increased limit for better results
//         TMDB_API_KEY, 
//         axiosConfig
//       );
//       redditCandidates
//         .filter(candidate => {
//           if (!candidate.release_date) return false;
//           const releaseYear = new Date(candidate.release_date).getFullYear();
//           return releaseYear >= minYear;
//         })
//         .forEach(candidate => {
//           allRecommendations.push({
//             ...candidate,
//             strategyName: "Reddit Community Recommendation",
//             strategyPriority: 10,
//             source: "reddit"
//           });
//         });
//     }

//     // Process TMDB strategies in parallel with limited concurrency
//     const strategyPromises = strategies.map(async (strategy) => {
//       try {
//         console.log(`Trying strategy: ${strategy.name}`);
        
//         let candidates = [];

//         // Handle custom search strategies (like franchise search)
//         if (strategy.customSearch) {
//           candidates = await strategy.customSearch(TMDB_API_KEY, axiosConfig, resolvedIds, minYear);
//         } else {
//           // Handle regular discover API strategies
//           const params = strategy.getParams();
//           if (!params) return [];

//           let discoveryUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}`;
//           discoveryUrl += `&primary_release_date.gte=${minYear}-01-01`;
          
//           Object.entries(params).forEach(([key, value]) => {
//             if (value) discoveryUrl += `&${key}=${value}`;
//           });

//           const discoveryResponse = await axios.get(discoveryUrl, axiosConfig);
//           candidates = discoveryResponse.data.results;
//         }

//         // Filter by year constraint
//         candidates = candidates
//           .filter(movie => {
//             if (!resolvedIds.includes(movie.id.toString())) {
//               if (!movie.release_date) return false;
//               const releaseYear = new Date(movie.release_date).getFullYear();
//               return releaseYear >= minYear;
//             }
//             return false;
//           })
//           .slice(0, 5); // Take top 5 from each strategy

//         return candidates.map(candidate => ({
//           ...candidate,
//           strategyName: strategy.name,
//           strategyPriority: strategy.priority,
//           source: "tmdb"
//         }));
//       } catch (error) {
//         console.log(`Strategy ${strategy.name} failed:`, error.message);
//         return [];
//       }
//     });

//     // Wait for all strategies but don't let any single one block
//     const strategyResults = await Promise.allSettled(strategyPromises);
//     strategyResults.forEach(result => {
//       if (result.status === 'fulfilled') {
//         allRecommendations.push(...result.value);
//       }
//     });

//     console.log(`Total recommendations collected: ${allRecommendations.length}`);

//     if (allRecommendations.length === 0) {
//       // Enhanced fallback with franchise/language consideration
//       const fallbackMovie = await getEnhancedFallback(inputMovies, movieAnalysis, TMDB_API_KEY, axiosConfig, resolvedIds);
//       if (fallbackMovie) {
//         allRecommendations.push({
//           ...fallbackMovie,
//           strategyName: "Enhanced Fallback",
//           strategyPriority: 4,
//           source: "tmdb"
//         });
//       }
//     }

//     if (allRecommendations.length === 0) {
//       throw new Error("No recommendations found from any strategy");
//     }

//     // Enhanced scoring with movie analysis consideration and genre prioritization
//     const scoredRecommendations = scoreRecommendationsEnhanced(allRecommendations, inputMovies, movieAnalysis);
    
//     // Sort by total score and get the best recommendation
//     scoredRecommendations.sort((a, b) => b.totalScore - a.totalScore);
    
//     const bestRecommendation = scoredRecommendations[0];
    
//     // Get detailed info for the best recommendation only
//     const detailedMovie = await axios.get(
//       `https://api.themoviedb.org/3/movie/${bestRecommendation.id}?api_key=${TMDB_API_KEY}&append_to_response=credits`,
//       axiosConfig
//     );

//     console.log("Best recommendation:", bestRecommendation.title, "Strategy:", bestRecommendation.strategyName, "Score:", bestRecommendation.totalScore);

//     return NextResponse.json({
//       recommendedMovie: {
//         ...detailedMovie.data,
//         totalScore: bestRecommendation.totalScore,
//         strategyUsed: bestRecommendation.strategyName,
//         strategyPriority: bestRecommendation.strategyPriority,
//         source: bestRecommendation.source,
//         redditData: bestRecommendation.redditData || null,
//         movieAnalysis: movieAnalysis,
//         genreMatchDetails: bestRecommendation.genreMatchDetails,
//         alternativeStrategies: scoredRecommendations.slice(1, 4).map(r => ({
//           title: r.title,
//           strategy: r.strategyName,
//           score: r.totalScore,
//           genreMatch: r.genreMatchDetails?.dominantGenreMatch || false
//         })),
//         redditFallbackUsed: redditError ? true : false,
//         redditError: redditError
//       },
//     });

//   } catch (error) {
//     console.error("API Error:", {
//       message: error.message,
//       code: error.code,
//       status: error.response?.status,
//       data: error.response?.data,
//     });
//     return NextResponse.json(
//       { error: `Failed to fetch recommendation: ${error.message}` },
//       { status: error.response?.status || 500 }
//     );
//   }
// }

// // Enhanced function to analyze input movies with genre prioritization
// function analyzeInputMoviesEnhanced(inputMovies) {
//   const analysis = {
//     isAnimated: false,
//     isAnime: false,
//     commonLanguage: null,
//     commonCountry: null,
//     franchisePattern: null,
//     franchiseKeywords: [],
//     themes: [],
//     avgRating: 0,
//     avgYear: 0,
//     // NEW: Enhanced genre analysis
//     genreAnalysis: {
//       dominantGenres: [],
//       genreFrequency: {},
//       genreWeights: {},
//       primaryGenre: null,
//       secondaryGenres: [],
//       genreCombo: null
//     },
//     // NEW: Enhanced thematic analysis
//     thematicAnalysis: {
//       commonKeywords: [],
//       thematicPatterns: [],
//       moodIndicators: []
//     },
//     // NEW: Quality indicators
//     qualityIndicators: {
//       avgRating: 0,
//       avgPopularity: 0,
//       ratingRange: [0, 0],
//       qualityTier: 'standard'
//     }
//   };

//   // Enhanced genre analysis with frequency weighting
//   const allGenres = inputMovies.flatMap(m => m.genres || []);
//   const genreCounts = {};
//   const genreIds = {};
  
//   allGenres.forEach(genre => {
//     genreCounts[genre.name] = (genreCounts[genre.name] || 0) + 1;
//     genreIds[genre.name] = genre.id;
//   });

//   // Sort genres by frequency (most recurring first)
//   const sortedGenres = Object.entries(genreCounts)
//     .sort(([,a], [,b]) => b - a)
//     .map(([name, count]) => ({ name, count, id: genreIds[name] }));

//   analysis.genreAnalysis.genreFrequency = genreCounts;
//   analysis.genreAnalysis.dominantGenres = sortedGenres;

//   if (sortedGenres.length > 0) {
//     analysis.genreAnalysis.primaryGenre = sortedGenres[0];
//     analysis.genreAnalysis.secondaryGenres = sortedGenres.slice(1, 3);
    
//     // Create genre weights based on frequency
//     const maxCount = sortedGenres[0].count;
//     sortedGenres.forEach(genre => {
//       analysis.genreAnalysis.genreWeights[genre.name] = genre.count / maxCount;
//     });

//     // Create genre combination signature
//     if (sortedGenres.length > 1 && sortedGenres[0].count > 1) {
//       analysis.genreAnalysis.genreCombo = sortedGenres
//         .filter(g => g.count > 1)
//         .map(g => g.name)
//         .join('-');
//     }
//   }

//   // Enhanced thematic analysis
//   const allKeywords = inputMovies.flatMap(m => m.keywords || []);
//   const keywordCounts = {};
  
//   allKeywords.forEach(keyword => {
//     const keyName = keyword.name.toLowerCase();
//     keywordCounts[keyName] = (keywordCounts[keyName] || 0) + 1;
//   });

//   // Find recurring thematic elements
//   analysis.thematicAnalysis.commonKeywords = Object.entries(keywordCounts)
//     .filter(([, count]) => count > 1)
//     .sort(([,a], [,b]) => b - a)
//     .map(([name, count]) => ({ name, count }))
//     .slice(0, 5);

//   // Quality analysis
//   const ratings = inputMovies.map(m => m.vote_average || 0);
//   const popularities = inputMovies.map(m => m.popularity || 0);
  
//   analysis.qualityIndicators.avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
//   analysis.qualityIndicators.avgPopularity = popularities.reduce((a, b) => a + b, 0) / popularities.length;
//   analysis.qualityIndicators.ratingRange = [Math.min(...ratings), Math.max(...ratings)];
  
//   // Determine quality tier
//   if (analysis.qualityIndicators.avgRating >= 7.5) {
//     analysis.qualityIndicators.qualityTier = 'premium';
//   } else if (analysis.qualityIndicators.avgRating >= 6.5) {
//     analysis.qualityIndicators.qualityTier = 'good';
//   } else {
//     analysis.qualityIndicators.qualityTier = 'standard';
//   }

//   // Original analysis (preserved)
//   const animationKeywords = ['animation', 'anime', 'cartoon', 'animated'];
//   const animeKeywords = ['anime', 'manga', 'japanese animation'];
  
//   const allKeywordNames = allKeywords.map(k => k.name.toLowerCase());
//   const allGenreNames = allGenres.map(g => g.name.toLowerCase());
  
//   analysis.isAnimated = allGenreNames.some(g => g.includes('animation')) || 
//                       allKeywordNames.some(k => animationKeywords.some(ak => k.includes(ak)));
  
//   analysis.isAnime = inputMovies.some(m => m.original_language === 'ja') ||
//                     allKeywordNames.some(k => animeKeywords.some(ak => k.includes(ak))) ||
//                     inputMovies.some(m => m.production_countries?.some(c => c.iso_3166_1 === 'JP'));

//   // Enhanced franchise detection
//   const titles = inputMovies.map(m => m.title.toLowerCase());
  
//   const allWords = titles.flatMap(title => 
//     title.split(/\s+|[^\w\s]/).filter(word => word.length > 2)
//   );
  
//   const wordCounts = {};
//   allWords.forEach(word => {
//     const cleanWord = word.toLowerCase();
//     wordCounts[cleanWord] = (wordCounts[cleanWord] || 0) + 1;
//   });
  
//   const franchiseWords = Object.entries(wordCounts)
//     .filter(([word, count]) => count >= 2 && word.length > 2)
//     .map(([word]) => word);
  
//   if (franchiseWords.length > 0) {
//     analysis.franchisePattern = franchiseWords[0];
//     analysis.franchiseKeywords = franchiseWords;
//   }

//   // Language analysis
//   const languages = inputMovies.map(m => m.original_language);
//   const languageCounts = {};
//   languages.forEach(lang => {
//     languageCounts[lang] = (languageCounts[lang] || 0) + 1;
//   });
//   const mostCommonLang = Object.entries(languageCounts).sort(([,a], [,b]) => b - a)[0];
//   if (mostCommonLang && mostCommonLang[1] >= 2) {
//     analysis.commonLanguage = mostCommonLang[0];
//   }

//   // Country analysis
//   const countries = inputMovies.flatMap(m => m.production_countries?.map(c => c.iso_3166_1) || []);
//   const countryCounts = {};
//   countries.forEach(country => {
//     countryCounts[country] = (countryCounts[country] || 0) + 1;
//   });
//   const mostCommonCountry = Object.entries(countryCounts).sort(([,a], [,b]) => b - a)[0];
//   if (mostCommonCountry && mostCommonCountry[1] >= 2) {
//     analysis.commonCountry = mostCommonCountry[0];
//   }

//   analysis.avgRating = analysis.qualityIndicators.avgRating;
//   analysis.avgYear = Math.round(inputMovies.reduce((sum, m) => {
//     const year = new Date(m.release_date).getFullYear();
//     return sum + year;
//   }, 0) / inputMovies.length);

//   return analysis;
// }

// // Enhanced strategies with genre prioritization
// async function getEnhancedStrategiesWithTMDB(inputMovies, analysis, TMDB_API_KEY, axiosConfig) {
//   const genres = inputMovies.map(m => m.genres || []);
//   const directors = inputMovies.map(m => 
//     m.credits.crew?.filter(c => c.job === 'Director') || []
//   );
//   const studios = inputMovies.map(m => m.production_companies || []);
//   const keywords = inputMovies.map(m => m.keywords || []);

//   const strategies = [];

//   // DOMINANT GENRE STRATEGY - NEW AND HIGHEST PRIORITY
//   if (analysis.genreAnalysis.primaryGenre && analysis.genreAnalysis.primaryGenre.count > 1) {
//     const primaryGenre = analysis.genreAnalysis.primaryGenre;
    
//     strategies.push({
//       name: `Dominant ${primaryGenre.name} Films`,
//       priority: 25, // HIGHEST PRIORITY for recurring genres
//       getParams: () => {
//         const params = {
//           with_genres: primaryGenre.id,
//           sort_by: 'vote_average.desc',
//           'vote_count.gte': analysis.qualityIndicators.qualityTier === 'premium' ? 1000 : 500
//         };

//         // Add secondary genres if they also recur
//         const secondaryRecurringGenres = analysis.genreAnalysis.secondaryGenres
//           .filter(g => g.count > 1)
//           .slice(0, 2);
        
//         if (secondaryRecurringGenres.length > 0) {
//           params.with_genres += ',' + secondaryRecurringGenres.map(g => g.id).join(',');
//         }

//         // Quality-based filtering
//         if (analysis.qualityIndicators.qualityTier === 'premium') {
//           params['vote_average.gte'] = 7.0;
//         } else if (analysis.qualityIndicators.qualityTier === 'good') {
//           params['vote_average.gte'] = 6.0;
//         }

//         return params;
//       }
//     });

//     // Genre combination strategy for complex tastes
//     if (analysis.genreAnalysis.genreCombo) {
//       strategies.push({
//         name: `${analysis.genreAnalysis.genreCombo} Combination`,
//         priority: 22,
//         getParams: () => {
//           const recurringGenres = analysis.genreAnalysis.dominantGenres
//             .filter(g => g.count > 1)
//             .slice(0, 3);
          
//           return {
//             with_genres: recurringGenres.map(g => g.id).join(','),
//             sort_by: 'vote_average.desc',
//             'vote_count.gte': 300
//           };
//         }
//       });
//     }
//   }

//   // FRANCHISE STRATEGY (enhanced priority when combined with genre)
//   if (analysis.franchisePattern || analysis.franchiseKeywords.length > 0) {
//     const basePriority = analysis.genreAnalysis.primaryGenre?.count > 1 ? 20 : 18;
    
//     strategies.push({
//       name: "Same Franchise/Series",
//       priority: basePriority,
//       customSearch: async (apiKey, config, excludeIds, minYear) => {
//         const franchiseTerms = analysis.franchiseKeywords.length > 0 
//           ? analysis.franchiseKeywords 
//           : [analysis.franchisePattern];
        
//         console.log("Searching for franchise terms:", franchiseTerms);
        
//         const searchResults = [];
        
//         for (const term of franchiseTerms.slice(0, 3)) {
//           try {
//             const searchResponse = await axios.get(
//               `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(term)}&sort_by=popularity.desc`,
//               config
//             );
            
//             let results = searchResponse.data.results
//               .filter(movie => {
//                 if (excludeIds.includes(movie.id.toString())) return false;
//                 if (movie.vote_count < 10) return false;
//                 if (!movie.title.toLowerCase().includes(term.toLowerCase())) return false;
                
//                 if (movie.release_date) {
//                   const releaseYear = new Date(movie.release_date).getFullYear();
//                   if (releaseYear < minYear) return false;
//                 }
                
//                 return true;
//               });

//             // NEW: Prioritize movies that match the dominant genre within franchise
//             if (analysis.genreAnalysis.primaryGenre) {
//               results = results.sort((a, b) => {
//                 const aHasGenre = a.genre_ids?.includes(analysis.genreAnalysis.primaryGenre.id);
//                 const bHasGenre = b.genre_ids?.includes(analysis.genreAnalysis.primaryGenre.id);
//                 if (aHasGenre && !bHasGenre) return -1;
//                 if (!aHasGenre && bHasGenre) return 1;
//                 return b.popularity - a.popularity;
//               });
//             }

//             searchResults.push(...results.slice(0, 8));
//             console.log(`Found ${results.length} movies for term "${term}" after ${minYear}`);
//           } catch (error) {
//             console.log(`Franchise search failed for term "${term}":`, error.message);
//           }
//         }
        
//         const uniqueResults = searchResults.filter((movie, index, self) => 
//           index === self.findIndex(m => m.id === movie.id)
//         );
        
//         return uniqueResults
//           .sort((a, b) => b.popularity - a.popularity)
//           .slice(0, 10);
//       }
//     });
//   }

//   // THEMATIC KEYWORD STRATEGY - NEW
//   if (analysis.thematicAnalysis.commonKeywords.length > 0) {
//     const topKeyword = analysis.thematicAnalysis.commonKeywords[0];
    
//     strategies.push({
//       name: `Thematic Match: ${topKeyword.name}`,
//       priority: 16,
//       customSearch: async (apiKey, config, excludeIds, minYear) => {
//         try {
//           // Search for movies with similar keywords
//           const keywordSearch = await axios.get(
//             `https://api.themoviedb.org/3/search/keyword?api_key=${apiKey}&query=${encodeURIComponent(topKeyword.name)}`,
//             config
//           );
          
//           if (keywordSearch.data.results.length > 0) {
//             const keywordId = keywordSearch.data.results[0].id;
            
//             const moviesResponse = await axios.get(
//               `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_keywords=${keywordId}&sort_by=vote_average.desc&vote_count.gte=100&primary_release_date.gte=${minYear}-01-01`,
//               config
//             );
            
//             return moviesResponse.data.results
//               .filter(movie => !excludeIds.includes(movie.id.toString()))
//               .slice(0, 8);
//           }
//         } catch (error) {
//           console.log(`Thematic search failed for "${topKeyword.name}":`, error.message);
//         }
//         return [];
//       }
//     });
//   }

//   // Existing strategies with adjusted priorities
//   if (analysis.isAnime) {
//     strategies.push({
//       name: "Anime Movies",
//       priority: 14,
//       customSearch: async (apiKey, config, excludeIds, minYear) => {
//         const searches = [
//           axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_original_language=ja&with_genres=16&sort_by=vote_average.desc&vote_count.gte=50&primary_release_date.gte=${minYear}-01-01`, config),
//           axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_keywords=210024&sort_by=popularity.desc&primary_release_date.gte=${minYear}-01-01`, config),
//           axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_companies=10342,2251&sort_by=vote_average.desc&primary_release_date.gte=${minYear}-01-01`, config)
//         ];
        
//         const results = await Promise.allSettled(searches);
//         const allMovies = [];
        
//         results.forEach(result => {
//           if (result.status === 'fulfilled') {
//             allMovies.push(...result.value.data.results);
//           }
//         });
        
//         return allMovies
//           .filter(movie => !excludeIds.includes(movie.id.toString()))
//           .filter((movie, index, self) => index === self.findIndex(m => m.id === movie.id))
//           .slice(0, 10);
//       }
//     });
//   } else if (analysis.isAnimated) {
//     strategies.push({
//       name: "Animation Movies",
//       priority: 13,
//       getParams: () => ({
//         with_genres: '16',
//         sort_by: 'vote_average.desc',
//         'vote_count.gte': 500
//       })
//     });
//   }

//   // Language strategy with genre consideration
//   if (analysis.commonLanguage && analysis.commonLanguage !== 'en') {
//     strategies.push({
//       name: `${analysis.commonLanguage.toUpperCase()} Language Films`,
//       priority: 12,
//       getParams: () => {
//         const params = {
//           with_original_language: analysis.commonLanguage,
//           sort_by: 'vote_average.desc',
//           'vote_count.gte': 100
//         };

//         // Include dominant genre if available
//         if (analysis.genreAnalysis.primaryGenre) {
//           params.with_genres = analysis.genreAnalysis.primaryGenre.id;
//         }

//         return params;
//       }
//     });
//   }

//   // Enhanced existing strategies with lower priorities
//   const commonDirector = findMostCommonPerson(directors);
//   if (commonDirector) {
//     const directorId = directors.flat().find(d => d.name === commonDirector)?.id;
//     if (directorId) {
//       strategies.push({
//         name: "Same Director Different Style",
//         priority: 10,
//         getParams: () => ({
//           with_crew: directorId,
//           sort_by: 'vote_average.desc'
//         })
//       });
//     }
//   }

//   const commonStudio = findMostCommonStudio(studios);
//   if (commonStudio) {
//     const studioId = studios.flat().find(s => s.name === commonStudio)?.id;
//     if (studioId) {
//       strategies.push({
//         name: "Same Studio Production",
//         priority: 9,
//         getParams: () => ({
//           with_companies: studioId,
//           sort_by: 'vote_average.desc'
//         })
//       });
//     }
//   }

//   return strategies;
// }

// // Enhanced scoring function with genre prioritization
// function scoreRecommendationsEnhanced(allRecommendations, inputMovies, analysis) {
//   return allRecommendations.map(candidate => {
//     let totalScore = 0;
//     let genreMatchDetails = {
//       dominantGenreMatch: false,
//       secondaryGenreMatches: 0,
//       genreOverlapScore: 0,
//       thematicBonus: 0
//     };
    
//     // Base TMDB scoring
//     totalScore += (candidate.vote_average || 0) * 4;
//     totalScore += Math.log10((candidate.popularity || 1)) * 10;
    
//     // Strategy priority bonus
//     totalScore += (candidate.strategyPriority || 0) * 8;
    
//     // Reddit-specific scoring with confidence
//     if (candidate.redditData) {
//       totalScore += (candidate.redditData.redditScore || 0) * 3;
//       totalScore += (candidate.redditData.mentions || 0) * 4;
//       totalScore += (candidate.redditData.confidence || 0) * 5;
//       totalScore += candidate.redditData.subreddets?.length || 0 * 6;
//     }
    
//     // ENHANCED GENRE MATCHING WITH PRIORITIZATION
//     if (analysis.genreAnalysis.primaryGenre && candidate.genre_ids) {
//       const candidateGenres = candidate.genre_ids;
      
//       // DOMINANT GENRE MATCH - MASSIVE BONUS
//       if (candidateGenres.includes(analysis.genreAnalysis.primaryGenre.id)) {
//         const dominantGenreBonus = 80 * analysis.genreAnalysis.genreWeights[analysis.genreAnalysis.primaryGenre.name];
//         totalScore += dominantGenreBonus;
//         genreMatchDetails.dominantGenreMatch = true;
//         genreMatchDetails.genreOverlapScore += dominantGenreBonus;
//       }
      
//       // SECONDARY GENRE MATCHES - Weighted by frequency
//       analysis.genreAnalysis.secondaryGenres.forEach(secondaryGenre => {
//         if (candidateGenres.includes(secondaryGenre.id)) {
//           const secondaryBonus = 40 * analysis.genreAnalysis.genreWeights[secondaryGenre.name];
//           totalScore += secondaryBonus;
//           genreMatchDetails.secondaryGenreMatches++;
//           genreMatchDetails.genreOverlapScore += secondaryBonus;
//         }
//       });
      
//       // GENRE COMBINATION BONUS - When multiple recurring genres match
//       const recurringGenreMatches = analysis.genreAnalysis.dominantGenres
//         .filter(g => g.count > 1 && candidateGenres.includes(g.id))
//         .length;
      
//       if (recurringGenreMatches >= 2) {
//         const comboBonus = 30 * recurringGenreMatches;
//         totalScore += comboBonus;
//         genreMatchDetails.genreOverlapScore += comboBonus;
//       }
//     }
    
//     // THEMATIC KEYWORD MATCHING
//     if (analysis.thematicAnalysis.commonKeywords.length > 0 && candidate.overview) {
//       const overviewLower = candidate.overview.toLowerCase();
//       analysis.thematicAnalysis.commonKeywords.forEach(keyword => {
//         if (overviewLower.includes(keyword.name.toLowerCase())) {
//           const thematicBonus = 20 * keyword.count;
//           totalScore += thematicBonus;
//           genreMatchDetails.thematicBonus += thematicBonus;
//         }
//       });
//     }
    
//     // FRANCHISE MATCHING - Enhanced with genre consideration
//     if (analysis.franchisePattern) {
//       const titleLower = (candidate.title || '').toLowerCase();
//       if (titleLower.includes(analysis.franchisePattern.toLowerCase())) {
//         let franchiseBonus = 100;
//         // Extra bonus if franchise movie also matches dominant genre
//         if (genreMatchDetails.dominantGenreMatch) {
//           franchiseBonus += 50;
//         }
//         totalScore += franchiseBonus;
//       }
      
//       analysis.franchiseKeywords?.forEach(keyword => {
//         if (titleLower.includes(keyword.toLowerCase())) {
//           let keywordBonus = 60;
//           if (genreMatchDetails.dominantGenreMatch) {
//             keywordBonus += 30;
//           }
//           totalScore += keywordBonus;
//         }
//       });
//     }
    
//     // QUALITY ALIGNMENT BONUS
//     const qualityAlignment = calculateQualityAlignment(candidate, analysis.qualityIndicators);
//     totalScore += qualityAlignment * 15;
    
//     // RATING SIMILARITY BONUS - Enhanced
//     const ratingDiff = Math.abs((candidate.vote_average || 0) - analysis.avgRating);
//     if (ratingDiff <= 0.5) totalScore += 25;
//     else if (ratingDiff <= 1) totalScore += 15;
//     else if (ratingDiff <= 1.5) totalScore += 8;
    
//     // LANGUAGE MATCHING
//     if (analysis.commonLanguage && candidate.original_language === analysis.commonLanguage) {
//       let langBonus = 25;
//       // Extra bonus for non-English languages (more specific preference)
//       if (analysis.commonLanguage !== 'en') {
//         langBonus += 20;
//       }
//       totalScore += langBonus;
//     }
    
//     // ANIMATION/ANIME MATCHING
//     if (analysis.isAnime && candidate.original_language === 'ja') {
//       totalScore += 40;
//     }
//     if (analysis.isAnimated && candidate.genre_ids?.includes(16)) {
//       totalScore += 35;
//     }
    
//     // RECENCY BONUS - Weighted by quality tier
//     if (candidate.release_date) {
//       const releaseYear = new Date(candidate.release_date).getFullYear();
//       const recencyMultiplier = analysis.qualityIndicators.qualityTier === 'premium' ? 1.5 : 1.0;
      
//       if (releaseYear >= 2020) totalScore += 15 * recencyMultiplier;
//       else if (releaseYear >= 2015) totalScore += 10 * recencyMultiplier;
//       else if (releaseYear >= 2010) totalScore += 5 * recencyMultiplier;
//     }
    
//     // POPULARITY vs QUALITY BALANCE
//     const popularityScore = Math.log10((candidate.popularity || 1)) * 3;
//     const qualityScore = (candidate.vote_average || 0) * 8;
//     const voteCountReliability = candidate.vote_count >= 500 ? 20 : 
//                                 candidate.vote_count >= 100 ? 10 : 
//                                 candidate.vote_count >= 50 ? 5 : 0;
    
//     totalScore += popularityScore + qualityScore + voteCountReliability;
    
//     // DIVERSITY vs SIMILARITY BALANCE
//     // Small bonus for movies that have some different genres (discovery factor)
//     const inputGenreIds = inputMovies.flatMap(m => m.genres?.map(g => g.id) || []);
//     const candidateGenreIds = candidate.genre_ids || [];
//     const genreOverlap = candidateGenreIds.filter(g => inputGenreIds.includes(g)).length;
//     const genreDiversity = candidateGenreIds.length - genreOverlap;
    
//     totalScore += genreOverlap * 12; // Familiarity bonus
//     totalScore += Math.min(genreDiversity * 4, 12); // Discovery bonus (capped)
    
//     // VOTE COUNT RELIABILITY TIERS
//     if (candidate.vote_count >= 5000) totalScore += 25;
//     else if (candidate.vote_count >= 1000) totalScore += 15;
//     else if (candidate.vote_count >= 500) totalScore += 10;
    
//     return {
//       ...candidate,
//       totalScore: Math.round(totalScore),
//       genreMatchDetails
//     };
//   });
// }

// // NEW: Quality alignment calculation
// function calculateQualityAlignment(candidate, qualityIndicators) {
//   const candidateRating = candidate.vote_average || 0;
//   const candidatePopularity = candidate.popularity || 0;
  
//   let alignmentScore = 0;
  
//   // Rating alignment
//   const ratingDiff = Math.abs(candidateRating - qualityIndicators.avgRating);
//   if (ratingDiff <= 0.5) alignmentScore += 3;
//   else if (ratingDiff <= 1.0) alignmentScore += 2;
//   else if (ratingDiff <= 1.5) alignmentScore += 1;
  
//   // Quality tier alignment
//   if (qualityIndicators.qualityTier === 'premium' && candidateRating >= 7.5) {
//     alignmentScore += 3;
//   } else if (qualityIndicators.qualityTier === 'good' && candidateRating >= 6.5) {
//     alignmentScore += 2;
//   } else if (qualityIndicators.qualityTier === 'standard' && candidateRating >= 5.5) {
//     alignmentScore += 1;
//   }
  
//   // Popularity alignment (if input movies are very popular, prefer popular recommendations)
//   if (qualityIndicators.avgPopularity > 50 && candidatePopularity > 30) {
//     alignmentScore += 2;
//   }
  
//   return alignmentScore;
// }

// // Enhanced Reddit recommendations with improved approach
// async function getImprovedRedditRecommendations(inputMovies, analysis, clientId, clientSecret, axiosConfig) {
//   const accessToken = await getRedditAccessToken(clientId, clientSecret, axiosConfig);
//   const recommendations = new Map();
  
//   // Enhanced subreddit selection based on analysis
//   let subreddits = ['MovieSuggestions', 'movies'];
  
//   if (analysis.isAnime) {
//     subreddits = ['anime', 'AnimeSuggest', 'MovieSuggestions'];
//   } else if (analysis.isAnimated) {
//     subreddits = ['MovieSuggestions', 'movies', 'animation'];
//   } else if (analysis.genreAnalysis.primaryGenre) {
//     // Add genre-specific subreddits if available
//     const genreName = analysis.genreAnalysis.primaryGenre.name.toLowerCase();
//     if (genreName === 'horror') subreddits.push('horror');
//     if (genreName === 'science fiction') subreddits.push('scifi');
//   }

//   // Enhanced search queries with genre focus
//   const searchQueries = generateEnhancedSearchQueries(inputMovies, analysis);
  
//   console.log("Reddit search queries:", searchQueries);
//   console.log("Reddit subreddits:", subreddits);

//   const searchPromises = [];
  
//   for (const subreddit of subreddits.slice(0, 2)) {
//     for (const query of searchQueries.slice(0, 3)) {
//       const searchUrl = `https://oauth.reddit.com/r/${subreddit}/search?q=${encodeURIComponent(query)}&restrict_sr=1&sort=top&t=year&limit=25`;
      
//       searchPromises.push(
//         axios.get(searchUrl, {
//           ...axiosConfig,
//           timeout: 5000,
//           headers: {
//             'Authorization': `Bearer ${accessToken}`,
//             'User-Agent': 'MovieRecommendationBot/1.0'
//           }
//         }).then(response => ({ subreddit, query, posts: response.data.data.children }))
//         .catch(error => ({ subreddit, query, posts: [], error: error.message }))
//       );
//     }
//   }

//   const searchResults = await Promise.all(searchPromises);
  
//   for (const { subreddit, posts } of searchResults) {
//     for (const post of posts) {
//       const postData = post.data;
//       if (postData.score < 2) continue;
      
//       const extractedMovies = extractMovieRecommendationsEnhanced(postData, inputMovies, analysis);
      
//       extractedMovies.forEach(movie => {
//         const key = movie.title.toLowerCase();
//         if (!recommendations.has(key)) {
//           recommendations.set(key, {
//             title: movie.title,
//             redditScore: 0,
//             upvotes: 0,
//             mentions: 0,
//             subreddits: new Set(),
//             confidence: 0,
//             genreHints: movie.genreHints || []
//           });
//         }
        
//         const rec = recommendations.get(key);
//         rec.redditScore += movie.score;
//         rec.upvotes += movie.upvotes;
//         rec.mentions += 1;
//         rec.confidence += movie.confidence || 1;
//         rec.subreddits.add(subreddit);
//         if (movie.genreHints) {
//           rec.genreHints.push(...movie.genreHints);
//         }
//       });
//     }
//   }
  
//   console.log("Reddit raw recommendations found:", recommendations.size);
  
//   return Array.from(recommendations.values())
//     .filter(rec => rec.mentions >= 1)
//     .sort((a, b) => (b.redditScore * b.confidence) - (a.redditScore * a.confidence))
//     .slice(0, 10);
// }

// // Enhanced search query generation
// function generateEnhancedSearchQueries(inputMovies, analysis) {
//   const queries = [];
  
//   // Genre-first queries (NEW - highest priority)
//   if (analysis.genreAnalysis.primaryGenre) {
//     const genreName = analysis.genreAnalysis.primaryGenre.name.toLowerCase();
//     queries.push(`best ${genreName} movies`);
//     queries.push(`${genreName} recommendations`);
    
//     if (analysis.genreAnalysis.genreCombo) {
//       queries.push(`${analysis.genreAnalysis.genreCombo.replace('-', ' ')} movies`);
//     }
//   }
  
//   // Franchise-based queries
//   if (analysis.franchisePattern) {
//     queries.push(`${analysis.franchisePattern} movie recommendations`);
//     queries.push(`best ${analysis.franchisePattern} films`);
//   }

//   // Direct movie queries
//   queries.push(`movies like ${inputMovies[0].title}`);
//   queries.push(`similar to ${inputMovies[0].title}`);
  
//   // Enhanced thematic queries
//   if (analysis.thematicAnalysis.commonKeywords.length > 0) {
//     const topKeyword = analysis.thematicAnalysis.commonKeywords[0];
//     queries.push(`${topKeyword.name} movies`);
//   }

//   return queries.slice(0, 5);
// }

// // Enhanced movie extraction from Reddit posts
// function extractMovieRecommendationsEnhanced(postData, inputMovies, analysis) {
//   const recommendations = [];
//   const fullText = (postData.title + ' ' + (postData.selftext || ''));
//   const textLower = fullText.toLowerCase();
//   const inputTitles = inputMovies.map(m => m.title.toLowerCase());
  
//   // Skip posts that only mention input movies
//   const onlyMentionsInput = inputTitles.some(title => textLower.includes(title));
//   if (onlyMentionsInput && !textLower.includes('recommend') && !textLower.includes('similar')) {
//     return [];
//   }

//   // Enhanced patterns for movie extraction
//   const patterns = [
//     { regex: /"([^"]{2,40})"/g, confidence: 3 },
//     { regex: /'([^']{2,40})'/g, confidence: 3 },
//     { regex: /\*\*([^*]{2,40})\*\*/g, confidence: 3 },
//     { regex: /__([^_]{2,40})__/g, confidence: 3 },
//     { regex: /([A-Z][a-zA-Z\s&:'-]{2,35})\s*\((\d{4})\)/g, confidence: 4 },
//     { regex: /(?:watch|try|check out|recommend)\s+([A-Z][a-zA-Z\s&:'-]{2,35})/g, confidence: 3 },
//     { regex: /([A-Z][a-zA-Z\s&:'-]{2,35})\s+is\s+(?:great|amazing|good|excellent)/g, confidence: 3 },
//     { regex: /^\s*[-*•]\s*([A-Z][a-zA-Z\s&:'-]{2,35})/gm, confidence: 2 },
//     { regex: /^\s*\d+\.\s*([A-Z][a-zA-Z\s&:'-]{2,35})/gm, confidence: 2 },
//     { regex: /\b([A-Z][a-zA-Z]{2,25}(?:\s+[A-Z][a-zA-Z]{2,25}){0,3})\b/g, confidence: 1 }
//   ];
  
//   patterns.forEach(pattern => {
//     let match;
//     while ((match = pattern.regex.exec(fullText)) !== null) {
//       let title = match[1].trim();
      
//       title = title.replace(/[.,!?;:]$/, '');
      
//       if (title.length < 3 || title.length > 50) continue;
//       if (inputTitles.some(inputTitle => 
//         title.toLowerCase().includes(inputTitle) || inputTitle.includes(title.toLowerCase())
//       )) continue;
      
//       const falsePositives = [
//         'movie', 'film', 'cinema', 'theater', 'netflix', 'hulu', 'amazon', 'disney',
//         'watch', 'seen', 'recommend', 'suggestion', 'looking', 'similar', 'like',
//         'genre', 'director', 'actor', 'year', 'time', 'story', 'plot', 'character',
//         'good', 'great', 'bad', 'best', 'worst', 'love', 'hate', 'think', 'feel'
//       ];
      
//       if (falsePositives.some(fp => title.toLowerCase() === fp || title.toLowerCase().includes(fp + ' '))) {
//         continue;
//       }
      
//       let confidenceBoost = 0;
//       const genreHints = [];
      
//       // Franchise pattern matching
//       if (analysis.franchisePattern && title.toLowerCase().includes(analysis.franchisePattern.toLowerCase())) {
//         confidenceBoost += 3;
//       }
      
//       // Genre context detection (NEW)
//       if (analysis.genreAnalysis.primaryGenre) {
//         const genreName = analysis.genreAnalysis.primaryGenre.name.toLowerCase();
//         const contextWords = fullText.toLowerCase().split(/\s+/);
//         const titleIndex = contextWords.findIndex(word => word.includes(title.toLowerCase().split(' ')[0]));
        
//         if (titleIndex !== -1) {
//           const contextWindow = contextWords.slice(Math.max(0, titleIndex - 5), titleIndex + 6);
//           if (contextWindow.some(word => word.includes(genreName))) {
//             confidenceBoost += 2;
//             genreHints.push(genreName);
//           }
//         }
//       }
      
//       recommendations.push({
//         title: title,
//         score: postData.score,
//         upvotes: postData.ups || postData.score,
//         confidence: pattern.confidence + confidenceBoost,
//         genreHints: genreHints
//       });
//     }
//   });
  
//   const uniqueRecs = [];
//   const seenTitles = new Set();
  
//   recommendations
//     .sort((a, b) => b.confidence - a.confidence)
//     .forEach(rec => {
//       const titleKey = rec.title.toLowerCase();
//       if (!seenTitles.has(titleKey)) {
//         seenTitles.add(titleKey);
//         uniqueRecs.push(rec);
//       }
//     });
  
//   return uniqueRecs.slice(0, 8);
// }

// // Enhanced fallback strategy
// async function getEnhancedFallback(inputMovies, analysis, apiKey, axiosConfig, resolvedIds) {
//   try {
//     // Priority 1: Dominant genre + quality tier matching
//     if (analysis.genreAnalysis.primaryGenre) {
//       console.log("Trying dominant genre fallback:", analysis.genreAnalysis.primaryGenre.name);
      
//       const voteCountMin = analysis.qualityIndicators.qualityTier === 'premium' ? 1000 : 
//                           analysis.qualityIndicators.qualityTier === 'good' ? 500 : 100;
      
//       const genreResponse = await axios.get(
//         `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${analysis.genreAnalysis.primaryGenre.id}&sort_by=vote_average.desc&vote_count.gte=${voteCountMin}`,
//         axiosConfig
//       );
      
//       const candidate = genreResponse.data.results.find(movie => 
//         !resolvedIds.includes(movie.id.toString()) && 
//         movie.vote_average >= (analysis.avgRating - 1.0)
//       );
      
//       if (candidate) {
//         console.log("Found genre-based fallback:", candidate.title);
//         return candidate;
//       }
//     }

//     // Priority 2: Franchise search
//     if (analysis.franchisePattern) {
//       console.log("Trying franchise fallback for:", analysis.franchisePattern);
//       const searchResponse = await axios.get(
//         `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(analysis.franchisePattern)}&sort_by=popularity.desc`,
//         axiosConfig
//       );
//       const candidate = searchResponse.data.results.find(movie => 
//         !resolvedIds.includes(movie.id.toString()) && 
//         movie.vote_count > 10 &&
//         movie.title.toLowerCase().includes(analysis.franchisePattern.toLowerCase())
//       );
//       if (candidate) {
//         console.log("Found franchise fallback:", candidate.title);
//         return candidate;
//       }
//     }

//     // Priority 3: Language-specific search with genre
//     if (analysis.commonLanguage && analysis.commonLanguage !== 'en') {
//       let langQuery = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_original_language=${analysis.commonLanguage}&sort_by=vote_average.desc&vote_count.gte=50`;
      
//       if (analysis.genreAnalysis.primaryGenre) {
//         langQuery += `&with_genres=${analysis.genreAnalysis.primaryGenre.id}`;
//       }
      
//       const langResponse = await axios.get(langQuery, axiosConfig);
//       const candidate = langResponse.data.results.find(movie => 
//         !resolvedIds.includes(movie.id.toString())
//       );
//       if (candidate) return candidate;
//     }

//     // Priority 4: Animation/Anime specific
//     if (analysis.isAnimated) {
//       let animQuery = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=16&sort_by=vote_average.desc&vote_count.gte=100`;
      
//       if (analysis.isAnime) {
//         animQuery += '&with_original_language=ja';
//       }
      
//       const animResponse = await axios.get(animQuery, axiosConfig);
//       const candidate = animResponse.data.results.find(movie => 
//         !resolvedIds.includes(movie.id.toString())
//       );
//       if (candidate) return candidate;
//     }

//     return null;
//   } catch (error) {
//     console.error("Enhanced fallback failed:", error);
//     return null;
//   }
// }

// // Keep all other existing helper functions unchanged
// async function getRedditAccessToken(clientId, clientSecret, axiosConfig) {
//   const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  
//   const response = await axios.post(
//     'https://www.reddit.com/api/v1/access_token',
//     'grant_type=client_credentials',
//     {
//       ...axiosConfig,
//       timeout: 5000,
//       headers: {
//         'Authorization': `Basic ${auth}`,
//         'Content-Type': 'application/x-www-form-urlencoded',
//         'User-Agent': 'MovieRecommendationBot/1.0'
//       }
//     }
//   );
//   return response.data.access_token;
// }

// async function enhanceRedditRecommendationsWithTMDB(redditRecs, apiKey, axiosConfig) {
//   const enhancedRecs = [];
  
//   const enhancePromises = redditRecs.map(async (rec) => {
//     try {
//       let searchResponse = await axios.get(
//         `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(rec.title)}`,
//         { ...axiosConfig, timeout: 4000 }
//       );
      
//       let tmdbResults = searchResponse.data.results;
      
//       if (tmdbResults.length === 0 && rec.title.includes(' ')) {
//         const words = rec.title.split(' ');
//         const partialTitle = words.slice(0, Math.min(3, words.length)).join(' ');
//         searchResponse = await axios.get(
//           `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(partialTitle)}`,
//           { ...axiosConfig, timeout: 4000 }
//         );
//         tmdbResults = searchResponse.data.results;
//       }
      
//       if (tmdbResults.length > 0) {
//         const bestMatch = tmdbResults
//           .filter(movie => movie.vote_count > 5)
//           .reduce((best, current) => {
//             const bestSimilarity = calculateTitleSimilarity(rec.title, best.title);
//             const currentSimilarity = calculateTitleSimilarity(rec.title, current.title);
            
//             const bestScore = bestSimilarity * 0.7 + (best.popularity || 0) * 0.3;
//             const currentScore = currentSimilarity * 0.7 + (current.popularity || 0) * 0.3;
            
//             return currentScore > bestScore ? current : best;
//           });
        
//         if (calculateTitleSimilarity(rec.title, bestMatch.title) > 0.3) {
//           return {
//             ...bestMatch,
//             redditData: {
//               originalTitle: rec.title,
//               redditScore: rec.redditScore,
//               mentions: rec.mentions,
//               upvotes: rec.upvotes,
//               confidence: rec.confidence,
//               subreddits: Array.from(rec.subreddits),
//               genreHints: rec.genreHints || []
//             }
//           };
//         }
//       }
//     } catch (error) {
//       console.log(`Error enhancing Reddit recommendation ${rec.title}:`, error.message);
//     }
//     return null;
//   });
  
//   const results = await Promise.allSettled(enhancePromises);
//   return results
//     .filter(result => result.status === 'fulfilled' && result.value !== null)
//     .map(result => result.value);
// }

// function calculateTitleSimilarity(title1, title2) {
//   const t1 = title1.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
//   const t2 = title2.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  
//   if (t1 === t2) return 1.0;
  
//   const words1 = new Set(t1.split(/\s+/).filter(w => w.length > 0));
//   const words2 = new Set(t2.split(/\s+/).filter(w => w.length > 0));
  
//   if (words1.size === 0 || words2.size === 0) return 0;
  
//   const intersection = new Set([...words1].filter(x => words2.has(x)));
//   const union = new Set([...words1, ...words2]);
  
//   return intersection.size / union.size;
// }

// function findMostCommonGenre(genreArrays) {
//   const allGenres = genreArrays.flat();
//   const genreCounts = {};
  
//   allGenres.forEach(genre => {
//     genreCounts[genre.id] = (genreCounts[genre.id] || 0) + 1;
//   });
  
//   const mostCommon = Object.entries(genreCounts)
//     .sort(([,a], [,b]) => b - a)[0];
  
//   return mostCommon ? mostCommon[0] : null;
// }

// function findMostCommonPerson(personArrays) {
//   const allPeople = personArrays.flat();
//   const personCounts = {};
  
//   allPeople.forEach(person => {
//     personCounts[person.name] = (personCounts[person.name] || 0) + 1;
//   });
  
//   const mostCommon = Object.entries(personCounts)
//     .sort(([,a], [,b]) => b - a)[0];
  
//   return mostCommon && mostCommon[1] > 1 ? mostCommon[0] : null;
// }

// function findMostCommonStudio(studioArrays) {
//   const allStudios = studioArrays.flat();
//   const studioCounts = {};
  
//   allStudios.forEach(studio => {
//     studioCounts[studio.name] = (studioCounts[studio.name] || 0) + 1;
//   });
  
//   const mostCommon = Object.entries(studioCounts)
//     .sort(([,a], [,b]) => b - a)[0];
  
//   return mostCommon && mostCommon[1] > 1 ? mostCommon[0] : null;
// }

// function findMostCommonKeyword(keywordArrays) {
//   const allKeywords = keywordArrays.flat();
//   const keywordCounts = {};
  
//   allKeywords.forEach(keyword => {
//     keywordCounts[keyword.id] = (keywordCounts[keyword.id] || 0) + 1;
//   });
  
//   const mostCommon = Object.entries(keywordCounts)
//     .sort(([,a], [,b]) => b - a)[0];
  
//   return mostCommon && mostCommon[1] > 1 ? mostCommon[0] : null;
// }

import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const movieIds = searchParams.get("movieIds")?.split(",");
  const year = searchParams.get("year");

  const axiosConfig = { timeout: 8000 };
  
  let resolvedIds = movieIds;
  if (movieIds.some((id) => isNaN(id))) {
    const searchPromises = movieIds.map((title) =>
      axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(title)}`, axiosConfig)
        .catch(err => ({ data: { results: [] } }))
    );
    const searchResponses = await Promise.all(searchPromises);
    resolvedIds = searchResponses.map((res) => res.data.results[0]?.id).filter((id) => id);
    if (resolvedIds.length !== 3) {
      return NextResponse.json({ error: "Could not map all titles to valid movie IDs" }, { status: 400 });
    }
  }

  if (!resolvedIds || resolvedIds.length !== 3) {
    return NextResponse.json({ error: "Exactly 3 movie IDs are required" }, { status: 400 });
  }

  const TMDB_API_KEY = process.env.TMDB_API_KEY;
  const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID;
  const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;

  if (!TMDB_API_KEY) {
    return NextResponse.json({ error: "Missing TMDB_API_KEY environment variable" }, { status: 500 });
  }

  try {
    console.log("Fetching movie details for IDs:", resolvedIds);
    
    const movieDetailsPromises = resolvedIds.map(async (id) => {
      try {
        const [movieDetails, credits, keywords] = await Promise.all([
          axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}`, axiosConfig),
          axios.get(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${TMDB_API_KEY}`, axiosConfig),
          axios.get(`https://api.themoviedb.org/3/movie/${id}/keywords?api_key=${TMDB_API_KEY}`, axiosConfig).catch(() => ({ data: { keywords: [] } }))
        ]);
        return {
          ...movieDetails.data,
          credits: credits.data,
          keywords: keywords.data.keywords || []
        };
      } catch (error) {
        console.error(`Failed to fetch details for movie ${id}:`, error.message);
        throw error;
      }
    });

    const inputMovies = await Promise.all(movieDetailsPromises);
    console.log("Input movies:", inputMovies.map(m => ({ title: m.title, id: m.id, original_language: m.original_language })));

    const movieAnalysis = analyzeInputMoviesEnhanced(inputMovies);
    console.log("Movie analysis:", movieAnalysis);

    let redditRecommendations = [];
    let redditError = null;
    
    if (REDDIT_CLIENT_ID && REDDIT_CLIENT_SECRET) {
      try {
        console.log("Attempting improved Reddit-based recommendations...");
        const redditPromise = getImprovedRedditRecommendations(inputMovies, movieAnalysis, REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, axiosConfig);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Reddit timeout')), 12000)
        );
        
        redditRecommendations = await Promise.race([redditPromise, timeoutPromise]);
        console.log("Reddit recommendations found:", redditRecommendations.length);
      } catch (error) {
        console.log("Reddit API failed, falling back to TMDB:", error.message);
        redditError = error.message;
      }
    }

    const strategies = await getEnhancedStrategiesWithTMDB(inputMovies, movieAnalysis, TMDB_API_KEY, axiosConfig);

    const allRecommendations = [];
    const minYear = parseInt(year, 10) || 2000;

    if (redditRecommendations.length > 0) {
      const redditCandidates = await enhanceRedditRecommendationsWithTMDB(
        redditRecommendations.slice(0, 8),
        TMDB_API_KEY, 
        axiosConfig,
        movieAnalysis
      );
      redditCandidates
        .filter(candidate => {
          if (!candidate.release_date) return false;
          const releaseYear = new Date(candidate.release_date).getFullYear();
          return releaseYear >= minYear;
        })
        .forEach(candidate => {
          allRecommendations.push({
            ...candidate,
            strategyName: "Reddit Community Recommendation",
            strategyPriority: 10,
            source: "reddit"
          });
        });
    }

    const strategyPromises = strategies.map(async (strategy) => {
      try {
        console.log(`Trying strategy: ${strategy.name}`);
        
        let candidates = [];

        if (strategy.customSearch) {
          candidates = await strategy.customSearch(TMDB_API_KEY, axiosConfig, resolvedIds, minYear);
        } else {
          const params = strategy.getParams();
          if (!params) return [];

          let discoveryUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}`;
          discoveryUrl += `&primary_release_date.gte=${minYear}-01-01`;
          
          Object.entries(params).forEach(([key, value]) => {
            if (value) discoveryUrl += `&${key}=${value}`;
          });

          const discoveryResponse = await axios.get(discoveryUrl, axiosConfig);
          candidates = discoveryResponse.data.results;
        }

        candidates = candidates
          .filter(movie => {
            if (!resolvedIds.includes(movie.id.toString())) {
              if (!movie.release_date) return false;
              const releaseYear = new Date(movie.release_date).getFullYear();
              return releaseYear >= minYear;
            }
            return false;
          })
          .slice(0, 5);

        return candidates.map(candidate => ({
          ...candidate,
          strategyName: strategy.name,
          strategyPriority: strategy.priority,
          source: "tmdb"
        }));
      } catch (error) {
        console.log(`Strategy ${strategy.name} failed:`, error.message);
        return [];
      }
    });

    const strategyResults = await Promise.allSettled(strategyPromises);
    strategyResults.forEach(result => {
      if (result.status === 'fulfilled') {
        allRecommendations.push(...result.value);
      }
    });

    console.log(`Total recommendations collected: ${allRecommendations.length}`);

    if (allRecommendations.length === 0) {
      const fallbackMovie = await getEnhancedFallback(inputMovies, movieAnalysis, TMDB_API_KEY, axiosConfig, resolvedIds);
      if (fallbackMovie) {
        allRecommendations.push({
          ...fallbackMovie,
          strategyName: "Enhanced Fallback",
          strategyPriority: 4,
          source: "tmdb"
        });
      }
    }

    if (allRecommendations.length === 0) {
      throw new Error("No recommendations found from any strategy");
    }

    const scoredRecommendations = scoreRecommendationsEnhanced(allRecommendations, inputMovies, movieAnalysis);
    
    scoredRecommendations.sort((a, b) => b.totalScore - a.totalScore);
    
    const bestRecommendation = scoredRecommendations[0];
    
    const detailedMovie = await axios.get(
      `https://api.themoviedb.org/3/movie/${bestRecommendation.id}?api_key=${TMDB_API_KEY}&append_to_response=credits`,
      axiosConfig
    );

    console.log("Best recommendation:", bestRecommendation.title, "Strategy:", bestRecommendation.strategyName, "Score:", bestRecommendation.totalScore);

    return NextResponse.json({
      recommendedMovie: {
        ...detailedMovie.data,
        totalScore: bestRecommendation.totalScore,
        strategyUsed: bestRecommendation.strategyName,
        strategyPriority: bestRecommendation.strategyPriority,
        source: bestRecommendation.source,
        redditData: bestRecommendation.redditData || null,
        movieAnalysis: movieAnalysis,
        genreMatchDetails: bestRecommendation.genreMatchDetails,
        alternativeStrategies: scoredRecommendations.slice(1, 4).map(r => ({
          title: r.title,
          strategy: r.strategyName,
          score: r.totalScore,
          genreMatch: r.genreMatchDetails?.dominantGenreMatch || false
        })),
        redditFallbackUsed: redditError ? true : false,
        redditError: redditError
      },
    });

  } catch (error) {
    console.error("API Error:", {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data,
    });
    return NextResponse.json(
      { error: `Failed to fetch recommendation: ${error.message}` },
      { status: error.response?.status || 500 }
    );
  }
}

function analyzeInputMoviesEnhanced(inputMovies) {
  const analysis = {
    isAnimated: false,
    isAnime: false,
    commonLanguage: null,
    commonCountry: null,
    franchisePattern: null,
    franchiseKeywords: [],
    themes: [],
    avgRating: 0,
    avgYear: 0,
    genreAnalysis: {
      dominantGenres: [],
      genreFrequency: {},
      genreWeights: {},
      primaryGenre: null,
      secondaryGenres: [],
      genreCombo: null
    },
    thematicAnalysis: {
      commonKeywords: [],
      thematicPatterns: [],
      moodIndicators: []
    },
    qualityIndicators: {
      avgRating: 0,
      avgPopularity: 0,
      ratingRange: [0, 0],
      qualityTier: 'standard'
    }
  };

  const allGenres = inputMovies.flatMap(m => m.genres || []);
  const genreCounts = {};
  const genreIds = {};
  
  allGenres.forEach(genre => {
    genreCounts[genre.name] = (genreCounts[genre.name] || 0) + 1;
    genreIds[genre.name] = genre.id;
  });

  const sortedGenres = Object.entries(genreCounts)
    .sort(([,a], [,b]) => b - a)
    .map(([name, count]) => ({ name, count, id: genreIds[name] }));

  analysis.genreAnalysis.genreFrequency = genreCounts;
  analysis.genreAnalysis.dominantGenres = sortedGenres;

  if (sortedGenres.length > 0) {
    analysis.genreAnalysis.primaryGenre = sortedGenres[0];
    analysis.genreAnalysis.secondaryGenres = sortedGenres.slice(1, 3);
    
    const maxCount = sortedGenres[0].count;
    sortedGenres.forEach(genre => {
      analysis.genreAnalysis.genreWeights[genre.name] = genre.count / maxCount;
    });

    if (sortedGenres.length > 1 && sortedGenres[0].count > 1) {
      analysis.genreAnalysis.genreCombo = sortedGenres
        .filter(g => g.count > 1)
        .map(g => g.name)
        .join('-');
    }
  }

  const allKeywords = inputMovies.flatMap(m => m.keywords || []);
  const keywordCounts = {};
  
  allKeywords.forEach(keyword => {
    const keyName = keyword.name.toLowerCase();
    keywordCounts[keyName] = (keywordCounts[keyName] || 0) + 1;
  });

  analysis.thematicAnalysis.commonKeywords = Object.entries(keywordCounts)
    .filter(([, count]) => count > 1)
    .sort(([,a], [,b]) => b - a)
    .map(([name, count]) => ({ name, count }))
    .slice(0, 5);

  const ratings = inputMovies.map(m => m.vote_average || 0);
  const popularities = inputMovies.map(m => m.popularity || 0);
  
  analysis.qualityIndicators.avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  analysis.qualityIndicators.avgPopularity = popularities.reduce((a, b) => a + b, 0) / popularities.length;
  analysis.qualityIndicators.ratingRange = [Math.min(...ratings), Math.max(...ratings)];
  
  if (analysis.qualityIndicators.avgRating >= 7.5) {
    analysis.qualityIndicators.qualityTier = 'premium';
  } else if (analysis.qualityIndicators.avgRating >= 6.5) {
    analysis.qualityIndicators.qualityTier = 'good';
  } else {
    analysis.qualityIndicators.qualityTier = 'standard';
  }

  const animationKeywords = ['animation', 'anime', 'cartoon', 'animated'];
  const animeKeywords = ['anime', 'manga', 'japanese animation'];
  
  const allKeywordNames = allKeywords.map(k => k.name.toLowerCase());
  const allGenreNames = allGenres.map(g => g.name.toLowerCase());
  
  analysis.isAnimated = allGenreNames.some(g => g.includes('animation')) || 
                      allKeywordNames.some(k => animationKeywords.some(ak => k.includes(ak)));
  
  analysis.isAnime = inputMovies.some(m => m.original_language === 'ja') ||
                    allKeywordNames.some(k => animeKeywords.some(ak => k.includes(ak))) ||
                    inputMovies.some(m => m.production_countries?.some(c => c.iso_3166_1 === 'JP'));

  const titles = inputMovies.map(m => m.title.toLowerCase());
  
  const allWords = titles.flatMap(title => 
    title.split(/\s+|[^\w\s]/).filter(word => word.length > 2)
  );
  
  const wordCounts = {};
  allWords.forEach(word => {
    const cleanWord = word.toLowerCase();
    wordCounts[cleanWord] = (wordCounts[cleanWord] || 0) + 1;
  });
  
  const franchiseWords = Object.entries(wordCounts)
    .filter(([word, count]) => count >= 2 && word.length > 2)
    .map(([word]) => word);
  
  if (franchiseWords.length > 0) {
    analysis.franchisePattern = franchiseWords[0];
    analysis.franchiseKeywords = franchiseWords;
  }

  const languages = inputMovies.map(m => m.original_language);
  const languageCounts = {};
  languages.forEach(lang => {
    languageCounts[lang] = (languageCounts[lang] || 0) + 1;
  });
  const mostCommonLang = Object.entries(languageCounts).sort(([,a], [,b]) => b - a)[0];
  if (mostCommonLang && mostCommonLang[1] >= 2) {
    analysis.commonLanguage = mostCommonLang[0];
  }

  const countries = inputMovies.flatMap(m => m.production_countries?.map(c => c.iso_3166_1) || []);
  const countryCounts = {};
  countries.forEach(country => {
    countryCounts[country] = (countryCounts[country] || 0) + 1;
  });
  const mostCommonCountry = Object.entries(countryCounts).sort(([,a], [,b]) => b - a)[0];
  if (mostCommonCountry && mostCommonCountry[1] >= 2) {
    analysis.commonCountry = mostCommonCountry[0];
  }

  analysis.avgRating = analysis.qualityIndicators.avgRating;
  analysis.avgYear = Math.round(inputMovies.reduce((sum, m) => {
    const year = new Date(m.release_date).getFullYear();
    return sum + year;
  }, 0) / inputMovies.length);

  return analysis;
}

async function getEnhancedStrategiesWithTMDB(inputMovies, analysis, TMDB_API_KEY, axiosConfig) {
  const genres = inputMovies.map(m => m.genres || []);
  const directors = inputMovies.map(m => 
    m.credits.crew?.filter(c => c.job === 'Director') || []
  );
  const studios = inputMovies.map(m => m.production_companies || []);
  const keywords = inputMovies.map(m => m.keywords || []);

  const strategies = [];

  if (analysis.commonLanguage) {
    strategies.push({
      name: `${analysis.commonLanguage.toUpperCase()} Language Films`,
      priority: 30,
      getParams: () => {
        const params = {
          with_original_language: analysis.commonLanguage,
          sort_by: 'vote_average.desc',
          'vote_count.gte': 100
        };

        if (analysis.genreAnalysis.primaryGenre) {
          params.with_genres = analysis.genreAnalysis.primaryGenre.id;
        }

        if (analysis.qualityIndicators.qualityTier === 'premium') {
          params['vote_average.gte'] = 7.0;
        } else if (analysis.qualityIndicators.qualityTier === 'good') {
          params['vote_average.gte'] = 6.0;
        }

        if (analysis.isAnimated === false) {
          params.without_genres = '16';
        }

        return params;
      }
    });
  }

  if (analysis.genreAnalysis.primaryGenre && analysis.genreAnalysis.primaryGenre.count > 1) {
    const primaryGenre = analysis.genreAnalysis.primaryGenre;
    
    strategies.push({
      name: `Dominant ${primaryGenre.name} Films`,
      priority: 25,
      getParams: () => {
        const params = {
          with_genres: primaryGenre.id,
          sort_by: 'vote_average.desc',
          'vote_count.gte': analysis.qualityIndicators.qualityTier === 'premium' ? 1000 : 500
        };

        if (analysis.commonLanguage) {
          params.with_original_language = analysis.commonLanguage;
        }

        const secondaryRecurringGenres = analysis.genreAnalysis.secondaryGenres
          .filter(g => g.count > 1)
          .slice(0, 2);
        
        if (secondaryRecurringGenres.length > 0) {
          params.with_genres += ',' + secondaryRecurringGenres.map(g => g.id).join(',');
        }

        if (analysis.qualityIndicators.qualityTier === 'premium') {
          params['vote_average.gte'] = 7.0;
        } else if (analysis.qualityIndicators.qualityTier === 'good') {
          params['vote_average.gte'] = 6.0;
        }

        if (analysis.isAnimated === false) {
          params.without_genres = '16';
        }

        return params;
      }
    });

    if (analysis.genreAnalysis.genreCombo) {
      strategies.push({
        name: `${analysis.genreAnalysis.genreCombo} Combination`,
        priority: 22,
        getParams: () => {
          const recurringGenres = analysis.genreAnalysis.dominantGenres
            .filter(g => g.count > 1)
            .slice(0, 3);
          
          const params = {
            with_genres: recurringGenres.map(g => g.id).join(','),
            sort_by: 'vote_average.desc',
            'vote_count.gte': 300
          };

          if (analysis.commonLanguage) {
            params.with_original_language = analysis.commonLanguage;
          }

          if (analysis.isAnimated === false) {
            params.without_genres = '16';
          }

          return params;
        }
      });
    }
  }

  if (analysis.franchisePattern || analysis.franchiseKeywords.length > 0) {
    const basePriority = analysis.franchisePattern ? 35 : 18;
    
    strategies.push({
      name: "Same Franchise/Series",
      priority: basePriority,
      customSearch: async (apiKey, config, excludeIds, minYear) => {
        const franchiseTerms = analysis.franchiseKeywords.length > 0 
          ? analysis.franchiseKeywords 
          : [analysis.franchisePattern];
        
        console.log("Searching for franchise terms:", franchiseTerms);
        
        const searchResults = [];
        
        for (const term of franchiseTerms.slice(0, 3)) {
          try {
            let searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(term)}&sort_by=vote_average.desc`; // Changed to vote_average.desc
            if (analysis.commonLanguage) {
              searchUrl += `&with_original_language=${analysis.commonLanguage}`;
            }
            
            const searchResponse = await axios.get(searchUrl, config);
            
            let results = searchResponse.data.results
              .filter(movie => {
                if (excludeIds.includes(movie.id.toString())) return false;
                if (movie.vote_count < 100) return false; // Increased vote_count threshold
                if (!movie.title.toLowerCase().includes(term.toLowerCase())) return false;
                if (analysis.isAnimated === false && movie.genre_ids?.includes(16)) return false;
                
                if (movie.release_date) {
                  const releaseYear = new Date(movie.release_date).getFullYear();
                  if (releaseYear < minYear) return false;
                }
                
                return true;
              });

            searchResults.push(...results.slice(0, 10)); // Increased to 10 candidates
            console.log(`Found ${results.length} movies for term "${term}" after ${minYear}`);
          } catch (error) {
            console.log(`Franchise search failed for term "${term}":`, error.message);
          }
        }
        
        const uniqueResults = searchResults.filter((movie, index, self) => 
          index === self.findIndex(m => m.id === movie.id)
        );
        
        return uniqueResults
          .sort((a, b) => b.vote_average - a.vote_average) // Sort by vote_average
          .slice(0, 10);
      }
    });
  }

  if (analysis.thematicAnalysis.commonKeywords.length > 0) {
    const topKeyword = analysis.thematicAnalysis.commonKeywords[0];
    
    strategies.push({
      name: `Thematic Match: ${topKeyword.name}`,
      priority: 16,
      customSearch: async (apiKey, config, excludeIds, minYear) => {
        try {
          const keywordSearch = await axios.get(
            `https://api.themoviedb.org/3/search/keyword?api_key=${apiKey}&query=${encodeURIComponent(topKeyword.name)}`,
            config
          );
          
          if (keywordSearch.data.results.length > 0) {
            const keywordId = keywordSearch.data.results[0].id;
            
            let moviesUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_keywords=${keywordId}&sort_by=vote_average.desc&vote_count.gte=100&primary_release_date.gte=${minYear}-01-01`;
            if (analysis.commonLanguage) {
              moviesUrl += `&with_original_language=${analysis.commonLanguage}`;
            }
            if (analysis.isAnimated === false) {
              moviesUrl += `&without_genres=16`;
            }
            
            const moviesResponse = await axios.get(moviesUrl, config);
            
            return moviesResponse.data.results
              .filter(movie => !excludeIds.includes(movie.id.toString()))
              .slice(0, 8);
          }
        } catch (error) {
          console.log(`Thematic search failed for "${topKeyword.name}":`, error.message);
        }
        return [];
      }
    });
  }

  if (analysis.isAnime) {
    strategies.push({
      name: "Anime Movies",
      priority: 35,
      customSearch: async (apiKey, config, excludeIds, minYear) => {
        const searches = [
          axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_original_language=ja&with_genres=16&sort_by=vote_average.desc&vote_count.gte=50&primary_release_date.gte=${minYear}-01-01`, config),
          axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_keywords=210024&sort_by=popularity.desc&primary_release_date.gte=${minYear}-01-01`, config),
          axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_companies=10342,2251&sort_by=vote_average.desc&primary_release_date.gte=${minYear}-01-01`, config)
        ];
        
        const results = await Promise.allSettled(searches);
        const allMovies = [];
        
        results.forEach(result => {
          if (result.status === 'fulfilled') {
            allMovies.push(...result.value.data.results);
          }
        });
        
        return allMovies
          .filter(movie => !excludeIds.includes(movie.id.toString()))
          .filter((movie, index, self) => index === self.findIndex(m => m.id === movie.id))
          .slice(0, 10);
      }
    });
  } else if (analysis.isAnimated) {
    strategies.push({
      name: "Animation Movies",
      priority: 13,
      getParams: () => {
        const params = {
          with_genres: '16',
          sort_by: 'vote_average.desc',
          'vote_count.gte': 500
        };
        if (analysis.commonLanguage) {
          params.with_original_language = analysis.commonLanguage;
        }
        return params;
      }
    });
  }

  const commonDirector = findMostCommonPerson(directors);
  if (commonDirector) {
    const directorId = directors.flat().find(d => d.name === commonDirector)?.id;
    if (directorId) {
      strategies.push({
        name: "Same Director Different Style",
        priority: 10,
        getParams: () => {
          const params = {
            with_crew: directorId,
            sort_by: 'vote_average.desc'
          };
          if (analysis.commonLanguage) {
            params.with_original_language = analysis.commonLanguage;
          }
          if (analysis.isAnimated === false) {
            params.without_genres = '16';
          }
          return params;
        }
      });
    }
  }

  const commonStudio = findMostCommonStudio(studios);
  if (commonStudio) {
    const studioId = studios.flat().find(s => s.name === commonStudio)?.id;
    if (studioId) {
      strategies.push({
        name: "Same Studio Production",
        priority: 9,
        getParams: () => {
          const params = {
            with_companies: studioId,
            sort_by: 'vote_average.desc'
          };
          if (analysis.commonLanguage) {
            params.with_original_language = analysis.commonLanguage;
          }
          if (analysis.isAnimated === false) {
            params.without_genres = '16';
          }
          return params;
        }
      });
    }
  }

  return strategies;
}

function scoreRecommendationsEnhanced(allRecommendations, inputMovies, analysis) {
  return allRecommendations.map(candidate => {
    let totalScore = 0;
    let genreMatchDetails = {
      dominantGenreMatch: false,
      secondaryGenreMatches: 0,
      genreOverlapScore: 0,
      thematicBonus: 0
    };
    
    totalScore += (candidate.vote_average || 0) * 4;
    totalScore += Math.log10((candidate.popularity || 1)) * 10;
    
    totalScore += (candidate.strategyPriority || 0) * 8;
    
    if (candidate.redditData) {
      totalScore += (candidate.redditData.redditScore || 0) * 3;
      totalScore += (candidate.redditData.mentions || 0) * 4;
      totalScore += (candidate.redditData.confidence || 0) * 5;
      totalScore += candidate.redditData.subreddits?.length || 0 * 6;
    }
    
    if (analysis.genreAnalysis.primaryGenre && candidate.genre_ids) {
      const candidateGenres = candidate.genre_ids;
      
      if (candidateGenres.includes(analysis.genreAnalysis.primaryGenre.id)) {
        const dominantGenreBonus = 100 * analysis.genreAnalysis.genreWeights[analysis.genreAnalysis.primaryGenre.name];
        totalScore += dominantGenreBonus;
        genreMatchDetails.dominantGenreMatch = true;
        genreMatchDetails.genreOverlapScore += dominantGenreBonus;
      }
      
      analysis.genreAnalysis.secondaryGenres.forEach(secondaryGenre => {
        if (candidateGenres.includes(secondaryGenre.id)) {
          const secondaryBonus = 50 * analysis.genreAnalysis.genreWeights[secondaryGenre.name];
          totalScore += secondaryBonus;
          genreMatchDetails.secondaryGenreMatches++;
          genreMatchDetails.genreOverlapScore += secondaryBonus;
        }
      });
      
      const recurringGenreMatches = analysis.genreAnalysis.dominantGenres
        .filter(g => g.count > 1 && candidateGenres.includes(g.id))
        .length;
      
      if (recurringGenreMatches >= 2) {
        const comboBonus = 40 * recurringGenreMatches;
        totalScore += comboBonus;
        genreMatchDetails.genreOverlapScore += comboBonus;
      }
    }
    
    if (analysis.thematicAnalysis.commonKeywords.length > 0 && candidate.overview) {
      const overviewLower = candidate.overview.toLowerCase();
      analysis.thematicAnalysis.commonKeywords.forEach(keyword => {
        if (overviewLower.includes(keyword.name.toLowerCase())) {
          const thematicBonus = 20 * keyword.count;
          totalScore += thematicBonus;
          genreMatchDetails.thematicBonus += thematicBonus;
        }
      });
    }
    
    if (analysis.franchisePattern) {
      const titleLower = (candidate.title || '').toLowerCase();
      if (titleLower.includes(analysis.franchisePattern.toLowerCase())) {
        let franchiseBonus = 200; // Increased franchise bonus
        if (genreMatchDetails.dominantGenreMatch) {
          franchiseBonus += 100; // Increased bonus for genre match
        }
        totalScore += franchiseBonus;
      }
      
      analysis.franchiseKeywords?.forEach(keyword => {
        if (titleLower.includes(keyword.toLowerCase())) {
          let keywordBonus = 100; // Increased keyword bonus
          if (genreMatchDetails.dominantGenreMatch) {
            keywordBonus += 50;
          }
          totalScore += keywordBonus;
        }
      });
    }
    
    const qualityAlignment = calculateQualityAlignment(candidate, analysis.qualityIndicators);
    totalScore += qualityAlignment * 15;
    
    if (analysis.qualityIndicators.qualityTier === 'premium' && candidate.vote_average >= 7.5) {
      totalScore += 50; // Quality tier bonus for premium
    }
    
    const ratingDiff = Math.abs((candidate.vote_average || 0) - analysis.avgRating);
    if (ratingDiff <= 0.5) totalScore += 25;
    else if (ratingDiff <= 1) totalScore += 15;
    else if (ratingDiff <= 1.5) totalScore += 8;
    
    if (analysis.commonLanguage && candidate.original_language === analysis.commonLanguage) {
      let langBonus = 50;
      if (analysis.commonLanguage !== 'en') {
        langBonus += 50;
      }
      totalScore += langBonus;
    }
    
    if (analysis.isAnime && candidate.original_language === 'ja') {
      totalScore += 100;
    }
    if (analysis.isAnimated && candidate.genre_ids?.includes(16)) {
      totalScore += 80;
    }
    if (analysis.isAnimated === false && !candidate.genre_ids?.includes(16)) {
      totalScore += 100;
    }
    
    if (candidate.release_date) {
      const releaseYear = new Date(candidate.release_date).getFullYear();
      const recencyMultiplier = analysis.qualityIndicators.qualityTier === 'premium' ? 1.5 : 1.0;
      
      if (releaseYear >= 2020) totalScore += 15 * recencyMultiplier;
      else if (releaseYear >= 2015) totalScore += 10 * recencyMultiplier;
      else if (releaseYear >= 2010) totalScore += 5 * recencyMultiplier;
    }
    
    const popularityScore = Math.log10((candidate.popularity || 1)) * 3;
    const qualityScore = (candidate.vote_average || 0) * 8;
    const voteCountReliability = candidate.vote_count >= 500 ? 20 : 
                                candidate.vote_count >= 100 ? 10 : 
                                candidate.vote_count >= 50 ? 5 : 0;
    
    totalScore += popularityScore + qualityScore + voteCountReliability;
    
    const inputGenreIds = inputMovies.flatMap(m => m.genres?.map(g => g.id) || []);
    const candidateGenreIds = candidate.genre_ids || [];
    const genreOverlap = candidateGenreIds.filter(g => inputGenreIds.includes(g)).length;
    const genreDiversity = candidateGenreIds.length - genreOverlap;
    
    totalScore += genreOverlap * 12;
    totalScore += Math.min(genreDiversity * 4, 12);
    
    if (candidate.vote_count >= 5000) totalScore += 25;
    else if (candidate.vote_count >= 1000) totalScore += 15;
    else if (candidate.vote_count >= 500) totalScore += 10;
    
    return {
      ...candidate,
      totalScore: Math.round(totalScore),
      genreMatchDetails
    };
  });
}

function calculateQualityAlignment(candidate, qualityIndicators) {
  const candidateRating = candidate.vote_average || 0;
  const candidatePopularity = candidate.popularity || 0;
  
  let alignmentScore = 0;
  
  const ratingDiff = Math.abs(candidateRating - qualityIndicators.avgRating);
  if (ratingDiff <= 0.5) alignmentScore += 3;
  else if (ratingDiff <= 1.0) alignmentScore += 2;
  else if (ratingDiff <= 1.5) alignmentScore += 1;
  
  if (qualityIndicators.qualityTier === 'premium' && candidateRating >= 7.5) {
    alignmentScore += 3;
  } else if (qualityIndicators.qualityTier === 'good' && candidateRating >= 6.5) {
    alignmentScore += 2;
  } else if (qualityIndicators.qualityTier === 'standard' && candidateRating >= 5.5) {
    alignmentScore += 1;
  }
  
  if (qualityIndicators.avgPopularity > 50 && candidatePopularity > 30) {
    alignmentScore += 2;
  }
  
  return alignmentScore;
}

async function getImprovedRedditRecommendations(inputMovies, analysis, clientId, clientSecret, axiosConfig) {
  const accessToken = await getRedditAccessToken(clientId, clientSecret, axiosConfig);
  const recommendations = new Map();
  
  let subreddits = ['MovieSuggestions', 'movies'];
  
  if (analysis.isAnime) {
    subreddits = ['anime', 'AnimeSuggest', 'MovieSuggestions'];
  } else if (analysis.isAnimated) {
    subreddits = ['MovieSuggestions', 'movies', 'animation'];
  } else if (analysis.genreAnalysis.primaryGenre) {
    const genreName = analysis.genreAnalysis.primaryGenre.name.toLowerCase();
    if (genreName === 'horror') subreddits.push('horror');
    if (genreName === 'science fiction') subreddits.push('scifi');
    if (genreName === 'adventure') subreddits.push('movies'); // Adventure often discussed in movies
  }

  const searchQueries = generateEnhancedSearchQueries(inputMovies, analysis);
  
  console.log("Reddit search queries:", searchQueries);
  console.log("Reddit subreddits:", subreddits);

  const searchPromises = [];
  
  for (const subreddit of subreddits.slice(0, 2)) {
    for (const query of searchQueries.slice(0, 3)) {
      const searchUrl = `https://oauth.reddit.com/r/${subreddit}/search?q=${encodeURIComponent(query)}&restrict_sr=1&sort=top&t=year&limit=25`;
      
      searchPromises.push(
        axios.get(searchUrl, {
          ...axiosConfig,
          timeout: 5000,
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'User-Agent': 'MovieRecommendationBot/1.0'
          }
        }).then(response => ({ subreddit, query, posts: response.data.data.children }))
        .catch(error => ({ subreddit, query, posts: [], error: error.message }))
      );
    }
  }

  const searchResults = await Promise.all(searchPromises);
  
  for (const { subreddit, posts } of searchResults) {
    for (const post of posts) {
      const postData = post.data;
      if (postData.score < 2) continue;
      
      const extractedMovies = extractMovieRecommendationsEnhanced(postData, inputMovies, analysis);
      
      extractedMovies.forEach(movie => {
        const key = movie.title.toLowerCase();
        if (!recommendations.has(key)) {
          recommendations.set(key, {
            title: movie.title,
            redditScore: 0,
            upvotes: 0,
            mentions: 0,
            subreddits: new Set(),
            confidence: 0,
            genreHints: movie.genreHints || []
          });
        }
        
        const rec = recommendations.get(key);
        rec.redditScore += movie.score;
        rec.upvotes += movie.upvotes;
        rec.mentions += 1;
        rec.confidence += movie.confidence || 1;
        rec.subreddits.add(subreddit);
        if (movie.genreHints) {
          rec.genreHints.push(...movie.genreHints);
        }
      });
    }
  }
  
  console.log("Reddit raw recommendations found:", recommendations.size);
  
  return Array.from(recommendations.values())
    .filter(rec => rec.mentions >= 1)
    .sort((a, b) => (b.redditScore * b.confidence) - (a.redditScore * a.confidence))
    .slice(0, 10);
}

function generateEnhancedSearchQueries(inputMovies, analysis) {
  const queries = [];
  
  if (analysis.genreAnalysis.primaryGenre) {
    const genreName = analysis.genreAnalysis.primaryGenre.name.toLowerCase();
    queries.push(`best ${genreName} movies`);
    queries.push(`${genreName} recommendations`);
    
    if (analysis.genreAnalysis.genreCombo) {
      queries.push(`${analysis.genreAnalysis.genreCombo.replace('-', ' ')} movies`);
    }
  }
  
  if (analysis.franchisePattern) {
    queries.push(`${analysis.franchisePattern} movie recommendations`);
    queries.push(`best ${analysis.franchisePattern} films`);
  }

  queries.push(`movies like ${inputMovies[0].title}`);
  queries.push(`similar to ${inputMovies[0].title}`);
  
  if (analysis.thematicAnalysis.commonKeywords.length > 0) {
    const topKeyword = analysis.thematicAnalysis.commonKeywords[0];
    queries.push(`${topKeyword.name} movies`);
  }

  if (analysis.commonLanguage && analysis.commonLanguage !== 'en') {
    queries.push(`${analysis.commonLanguage} language movies`);
  }

  return queries.slice(0, 5);
}

function extractMovieRecommendationsEnhanced(postData, inputMovies, analysis) {
  const recommendations = [];
  const fullText = (postData.title + ' ' + (postData.selftext || ''));
  const textLower = fullText.toLowerCase();
  const inputTitles = inputMovies.map(m => m.title.toLowerCase());
  
  const onlyMentionsInput = inputTitles.some(title => textLower.includes(title));
  if (onlyMentionsInput && !textLower.includes('recommend') && !textLower.includes('similar')) {
    return [];
  }

  const patterns = [
    { regex: /"([^"]{2,40})"/g, confidence: 3 },
    { regex: /'([^']{2,40})'/g, confidence: 3 },
    { regex: /\*\*([^*]{2,40})\*\*/g, confidence: 3 },
    { regex: /__([^_]{2,40})__/g, confidence: 3 },
    { regex: /([A-Z][a-zA-Z\s&:'-]{2,35})\s*\((\d{4})\)/g, confidence: 4 },
    { regex: /(?:watch|try|check out|recommend)\s+([A-Z][a-zA-Z\s&:'-]{2,35})/g, confidence: 3 },
    { regex: /([A-Z][a-zA-Z\s&:'-]{2,35})\s+is\s+(?:great|amazing|good|excellent)/g, confidence: 3 },
    { regex: /^\s*[-*•]\s*([A-Z][a-zA-Z\s&:'-]{2,35})/gm, confidence: 2 },
    { regex: /^\s*\d+\.\s*([A-Z][a-zA-Z\s&:'-]{2,35})/gm, confidence: 2 },
    { regex: /\b([A-Z][a-zA-Z]{2,25}(?:\s+[A-Z][a-zA-Z]{2,25}){0,3})\b/g, confidence: 1 }
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.regex.exec(fullText)) !== null) {
      let title = match[1].trim();
      
      title = title.replace(/[.,!?;:]$/, '');
      
      if (title.length < 3 || title.length > 50) continue;
      if (inputTitles.some(inputTitle => 
        title.toLowerCase().includes(inputTitle) || inputTitle.includes(title.toLowerCase())
      )) continue;
      
      const falsePositives = [
        'movie', 'film', 'cinema', 'theater', 'netflix', 'hulu', 'amazon', 'disney',
        'watch', 'seen', 'recommend', 'suggestion', 'looking', 'similar', 'like',
        'genre', 'director', 'actor', 'year', 'time', 'story', 'plot', 'character',
        'good', 'great', 'bad', 'best', 'worst', 'love', 'hate', 'think', 'feel'
      ];
      
      if (falsePositives.some(fp => title.toLowerCase() === fp || title.toLowerCase().includes(fp + ' '))) {
        continue;
      }
      
      let confidenceBoost = 0;
      const genreHints = [];
      
      if (analysis.franchisePattern && title.toLowerCase().includes(analysis.franchisePattern.toLowerCase())) {
        confidenceBoost += 3;
      }
      
      if (analysis.genreAnalysis.primaryGenre) {
        const genreName = analysis.genreAnalysis.primaryGenre.name.toLowerCase();
        const contextWords = fullText.toLowerCase().split(/\s+/);
        const titleIndex = contextWords.findIndex(word => word.includes(title.toLowerCase().split(' ')[0]));
        
        if (titleIndex !== -1) {
          const contextWindow = contextWords.slice(Math.max(0, titleIndex - 5), titleIndex + 6);
          if (contextWindow.some(word => word.includes(genreName))) {
            confidenceBoost += 2;
            genreHints.push(genreName);
          }
        }
      }
      
      recommendations.push({
        title: title,
        score: postData.score,
        upvotes: postData.ups || postData.score,
        confidence: pattern.confidence + confidenceBoost,
        genreHints: genreHints
      });
    }
  });
  
  const uniqueRecs = [];
  const seenTitles = new Set();
  
  recommendations
    .sort((a, b) => b.confidence - a.confidence)
    .forEach(rec => {
      const titleKey = rec.title.toLowerCase();
      if (!seenTitles.has(titleKey)) {
        seenTitles.add(titleKey);
        uniqueRecs.push(rec);
      }
    });
  
  return uniqueRecs.slice(0, 8);
}

async function getEnhancedFallback(inputMovies, analysis, apiKey, axiosConfig, resolvedIds) {
  try {
    if (analysis.franchisePattern) {
      console.log("Trying franchise fallback for:", analysis.franchisePattern);
      let searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(analysis.franchisePattern)}&sort_by=vote_average.desc`;
      if (analysis.commonLanguage) {
        searchUrl += `&with_original_language=${analysis.commonLanguage}`;
      }
      if (analysis.isAnimated === false) {
        searchUrl += `&without_genres=16`;
      }
      const searchResponse = await axios.get(searchUrl, axiosConfig);
      const candidate = searchResponse.data.results.find(movie => 
        !resolvedIds.includes(movie.id.toString()) && 
        movie.vote_count > 100 &&
        movie.title.toLowerCase().includes(analysis.franchisePattern.toLowerCase()) &&
        movie.vote_average >= (analysis.avgRating - 0.5) // Tighter rating threshold
      );
      if (candidate) {
        console.log("Found franchise fallback:", candidate.title);
        return candidate;
      }
    }

    if (analysis.isAnime) {
      console.log("Trying anime-specific fallback");
      
      let animeQuery = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_original_language=ja&with_genres=16&sort_by=vote_average.desc&vote_count.gte=50`;
      
      const voteCountMin = analysis.qualityIndicators.qualityTier === 'premium' ? 1000 : 
                          analysis.qualityIndicators.qualityTier === 'good' ? 500 : 100;
      
      animeQuery += `&vote_count.gte=${voteCountMin}`;
      
      const animeResponse = await axios.get(animeQuery, axiosConfig);
      
      const candidate = animeResponse.data.results.find(movie => 
        !resolvedIds.includes(movie.id.toString()) && 
        movie.vote_average >= (analysis.avgRating - 1.0)
      );
      
      if (candidate) {
        console.log("Found anime fallback:", candidate.title);
        return candidate;
      }
    }

    if (analysis.commonLanguage) {
      console.log("Trying language-based fallback for:", analysis.commonLanguage);
      
      let langQuery = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_original_language=${analysis.commonLanguage}&sort_by=vote_average.desc&vote_count.gte=100`;
      
      if (analysis.genreAnalysis.primaryGenre) {
        langQuery += `&with_genres=${analysis.genreAnalysis.primaryGenre.id}`;
      }
      if (analysis.isAnimated === false) {
        langQuery += `&without_genres=16`;
      }
      
      const voteCountMin = analysis.qualityIndicators.qualityTier === 'premium' ? 1000 : 
                          analysis.qualityIndicators.qualityTier === 'good' ? 500 : 100;
      
      langQuery += `&vote_count.gte=${voteCountMin}`;
      
      const langResponse = await axios.get(langQuery, axiosConfig);
      
      const candidate = langResponse.data.results.find(movie => 
        !resolvedIds.includes(movie.id.toString()) && 
        movie.vote_average >= (analysis.avgRating - 1.0)
      );
      
      if (candidate) {
        console.log("Found language-based fallback:", candidate.title);
        return candidate;
      }
    }

    if (analysis.genreAnalysis.primaryGenre) {
      console.log("Trying dominant genre fallback:", analysis.genreAnalysis.primaryGenre.name);
      
      const voteCountMin = analysis.qualityIndicators.qualityTier === 'premium' ? 1000 : 
                          analysis.qualityIndicators.qualityTier === 'good' ? 500 : 100;
      
      let genreQuery = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${analysis.genreAnalysis.primaryGenre.id}&sort_by=vote_average.desc&vote_count.gte=${voteCountMin}`;
      if (analysis.isAnimated === false) {
        genreQuery += `&without_genres=16`;
      }
      
      const genreResponse = await axios.get(genreQuery, axiosConfig);
      
      const candidate = genreResponse.data.results.find(movie => 
        !resolvedIds.includes(movie.id.toString()) && 
        movie.vote_average >= (analysis.avgRating - 1.0)
      );
      
      if (candidate) {
        console.log("Found genre-based fallback:", candidate.title);
        return candidate;
      }
    }

    if (analysis.isAnimated) {
      let animQuery = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=16&sort_by=vote_average.desc&vote_count.gte=100`;
      
      if (analysis.commonLanguage) {
        animQuery += `&with_original_language=${analysis.commonLanguage}`;
      }
      
      const animResponse = await axios.get(animQuery, axiosConfig);
      const candidate = animResponse.data.results.find(movie => 
        !resolvedIds.includes(movie.id.toString()) && 
        movie.vote_average >= (analysis.avgRating - 1.0)
      );
      if (candidate) {
        console.log("Found animation fallback:", candidate.title);
        return candidate;
      }
    }

    return null;
  } catch (error) {
    console.error("Enhanced fallback failed:", error);
    return null;
  }
}

async function getRedditAccessToken(clientId, clientSecret, axiosConfig) {
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  
  const response = await axios.post(
    'https://www.reddit.com/api/v1/access_token',
    'grant_type=client_credentials',
    {
      ...axiosConfig,
      timeout: 5000,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'MovieRecommendationBot/1.0'
      }
    }
  );
  return response.data.access_token;
}

async function enhanceRedditRecommendationsWithTMDB(redditRecs, apiKey, axiosConfig, movieAnalysis) {
  const enhancedRecs = [];
  
  const enhancePromises = redditRecs.map(async (rec) => {
    try {
      let searchResponse = await axios.get(
        `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(rec.title)}`,
        { ...axiosConfig, timeout: 4000 }
      );
      
      let tmdbResults = searchResponse.data.results;
      
      if (tmdbResults.length === 0 && rec.title.includes(' ')) {
        const words = rec.title.split(' ');
        const partialTitle = words.slice(0, Math.min(3, words.length)).join(' ');
        searchResponse = await axios.get(
          `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(partialTitle)}`,
          { ...axiosConfig, timeout: 4000 }
        );
        tmdbResults = searchResponse.data.results;
      }
      
      if (tmdbResults.length > 0) {
        const bestMatch = tmdbResults
          .filter(movie => movie.vote_count > 100) // Stricter vote_count
          .reduce((best, current) => {
            const bestSimilarity = calculateTitleSimilarity(rec.title, best.title);
            const currentSimilarity = calculateTitleSimilarity(rec.title, current.title);
            
            const bestScore = bestSimilarity * 0.7 + (best.popularity || 0) * 0.3;
            const currentScore = currentSimilarity * 0.7 + (current.popularity || 0) * 0.3;
            
            return currentScore > bestScore ? current : best;
          }, tmdbResults[0]);
        
        const titleLower = bestMatch.title.toLowerCase();
        const isFranchiseMatch = movieAnalysis.franchisePattern && titleLower.includes(movieAnalysis.franchisePattern.toLowerCase());
        const isGenreMatch = movieAnalysis.genreAnalysis.primaryGenre && bestMatch.genre_ids?.includes(movieAnalysis.genreAnalysis.primaryGenre.id);
        
        if (movieAnalysis.isAnime && 
            (bestMatch.original_language === 'ja' || bestMatch.genre_ids?.includes(16)) && 
            calculateTitleSimilarity(rec.title, bestMatch.title) > 0.3) {
          return {
            ...bestMatch,
            redditData: {
              originalTitle: rec.title,
              redditScore: rec.redditScore,
              mentions: rec.mentions,
              upvotes: rec.upvotes,
              confidence: rec.confidence,
              subreddits: Array.from(rec.subreddits),
              genreHints: rec.genreHints || []
            }
          };
        } else if (!movieAnalysis.isAnimated && 
                   !bestMatch.genre_ids?.includes(16) && 
                   bestMatch.vote_average >= (movieAnalysis.qualityIndicators.qualityTier === 'premium' ? 7.0 : 6.0) &&
                   (isFranchiseMatch || isGenreMatch) && 
                   calculateTitleSimilarity(rec.title, bestMatch.title) > 0.3) {
          return {
            ...bestMatch,
            redditData: {
              originalTitle: rec.title,
              redditScore: rec.redditScore,
              mentions: rec.mentions,
              upvotes: rec.upvotes,
              confidence: rec.confidence,
              subreddits: Array.from(rec.subreddits),
              genreHints: rec.genreHints || []
            }
          };
        }
      }
    } catch (error) {
      console.log(`Error enhancing Reddit recommendation ${rec.title}:`, error.message);
    }
    return null;
  });
  
  const results = await Promise.allSettled(enhancePromises);
  return results
    .filter(result => result.status === 'fulfilled' && result.value !== null)
    .map(result => result.value);
}

function calculateTitleSimilarity(title1, title2) {
  const t1 = title1.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const t2 = title2.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  
  if (t1 === t2) return 1.0;
  
  const words1 = new Set(t1.split(/\s+/).filter(w => w.length > 0));
  const words2 = new Set(t2.split(/\s+/).filter(w => w.length > 0));
  
  if (words1.size === 0 || words2.size === 0) return 0;
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

function findMostCommonPerson(personArrays) {
  const allPeople = personArrays.flat();
  const personCounts = {};
  
  allPeople.forEach(person => {
    personCounts[person.name] = (personCounts[person.name] || 0) + 1;
  });
  
  const mostCommon = Object.entries(personCounts)
    .sort(([,a], [,b]) => b - a)[0];
  
  return mostCommon && mostCommon[1] > 1 ? mostCommon[0] : null;
}

function findMostCommonStudio(studioArrays) {
  const allStudios = studioArrays.flat();
  const studioCounts = {};
  
  allStudios.forEach(studio => {
    studioCounts[studio.name] = (studioCounts[studio.name] || 0) + 1;
  });
  
  const mostCommon = Object.entries(studioCounts)
    .sort(([,a], [,b]) => b - a)[0];
  
  return mostCommon && mostCommon[1] > 1 ? mostCommon[0] : null;
}