import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const movieIds = searchParams.get("movieIds")?.split(",");
  const year = searchParams.get("year");
  const otherLanguages = searchParams.get("otherLanguages") === 'true';

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

  if (!year || !year.includes("-")) {
    return NextResponse.json({ error: "Invalid year range format. Use minYear-maxYear (e.g., 2010-2020)" }, { status: 400 });
  }

  const [minYear, maxYear] = year.split("-").map(Number);
  if (isNaN(minYear) || isNaN(maxYear) || minYear > maxYear) {
    return NextResponse.json({ error: "Invalid year range. Ensure minYear <= maxYear" }, { status: 400 });
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
          axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=belongs_to_collection`, axiosConfig),
          axios.get(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${TMDB_API_KEY}`, axiosConfig),
          axios.get(`https://api.themoviedb.org/3/movie/${id}/keywords?api_key=${TMDB_API_KEY}`, axiosConfig).catch(() => ({ data: { keywords: [] } }))
        ]);
        return {
          ...movieDetails.data,
          credits: credits.data,
          keywords: keywords.data.keywords || [],
          belongs_to_collection: movieDetails.data.belongs_to_collection || null
        };
      } catch (error) {
        console.error(`Failed to fetch details for movie ${id}:`, error.message);
        throw error;
      }
    });

    const inputMovies = await Promise.all(movieDetailsPromises);
    console.log("Input movies:", inputMovies.map(m => ({ title: m.title, id: m.id, original_language: m.original_language })));

    const movieAnalysis = await analyzeInputMoviesEnhanced(inputMovies);
    console.log("Movie analysis:", movieAnalysis);

    // NEW: Compute allowedLanguages based on input movies' languages
    const inputLanguages = new Set(inputMovies.map(m => m.original_language));
    let allowedLanguages;
    if (inputLanguages.size === 3) {
      allowedLanguages = Array.from(inputLanguages);
    } else {
      const langCounts = {};
      inputMovies.forEach(m => {
        const lang = m.original_language;
        langCounts[lang] = (langCounts[lang] || 0) + 1;
      });
      const commonLang = Object.entries(langCounts).find(([lang, count]) => count >= 2)?.[0];
      allowedLanguages = commonLang ? [commonLang] : []; // Fallback to empty if no common (edge case)
    }
    console.log("Allowed languages for recommendations:", allowedLanguages);

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

    const strategies = await getEnhancedStrategiesWithTMDB(inputMovies, movieAnalysis, TMDB_API_KEY, axiosConfig, minYear, maxYear, allowedLanguages, otherLanguages);

    let allRecommendations = [];

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
          return releaseYear >= minYear && releaseYear <= maxYear;
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
          candidates = await strategy.customSearch(TMDB_API_KEY, axiosConfig, resolvedIds, minYear, maxYear, allowedLanguages, otherLanguages);
        } else {
          const params = strategy.getParams(allowedLanguages, otherLanguages);
          if (!params) return [];

          let discoveryUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}`;
          discoveryUrl += `&primary_release_date.gte=${minYear}-01-01&primary_release_date.lte=${maxYear}-12-31`;
          
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
              return releaseYear >= minYear && releaseYear <= maxYear;
            }
            return false;
          })
          .slice(0, otherLanguages ? 20 : 5);

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
      const fallbackMovie = await getEnhancedFallback(inputMovies, movieAnalysis, TMDB_API_KEY, axiosConfig, resolvedIds, minYear, maxYear, allowedLanguages, otherLanguages);
      if (fallbackMovie) {
        allRecommendations.push({
          ...fallbackMovie,
          strategyName: "Enhanced Fallback",
          strategyPriority: 4,
          source: "tmdb"
        });
      }
    }

    // NEW: Apply language filter to the full initial pool (after fallback if needed)
    allRecommendations = allRecommendations.filter(candidate => {
      if (otherLanguages) {
        return candidate.original_language && !allowedLanguages.includes(candidate.original_language);
      } else {
        return allowedLanguages.includes(candidate.original_language);
      }
    });
    console.log(`Recommendations after language filter: ${allRecommendations.length}`);

    if (allRecommendations.length === 0) {
      throw new Error("No recommendations found for the specified year range");
    }

    const scoredRecommendations = scoreRecommendationsEnhanced(allRecommendations, inputMovies, movieAnalysis);
    
    scoredRecommendations.sort((a, b) => b.totalScore - a.totalScore);

    let topRecommendations;
    if (otherLanguages) {
      const uniqueLangRecs = [];
      const seenLangs = new Set();
      for (const rec of scoredRecommendations) {
        if (rec.original_language && !seenLangs.has(rec.original_language)) {
          seenLangs.add(rec.original_language);
          uniqueLangRecs.push(rec);
          if (uniqueLangRecs.length === 5) break;
        }
      }
      topRecommendations = uniqueLangRecs;
    } else {
      topRecommendations = scoredRecommendations.slice(0, 5);
    }
    
    const detailedRecommendations = await Promise.all(
      topRecommendations.map(async (rec) => {
        try {
          const detailedMovie = await axios.get(
            `https://api.themoviedb.org/3/movie/${rec.id}?api_key=${TMDB_API_KEY}&append_to_response=credits`,
            axiosConfig
          );
          return {
            ...detailedMovie.data,
            totalScore: rec.totalScore,
            strategyUsed: rec.strategyName,
            strategyPriority: rec.strategyPriority,
            source: rec.source,
            redditData: rec.redditData || null,
            genreMatchDetails: rec.genreMatchDetails
          };
        } catch (error) {
          console.log(`Failed to fetch details for movie ${rec.id}:`, error.message);
          return null;
        }
      })
    );

    const validRecommendations = detailedRecommendations.filter(rec => rec !== null);

    console.log(`Final recommendations: ${validRecommendations.length}`);

    return NextResponse.json({
      allRecommendations: validRecommendations,
      movieAnalysis,
      redditFallbackUsed: redditError ? true : false,
      redditError
    });

  } catch (error) {
    console.error("API Error:", {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data,
    });
    return NextResponse.json(
      { error: `Failed to fetch recommendations: ${error.message}` },
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

  const animeKeywords = ['anime', 'manga', 'japanese animation'];
  const allKeywordNames = allKeywords.map(k => k.name.toLowerCase());
  const allGenreNames = allGenres.map(g => g.name.toLowerCase());
  
  analysis.isAnimated = allGenreNames.some(g => g.includes('animation'));
  
  analysis.isAnime = (analysis.isAnimated && 
                     inputMovies.some(m => m.original_language === 'ja')) ||
                    allKeywordNames.some(k => animeKeywords.some(ak => k.includes(ak)));
  
  if (!analysis.isAnimated && allKeywordNames.some(k => animeKeywords.some(ak => k.includes(ak)))) {
    analysis.isAnime = true;
    analysis.isAnimated = true;
  }

  // Improved franchise detection
  const stopwords = ['the', 'of', 'and', 'in', 'to', 'a', 'is', 'for', 'on', 'with', 'by', 'at'];
  
  async function detectFranchiseWithTMDB() {
    const collections = inputMovies.map(m => m.belongs_to_collection).filter(c => c);
    const collectionCounts = {};
    
    collections.forEach(collection => {
      if (collection) {
        collectionCounts[collection.id] = (collectionCounts[collection.id] || 0) + 1;
      }
    });

    const mostCommonCollection = Object.entries(collectionCounts)
      .sort(([,a], [,b]) => b - a)
      .find(([, count]) => count >= 2);

    if (mostCommonCollection) {
      const collectionId = mostCommonCollection[0];
      const collection = collections.find(c => c.id == collectionId);
      console.log(`Found franchise: ${collection.name} (ID: ${collectionId}) with ${mostCommonCollection[1]} movies`);
      return {
        franchisePattern: collection.name.replace(/\s*(Collection|Series)$/i, '').trim(),
        franchiseKeywords: collection.name.split(/\s+/).filter(w => !stopwords.includes(w.toLowerCase()) && w.length > 2)
      };
    }

    // Fallback: Check title words against TMDB collections
    const allWords = inputMovies.flatMap(m => 
      m.title.toLowerCase().split(/\s+|[^\w\s]/).filter(word => 
        word.length > 3 && !stopwords.includes(word)
      )
    );
    
    const wordCounts = {};
    allWords.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
    
    const potentialFranchiseTerms = Object.entries(wordCounts)
      .filter(([word, count]) => count >= 2)
      .map(([word]) => word);
    
    for (const term of potentialFranchiseTerms) {
      try {
        const collectionSearch = await axios.get(
          `https://api.themoviedb.org/3/search/collection?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(term)}`,
          axiosConfig
        );
        
        const matchingCollections = collectionSearch.data.results.filter(c => 
          c.name.toLowerCase().includes(term.toLowerCase())
        );
        
        for (const collection of matchingCollections) {
          const collectionDetails = await axios.get(
            `https://api.themoviedb.org/3/collection/${collection.id}?api_key=${TMDB_API_KEY}`,
            axiosConfig
          );
          
          const collectionMovies = collectionDetails.data.parts || [];
          const matchingInputMovies = inputMovies.filter(m => 
            collectionMovies.some(cm => cm.id === m.id)
          );
          
          if (matchingInputMovies.length >= 2) {
            console.log(`Found franchise via search: ${collection.name} with ${matchingInputMovies.length} matching movies`);
            return {
              franchisePattern: collection.name.replace(/\s*(Collection|Series)$/i, '').trim(),
              franchiseKeywords: collection.name.split(/\s+/).filter(w => !stopwords.includes(w.toLowerCase()) && w.length > 2)
            };
          }
        }
      } catch (error) {
        console.log(`Failed to search TMDB for collection term "${term}":`, error.message);
      }
    }
    
    return { franchisePattern: null, franchiseKeywords: [] };
  }

  const franchiseResult = detectFranchiseWithTMDB().catch(error => {
    console.error("Franchise detection failed:", error.message);
    return { franchisePattern: null, franchiseKeywords: [] };
  });
  
  return franchiseResult.then(({ franchisePattern, franchiseKeywords }) => {
    analysis.franchisePattern = franchisePattern;
    analysis.franchiseKeywords = franchiseKeywords;

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
  });
}

async function getEnhancedStrategiesWithTMDB(inputMovies, analysis, TMDB_API_KEY, axiosConfig, minYear, maxYear, allowedLanguages, otherLanguages) {
  const genres = inputMovies.map(m => m.genres || []);
  const directors = inputMovies.map(m => 
    m.credits.crew?.filter(c => c.job === 'Director') || []
  );
  const studios = inputMovies.map(m => m.production_companies || []);
  const keywords = inputMovies.map(m => m.keywords || []);

  const strategies = [];

  if (analysis.commonLanguage && !otherLanguages) {
    strategies.push({
      name: `${analysis.commonLanguage.toUpperCase()} Language Films`,
      priority: 30,
      getParams: (allowedLanguages, otherLanguages) => {
        const params = {
          sort_by: 'vote_average.desc',
          'vote_count.gte': 100
        };
        if (!otherLanguages && allowedLanguages.length > 0) {
          params.with_original_language = allowedLanguages.join('|');
        }
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
      getParams: (allowedLanguages, otherLanguages) => {
        const params = {
          with_genres: primaryGenre.id,
          sort_by: 'vote_average.desc',
          'vote_count.gte': analysis.qualityIndicators.qualityTier === 'premium' ? 1000 : 500
        };
        if (!otherLanguages && allowedLanguages.length > 0) {
          params.with_original_language = allowedLanguages.join('|');
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
        getParams: (allowedLanguages, otherLanguages) => {
          const recurringGenres = analysis.genreAnalysis.dominantGenres
            .filter(g => g.count > 1)
            .slice(0, 3);
          
          const params = {
            with_genres: recurringGenres.map(g => g.id).join(','),
            sort_by: 'vote_average.desc',
            'vote_count.gte': 300
          };
          if (!otherLanguages && allowedLanguages.length > 0) {
            params.with_original_language = allowedLanguages.join('|');
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
      customSearch: async (apiKey, config, excludeIds, minYear, maxYear, allowedLanguages, otherLanguages) => {
        const franchiseTerms = analysis.franchiseKeywords.length > 0 
          ? analysis.franchiseKeywords 
          : [analysis.franchisePattern];
        
        console.log("Searching for franchise terms:", franchiseTerms);
        
        const searchResults = [];
        
        for (const term of franchiseTerms.slice(0, 3)) {
          try {
            let searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(term)}&sort_by=vote_average.desc&primary_release_date.gte=${minYear}-01-01&primary_release_date.lte=${maxYear}-12-31`;
            if (!otherLanguages && allowedLanguages.length > 0) {
              searchUrl += `&with_original_language=${allowedLanguages.join('|')}`;
            }
            if (analysis.genreAnalysis.primaryGenre) {
              searchUrl += `&with_genres=${analysis.genreAnalysis.primaryGenre.id}`;
            }
            
            const searchResponse = await axios.get(searchUrl, config);
            
            let results = searchResponse.data.results
              .filter(movie => {
                if (excludeIds.includes(movie.id.toString())) return false;
                if (movie.vote_count < 50) return false;
                if (!movie.title.toLowerCase().includes(term.toLowerCase())) return false;
                if (analysis.isAnimated === false && movie.genre_ids?.includes(16)) return false;
                return true;
              });

            searchResults.push(...results.slice(0, 10));
            console.log(`Found ${results.length} movies for term "${term}" between ${minYear} and ${maxYear}`);
          } catch (error) {
            console.log(`Franchise search failed for term "${term}":`, error.message);
          }
        }
        
        const uniqueResults = searchResults.filter((movie, index, self) => 
          index === self.findIndex(m => m.id === movie.id)
        );
        
        return uniqueResults
          .sort((a, b) => b.vote_average - a.vote_average)
          .slice(0, 10);
      }
    });
  }

  if (analysis.thematicAnalysis.commonKeywords.some(k => 
    ['comic', 'superhero', 'marvel', 'dc', 'based on comic'].includes(k.name.toLowerCase())
  )) {
    strategies.push({
      name: "Superhero/Comic Book Movies",
      priority: 26,
      customSearch: async (apiKey, config, excludeIds, minYear, maxYear, allowedLanguages, otherLanguages) => {
        try {
          const superheroKeywords = ['9715', '180547', '849'];
          const marvelCompanies = ['420', '7505'];
          const dcCompanies = ['9993', '128064'];
          
          const searches = [];
          
          for (const keywordId of superheroKeywords) {
            let url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_keywords=${keywordId}&sort_by=release_date.desc&primary_release_date.gte=${minYear}-01-01&primary_release_date.lte=${maxYear}-12-31&vote_count.gte=50`;
            if (!otherLanguages && allowedLanguages.length > 0) {
              url += `&with_original_language=${allowedLanguages.join('|')}`;
            }
            searches.push(axios.get(url, config));
          }
          
          const allCompanies = [...marvelCompanies, ...dcCompanies];
          for (const companyId of allCompanies) {
            let url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_companies=${companyId}&sort_by=release_date.desc&primary_release_date.gte=${minYear}-01-01&primary_release_date.lte=${maxYear}-12-31&vote_count.gte=50`;
            if (!otherLanguages && allowedLanguages.length > 0) {
              url += `&with_original_language=${allowedLanguages.join('|')}`;
            }
            searches.push(axios.get(url, config));
          }
          
          const results = await Promise.allSettled(searches);
          const allSuperheroMovies = [];
          
          results.forEach(result => {
            if (result.status === 'fulfilled') {
              allSuperheroMovies.push(...result.value.data.results);
            }
          });
          
          const uniqueMovies = allSuperheroMovies
            .filter(movie => !excludeIds.includes(movie.id.toString()))
            .filter((movie, index, self) => index === self.findIndex(m => m.id === movie.id))
            .sort((a, b) => new Date(b.release_date) - new Date(a.release_date))
            .slice(0, 8);
          
          console.log(`Found ${uniqueMovies.length} superhero movies between ${minYear} and ${maxYear}`);
          return uniqueMovies;
        } catch (error) {
          console.log(`Superhero search failed:`, error.message);
          return [];
        }
      }
    });
  }

  if (analysis.thematicAnalysis.commonKeywords.length > 0) {
    const topKeyword = analysis.thematicAnalysis.commonKeywords[0];
    
    strategies.push({
      name: `Thematic Match: ${topKeyword.name}`,
      priority: 16,
      customSearch: async (apiKey, config, excludeIds, minYear, maxYear, allowedLanguages, otherLanguages) => {
        try {
          const keywordSearch = await axios.get(
            `https://api.themoviedb.org/3/search/keyword?api_key=${apiKey}&query=${encodeURIComponent(topKeyword.name)}`,
            config
          );
          
          if (keywordSearch.data.results.length > 0) {
            const keywordId = keywordSearch.data.results[0].id;
            
            let moviesUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_keywords=${keywordId}&sort_by=vote_average.desc&vote_count.gte=100&primary_release_date.gte=${minYear}-01-01&primary_release_date.lte=${maxYear}-12-31`;
            if (!otherLanguages && allowedLanguages.length > 0) {
              moviesUrl += `&with_original_language=${allowedLanguages.join('|')}`;
            }
            if (analysis.genreAnalysis.primaryGenre) {
              moviesUrl += `&with_genres=${analysis.genreAnalysis.primaryGenre.id}`;
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
      customSearch: async (apiKey, config, excludeIds, minYear, maxYear, allowedLanguages, otherLanguages) => {
        const searches = [
          `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_original_language=ja&with_genres=16&sort_by=vote_average.desc&vote_count.gte=50&primary_release_date.gte=${minYear}-01-01&primary_release_date.lte=${maxYear}-12-31`,
          `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_keywords=210024&sort_by=popularity.desc&primary_release_date.gte=${minYear}-01-01&primary_release_date.lte=${maxYear}-12-31`,
          `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_companies=10342,2251&sort_by=vote_average.desc&primary_release_date.gte=${minYear}-01-01&primary_release_date.lte=${maxYear}-12-31`
        ].map(url => axios.get(url, config));
        
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
      getParams: (allowedLanguages, otherLanguages) => {
        const params = {
          with_genres: '16',
          sort_by: 'vote_average.desc',
          'vote_count.gte': 500
        };
        if (!otherLanguages && allowedLanguages.length > 0) {
          params.with_original_language = allowedLanguages.join('|');
        }
        return params;
      }
    });
  }

  const commonDirector = findMostCommonPerson(directors);
  console.log("Directors found in input movies:", directors.flat().map(d => ({ name: d.name, id: d.id })));
  console.log("Most common director:", commonDirector);

  if (commonDirector) {
    const directorInfo = directors.flat().find(d => d.name === commonDirector);
    const directorId = directorInfo?.id;
    
    console.log(`Adding strategy for director: ${commonDirector} (ID: ${directorId})`);
    
    if (directorId) {
      strategies.push({
        name: `Same Director: ${commonDirector}`,
        priority: 35,
        customSearch: async (apiKey, config, excludeIds, minYear, maxYear, allowedLanguages, otherLanguages) => {
          try {
            console.log(`Searching for movies by director ${commonDirector} (${directorId}) between ${minYear} and ${maxYear}`);
            
            let directorUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_crew=${directorId}&sort_by=release_date.desc&primary_release_date.gte=${minYear}-01-01&primary_release_date.lte=${maxYear}-12-31`;
            
            if (!otherLanguages && allowedLanguages.length > 0) {
              directorUrl += `&with_original_language=${allowedLanguages.join('|')}`;
            }
            if (analysis.genreAnalysis.primaryGenre) {
              directorUrl += `&with_genres=${analysis.genreAnalysis.primaryGenre.id}`;
            }
            if (analysis.isAnimated === false) {
              directorUrl += `&without_genres=16`;
            }
            
            console.log("Director search URL:", directorUrl);
            const directorResponse = await axios.get(directorUrl, config);
            
            let directorMovies = directorResponse.data.results
              .filter(movie => !excludeIds.includes(movie.id.toString()));
            
            console.log(`Found ${directorMovies.length} movies with crew member ${commonDirector} using discovery API`);
            
            const verifiedMovies = [];
            for (const movie of directorMovies) {
              try {
                const creditsResponse = await axios.get(
                  `https://api.themoviedb.org/3/movie/${movie.id}/credits?api_key=${apiKey}`,
                  config
                );
                const isDirectedBy = creditsResponse.data.crew.some(
                  crew => crew.id === directorId && crew.job === 'Director'
                );
                if (isDirectedBy) {
                  console.log(`Verified ${movie.title} (ID: ${movie.id}) is directed by ${commonDirector}`);
                  verifiedMovies.push(movie);
                } else {
                  console.log(`Excluded ${movie.title} (ID: ${movie.id}) - not directed by ${commonDirector}`);
                }
              } catch (error) {
                console.log(`Failed to fetch credits for ${movie.title} (ID: ${movie.id}):`, error.message);
              }
            }
            
            if (verifiedMovies.length === 0) {
              console.log(`No verified director movies found, trying person credits for ${commonDirector}`);
              
              const personUrl = `https://api.themoviedb.org/3/person/${directorId}/movie_credits?api_key=${apiKey}`;
              const personResponse = await axios.get(personUrl, config);
              
              verifiedMovies.push(...personResponse.data.crew
                .filter(movie => {
                  const isDirector = movie.job === 'Director';
                  const hasReleaseDate = movie.release_date;
                  const isInYearRange = hasReleaseDate && 
                    new Date(movie.release_date).getFullYear() >= minYear && 
                    new Date(movie.release_date).getFullYear() <= maxYear;
                  const notExcluded = !excludeIds.includes(movie.id.toString());
                  
                  console.log(`Movie: ${movie.title} - Director: ${isDirector}, Year: ${hasReleaseDate ? new Date(movie.release_date).getFullYear() : 'N/A'}, Include: ${isDirector && isInYearRange && notExcluded}`);
                  
                  return isDirector && isInYearRange && notExcluded;
                })
                .sort((a, b) => new Date(b.release_date) - new Date(a.release_date))
              );
              
              console.log(`Found ${verifiedMovies.length} movies from ${commonDirector}'s filmography`);
            }
            
            return verifiedMovies.slice(0, 10);
          } catch (error) {
            console.log(`Director search failed for ${commonDirector}:`, error.message);
            return [];
          }
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
        getParams: (allowedLanguages, otherLanguages) => {
          const params = {
            with_companies: studioId,
            sort_by: 'vote_average.desc'
          };
          if (!otherLanguages && allowedLanguages.length > 0) {
            params.with_original_language = allowedLanguages.join('|');
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
  // FIRST: Remove duplicates by movie ID, keeping the one with highest strategy priority
  const deduplicatedRecommendations = [];
  const seenMovieIds = new Set();
  
  // Sort by strategy priority first to keep the best version of each movie
  const sortedRecommendations = allRecommendations.sort((a, b) => 
    (b.strategyPriority || 0) - (a.strategyPriority || 0)
  );
  
  for (const recommendation of sortedRecommendations) {
    if (!seenMovieIds.has(recommendation.id)) {
      seenMovieIds.add(recommendation.id);
      deduplicatedRecommendations.push(recommendation);
    }
  }
  
  console.log(`Deduplicated recommendations: ${allRecommendations.length} -> ${deduplicatedRecommendations.length}`);
  
  // Check if at least 2 input movies are superhero movies
  const isSuperheroInput = inputMovies.filter(movie => {
    const superheroKeywords = ['9715', '180547', '849']; // comic, superhero, based on comic
    const marvelCompanies = ['420', '7505']; // Marvel
    const dcCompanies = ['9993', '128064']; // DC
    const keywords = movie.keywords.map(k => k.id);
    const companies = movie.production_companies?.map(c => c.id) || [];
    return superheroKeywords.some(k => keywords.includes(k)) || 
           marvelCompanies.concat(dcCompanies).some(c => companies.includes(c));
  }).length >= 2;

  return deduplicatedRecommendations.map(candidate => {
    let totalScore = 0;
    let genreMatchDetails = {
      dominantGenreMatch: false,
      secondaryGenreMatches: 0,
      genreOverlapScore: 0,
      thematicBonus: 0
    };
    
    // Base scoring: vote average and capped popularity
    totalScore += (candidate.vote_average || 0) * 4;
    totalScore += Math.min(Math.log10(candidate.popularity || 1) * 10, 50); // Cap popularity influence
    
    // Strategy priority
    totalScore += (candidate.strategyPriority || 0) * 8;
    
    // Reddit data scoring
    if (candidate.redditData) {
      totalScore += (candidate.redditData.redditScore || 0) * 0.05;
      totalScore += (candidate.redditData.mentions || 0) * 1;
      totalScore += (candidate.redditData.confidence || 0) * 1;
      totalScore += candidate.redditData.subreddits?.length || 0 * 2;
    }
    
    // Director matching
    const inputDirectors = inputMovies.flatMap(m => 
      m.credits?.crew?.filter(c => c.job === 'Director').map(d => d.name) || []
    );
    
    if (candidate.strategyName && candidate.strategyName.startsWith('Same Director')) {
      console.log(`Applying director bonus to: ${candidate.title}`);
      totalScore += 500;
      
      const isSuperhero = candidate.genre_ids?.some(id => [28, 878].includes(id)) ||
                         candidate.overview?.toLowerCase().includes('superhero') ||
                         candidate.overview?.toLowerCase().includes('superman') ||
                         candidate.overview?.toLowerCase().includes('comic');
      
      if (isSuperheroInput && isSuperhero) {
        console.log(`Applying superhero theme bonus to: ${candidate.title}`);
        totalScore += 200;
      }
    }
    
    // Superhero strategy bonus
    if (candidate.strategyName === 'Superhero/Comic Book Movies') {
      console.log(`Applying superhero strategy bonus to: ${candidate.title}`);
      totalScore += 200;
      
      if (candidate.release_date) {
        const releaseYear = new Date(candidate.release_date).getFullYear();
        if (releaseYear >= 2024) {
          totalScore += 100;
        }
      }
    }
    
    // Superhero theme indicators
    const superheroIndicators = [
      'superman', 'batman', 'superhero', 'comic book', 'marvel', 'dc comics',
      'hero', 'powers', 'cape', 'villain', 'justice', 'save the world'
    ];
    
    if (candidate.overview) {
      const overviewLower = candidate.overview.toLowerCase();
      const superheroMatches = superheroIndicators.filter(indicator => 
        overviewLower.includes(indicator)
      ).length;
      
      if (superheroMatches > 0) {
        const themeBonus = Math.min(superheroMatches * 50, 100);
        if (isSuperheroInput) {
          totalScore += themeBonus;
          genreMatchDetails.thematicBonus += themeBonus;
          console.log(`Applied ${superheroMatches} superhero theme indicators to ${candidate.title}: +${themeBonus}`);
        }
      }
    }
    
    // Genre matching
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
    
    // Enhanced thematic matching
    const racingKeywords = ['racing', 'formula one', 'car', 'racecar'];
    const isRacingInput = analysis.thematicAnalysis.commonKeywords.some(k => 
      racingKeywords.includes(k.name.toLowerCase())
    );
    
    if (analysis.thematicAnalysis.commonKeywords.length > 0 && candidate.overview) {
      const overviewLower = candidate.overview.toLowerCase();
      analysis.thematicAnalysis.commonKeywords.forEach(keyword => {
        if (overviewLower.includes(keyword.name.toLowerCase())) {
          const thematicBonus = 100 * keyword.count; // Increased from 20
          totalScore += thematicBonus;
          genreMatchDetails.thematicBonus += thematicBonus;
          console.log(`Applied thematic bonus for "${keyword.name}" to ${candidate.title}: +${thematicBonus}`);
        }
      });
      
      // Penalize non-racing movies if input is racing-themed
      const isRacingThemed = racingKeywords.some(k => overviewLower.includes(k)) ||
                            analysis.thematicAnalysis.commonKeywords.some(k => 
                              overviewLower.includes(k.name.toLowerCase())
                            );
      
      if (isRacingInput && !isRacingThemed) {
        totalScore -= 300; // Strong penalty for non-racing movies
        console.log(`Penalizing ${candidate.title} for lacking racing theme: -300`);
      }
    }
    
    // Franchise matching
    if (analysis.franchisePattern) {
      const titleLower = (candidate.title || '').toLowerCase();
      const inputTitlesWithFranchise = inputMovies.filter(m => 
        m.title.toLowerCase().includes(analysis.franchisePattern.toLowerCase())
      ).length;
      
      if (titleLower.includes(analysis.franchisePattern.toLowerCase())) {
        let franchiseBonus = inputTitlesWithFranchise >= 3 ? 1200 : inputTitlesWithFranchise >= 2 ? 700 : 300; // Increased bonuses
        if (genreMatchDetails.dominantGenreMatch) {
          franchiseBonus += 100;
        }
        totalScore += franchiseBonus;
        console.log(`Applying franchise bonus to ${candidate.title}: +${franchiseBonus}`);
      }
      
      analysis.franchiseKeywords?.forEach(keyword => {
        if (titleLower.includes(keyword.toLowerCase())) {
          let keywordBonus = inputTitlesWithFranchise >= 3 ? 500 : inputTitlesWithFranchise >= 2 ? 300 : 100;
          if (genreMatchDetails.dominantGenreMatch) {
            keywordBonus += 50;
          }
          totalScore += keywordBonus;
          console.log(`Applying franchise keyword bonus to ${candidate.title} for "${keyword}": +${keywordBonus}`);
        }
      });
    }
    
    // Quality alignment
    const qualityAlignment = calculateQualityAlignment(candidate, analysis.qualityIndicators);
    totalScore += qualityAlignment * 15;
    
    if (analysis.qualityIndicators.qualityTier === 'premium' && candidate.vote_average >= 7.5) {
      totalScore += 50;
    }
    
    // Rating alignment
    const ratingDiff = Math.abs((candidate.vote_average || 0) - analysis.avgRating);
    if (ratingDiff <= 0.5) totalScore += 25;
    else if (ratingDiff <= 1) totalScore += 15;
    else if (ratingDiff <= 1.5) totalScore += 8;
    
    // Language matching
    if (analysis.commonLanguage && candidate.original_language === analysis.commonLanguage) {
      let langBonus = 50;
      if (analysis.commonLanguage !== 'en') {
        langBonus += 50;
      }
      totalScore += langBonus;
    }
    
    // Animation/anime checks
    if (analysis.isAnime && candidate.original_language === 'ja') {
      totalScore += 100;
    }
    if (analysis.isAnimated && candidate.genre_ids?.includes(16)) {
      totalScore += 80;
    }
    if (analysis.isAnimated === false && !candidate.genre_ids?.includes(16)) {
      totalScore += 100;
    }
    
    // Recency bonus (skipped for franchise matches)
    if (!candidate.title.toLowerCase().includes(analysis.franchisePattern?.toLowerCase() || '')) {
      if (candidate.release_date) {
        const releaseYear = new Date(candidate.release_date).getFullYear();
        const recencyMultiplier = analysis.qualityIndicators.qualityTier === 'premium' ? 1.5 : 1.0;
        
        if (releaseYear >= 2020) totalScore += 15 * recencyMultiplier;
        else if (releaseYear >= 2015) totalScore += 10 * recencyMultiplier;
        else if (releaseYear >= 2010) totalScore += 5 * recencyMultiplier;
      }
    }
    
    // Additional reliability scores
    const popularityScore = Math.log10((candidate.popularity || 1)) * 3;
    const qualityScore = (candidate.vote_average || 0) * 8;
    const voteCountReliability = candidate.vote_count >= 500 ? 20 : 
                                candidate.vote_count >= 100 ? 10 : 
                                candidate.vote_count >= 50 ? 5 : 0;
    
    totalScore += popularityScore + qualityScore + voteCountReliability;
    
    // Genre overlap and diversity
    const inputGenreIds = inputMovies.flatMap(m => m.genres?.map(g => g.id) || []);
    const candidateGenreIds = candidate.genre_ids || [];
    const genreOverlap = candidateGenreIds.filter(g => inputGenreIds.includes(g)).length;
    const genreDiversity = candidateGenreIds.length - genreOverlap;
    
    totalScore += genreOverlap * 12;
    totalScore += Math.min(genreDiversity * 4, 12);
    
    // Vote count bonus
    if (candidate.vote_count >= 5000) totalScore += 25;
    else if (candidate.vote_count >= 1000) totalScore += 15;
    else if (candidate.vote_count >= 500) totalScore += 10;
    
    // Penalize non-action/adventure/scifi movies unless specific strategy
    if (candidate.genre_ids && !candidate.genre_ids.some(id => [28, 878, 12].includes(id))) {
      if (!candidate.strategyName?.startsWith('Same Director') && 
          candidate.strategyName !== 'Superhero/Comic Book Movies') {
        totalScore -= 100;
      }
    }
    
    console.log(`${candidate.title} - Strategy: ${candidate.strategyName} - Score: ${Math.round(totalScore)}`);
    
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
    if (genreName === 'adventure') subreddits.push('movies');
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

async function getEnhancedFallback(inputMovies, analysis, apiKey, axiosConfig, resolvedIds, minYear, maxYear, allowedLanguages, otherLanguages) {
  try {
    if (analysis.franchisePattern) {
      console.log("Trying franchise fallback for:", analysis.franchisePattern);
      let searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(analysis.franchisePattern)}&sort_by=vote_average.desc&primary_release_date.gte=${minYear}-01-01&primary_release_date.lte=${maxYear}-12-31`;
      if (!otherLanguages && allowedLanguages.length > 0) {
        searchUrl += `&with_original_language=${allowedLanguages.join('|')}`;
      }
      if (analysis.genreAnalysis.primaryGenre) {
        searchUrl += `&with_genres=${analysis.genreAnalysis.primaryGenre.id}`;
      }
      if (analysis.isAnimated === false) {
        searchUrl += `&without_genres=16`;
      }
      const searchResponse = await axios.get(searchUrl, axiosConfig);
      const candidate = searchResponse.data.results.find(movie => 
        !resolvedIds.includes(movie.id.toString()) && 
        movie.vote_count > 100 &&
        movie.title.toLowerCase().includes(analysis.franchisePattern.toLowerCase()) &&
        movie.vote_average >= (analysis.avgRating - 0.5)
      );
      if (candidate) {
        console.log("Found franchise fallback:", candidate.title);
        return candidate;
      }
    }

    if (analysis.isAnime) {
      console.log("Trying anime-specific fallback");
      
      let animeQuery = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_original_language=ja&with_genres=16&sort_by=vote_average.desc&vote_count.gte=50&primary_release_date.gte=${minYear}-01-01&primary_release_date.lte=${maxYear}-12-31`;
      
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

    if (analysis.commonLanguage || allowedLanguages.length > 0) {
      console.log("Trying language-based fallback");
      
      let langQuery = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=vote_average.desc&vote_count.gte=100&primary_release_date.gte=${minYear}-01-01&primary_release_date.lte=${maxYear}-12-31`;
      
      if (!otherLanguages && allowedLanguages.length > 0) {
        langQuery += `&with_original_language=${allowedLanguages.join('|')}`;
      }
      
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
      
      let genreQuery = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${analysis.genreAnalysis.primaryGenre.id}&sort_by=vote_average.desc&vote_count.gte=${voteCountMin}&primary_release_date.gte=${minYear}-01-01&primary_release_date.lte=${maxYear}-12-31`;
      if (!otherLanguages && allowedLanguages.length > 0) {
        genreQuery += `&with_original_language=${allowedLanguages.join('|')}`;
      }
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
      let animQuery = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=16&sort_by=vote_average.desc&vote_count.gte=100&primary_release_date.gte=${minYear}-01-01&primary_release_date.lte=${maxYear}-12-31`;
      
      if (!otherLanguages && allowedLanguages.length > 0) {
        animQuery += `&with_original_language=${allowedLanguages.join('|')}`;
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
          .filter(movie => movie.vote_count > 100)
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