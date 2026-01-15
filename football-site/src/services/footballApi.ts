// 🚀 API сервис для получения футбольных данных
// Этот файл содержит функции для загрузки данных с сервера

// 📦 Кэш для оптимизации производительности
const CACHE = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 минут

// 🔧 Функции для работы с кэшем
const getCachedData = (key: string) => {
  const cached = CACHE.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`📦 Используем кэшированные данные для ${key}`);
    return cached.data;
  }
  return null;
};

const setCachedData = (key: string, data: any) => {
  CACHE.set(key, { data, timestamp: Date.now() });
  console.log(`💾 Данные для ${key} сохранены в кэш`);
};

// 📝 Интерфейсы (типы данных) - это как "чертежи" для наших данных
export interface Team {
  id: string;
  name: string;
  logo: string;
  league: string;
  country: string;
  stadium: string;
  coach: string;
  playersCount: number;
  titles: number;
  description: string;
  founded: number;
  position: number;
  played?: number;
  won?: number;
  drawn?: number;
  lost?: number;
  goalsFor?: number;
  goalsAgainst?: number;
  goalDifference?: number;
  points?: number;
  form?: string[];
}

export interface Player {
  id: string;
  name: string;
  photo: string;
  team: string;
  teamLogo: string;
  league: string;
  nationality: string;
  nationalityFlag: string;
  position: string;
  overall: number;
  rating: number;
  goals: number;
  assists: number;
  matches: number;
  description: string;
  age?: number;
  height?: string;
  weight?: string;
}

export interface League {
  id: string;
  name: string;
  country: string;
  logo: string;
  founded?: number;
  teamsCount?: number;
  playersCount?: number;
  description?: string;
  season?: string;
  teams?: Team[];
  matches?: any[];
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo: string;
  awayLogo: string;
  date: string;
  time: string;
  venue: string;
  status: string;
  league?: string;
  homeScore?: number;
  awayScore?: number;
}

// 🔧 Вспомогательные функции
const handleApiError = (error: any) => {
  console.error('❌ API Error:', error);
};

// 📊 Загрузка данных из Python API
const loadPythonData = async (leagueId?: string) => {
  try {
    // Определяем endpoint в зависимости от лиги
    let endpoint = 'http://localhost:8000/standings'; // Premier League по умолчанию
    if (leagueId === 'la-liga') {
      endpoint = 'http://localhost:8000/standings/la-liga';
    } else if (leagueId === 'bundesliga') {
      endpoint = 'http://localhost:8000/standings/bundesliga';
    } else if (leagueId === 'serie-a') {
      endpoint = 'http://localhost:8000/standings/serie-a';
    } else if (leagueId === 'ligue-1') {
      endpoint = 'http://localhost:8000/standings/ligue-1';
    }
    
    // Получаем данные с backend API
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('🔍 Backend data:', data);
    console.log('🔍 First team data:', data.table?.[0]);
    console.log('🔍 First team keys:', data.table?.[0] ? Object.keys(data.table[0]) : 'No data');
    
    // Определяем параметры лиги
    let leagueName = 'Premier League';
    let country = 'Англия';
    let leagueIdFinal = 'premier-league';
    let logo = 'https://upload.wikimedia.org/wikipedia/en/f/f2/Premier_League_Logo.svg';
    
    if (leagueId === 'la-liga') {
      leagueName = 'La Liga';
      country = 'Испания';
      leagueIdFinal = 'la-liga';
      logo = 'https://upload.wikimedia.org/wikipedia/en/9/9d/LaLiga_logo.svg';
    } else if (leagueId === 'bundesliga') {
      leagueName = 'Bundesliga';
      country = 'Германия';
      leagueIdFinal = 'bundesliga';
      logo = 'https://upload.wikimedia.org/wikipedia/en/5/5a/Bundesliga_logo.svg';
    } else if (leagueId === 'serie-a') {
      leagueName = 'Serie A';
      country = 'Италия';
      leagueIdFinal = 'serie-a';
      logo = 'https://upload.wikimedia.org/wikipedia/en/8/8b/Serie_A_logo.svg';
    } else if (leagueId === 'ligue-1') {
      leagueName = 'Ligue 1';
      country = 'Франция';
      leagueIdFinal = 'ligue-1';
      logo = 'https://upload.wikimedia.org/wikipedia/en/1/1f/Ligue_1_Uber_Eats_logo.svg';
    }
    
    // Преобразуем данные в формат, ожидаемый фронтендом
    return {
      leagues: [{
        id: leagueIdFinal,
        name: leagueName,
        country: country,
        logo: logo,
        season: data.season,
        teamsCount: data.table.length,
        playersCount: 0
      }],
      teams: data.table.map((team: any, index: number) => ({
        id: team.name.toLowerCase().replace(/\s+/g, '-'),
        name: team.name,
        logo: team.crest,
        league: leagueName,
        country: country,
        stadium: 'Unknown',
        coach: 'Unknown',
        playersCount: 25,
        titles: 0,
        description: `${team.name} - команда из ${leagueName}`,
        founded: 1900,
        position: team.position,
        played: team.played,
        won: team.won,
        drawn: team.drawn,
        lost: team.lost,
        goalsFor: team.goalsFor,
        goalsAgainst: team.goalsAgainst,
        goalDifference: team.goalDifference,
        points: team.points,
        form: ['W', 'W', 'D', 'W', 'W'] // Заглушка
      })),
      players: [],
      matches: []
    };
  } catch (error) {
    console.error('❌ Ошибка загрузки данных из Python API:', error);
    return null;
  }
};

// ⚽ Получение лиг
export const getLeagues = async (): Promise<League[]> => {
  try {
    console.log('🔄 Загружаем данные лиг...');
    const pythonData = await loadPythonData();
    
    if (pythonData && pythonData.leagues && pythonData.leagues.length > 0) {
      console.log('✅ Получено лиг из API парсера:', pythonData.leagues.length);
      return pythonData.leagues;
    }
    
    console.log('⚠️ API данные недоступны, возвращаем пустой массив');
    return [];
  } catch (error) {
    handleApiError(error);
    return [];
  }
};

// ⚽ Получение команд лиги
export const getTeamsByLeague = async (leagueId: string): Promise<Team[]> => {
  try {
    console.log(`🔄 Загружаем команды лиги: ${leagueId}`);
    
    const pythonData = await loadPythonData(leagueId);
    if (pythonData && pythonData.teams) {
      console.log(`✅ Найдено команд для лиги ${leagueId}: ${pythonData.teams.length}`);
      return pythonData.teams;
    }
    
    return [];
  } catch (error) {
    handleApiError(error);
    return [];
  }
};

// ⚽ Получение всех игроков из всех топ-5 лиг (быстрая версия)
export const getAllPlayers = async (): Promise<Player[]> => {
  try {
    console.log('🔄 Загружаем всех игроков из всех топ-5 лиг...');
    
    // Проверяем кэш
    const cacheKey = 'all_players';
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    // Сначала пробуем быстрый эндпоинт
    try {
      const quickResponse = await fetch('http://localhost:8000/players/quick');
      if (quickResponse.ok) {
        const quickData = await quickResponse.json();
        console.log('🚀 Быстрая загрузка:', quickData.players?.length || 0, 'игроков');
        
        if (quickData.players && quickData.players.length > 0) {
          const players = quickData.players.map((player: any) => ({
            id: player.id.toString(),
            name: player.name,
            position: player.position || 'Unknown',
            nationality: player.nationality || 'Unknown',
            team: player.team,
            age: player.age || 25,
            goals: 0,
            assists: 0,
            matches: 0,
            rating: "7.5",
            photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&size=150&background=cccccc&color=666666`,
            shirtNumber: player.shirtNumber,
            league: player.teamId ? getLeagueNameByTeamId(player.teamId) : 'Unknown',
            overall: 75
          }));
          
          setCachedData(cacheKey, players);
          return players;
        }
      }
    } catch (quickError) {
      console.log('⚠️ Быстрая загрузка недоступна, используем обычную');
    }
    
    // Если быстрая загрузка не сработала, используем обычную
    const response = await fetch('http://localhost:8000/players/all');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('🔍 Players data:', data);
    console.log('🔍 Total players:', data.players?.length || 0);
    
    // Преобразуем реальные данные в формат, ожидаемый фронтендом
    const players = data.players?.map((player: any) => ({
      id: player.id.toString(),
      name: player.name,
      position: player.position || 'Unknown',
      nationality: player.nationality || 'Unknown',
      team: player.team,
      age: player.age || 25,
      goals: 0,
      assists: 0,
      matches: 0,
      rating: "7.5",
      photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&size=150&background=cccccc&color=666666`,
      shirtNumber: player.shirtNumber,
      league: player.teamId ? getLeagueNameByTeamId(player.teamId) : 'Unknown',
      overall: 75
    })) || [];
    
    console.log(`✅ Загружено игроков из всех лиг: ${players.length}`);
    
    // Сохраняем в кэш
    setCachedData(cacheKey, players);
    
    return players;
  } catch (error) {
    handleApiError(error);
    return [];
  }
};

// ⚽ Получение игроков конкретной лиги
export const getPlayersByLeague = async (leagueId: string): Promise<Player[]> => {
  try {
    console.log(`🔄 Загружаем игроков лиги: ${leagueId}`);
    
    // Проверяем кэш
    const cacheKey = `players_league_${leagueId}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    const response = await fetch(`http://localhost:8000/players/league/${leagueId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`🔍 Players data for ${leagueId}:`, data);
    console.log(`🔍 Total players in ${leagueId}:`, data.players?.length || 0);
    
    // Преобразуем реальные данные в формат, ожидаемый фронтендом
    const players = data.players?.map((player: any) => ({
      id: player.id.toString(),
      name: player.name,
      position: player.position || 'Unknown',
      nationality: player.nationality || 'Unknown',
      team: player.team,
      age: player.age || 25,
      goals: 0, // Статистика не доступна в базовом API
      assists: 0, // Статистика не доступна в базовом API
      matches: 0, // Статистика не доступна в базовом API
      rating: "7.5", // Базовый рейтинг
      photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&size=150&background=cccccc&color=666666`,
      shirtNumber: player.shirtNumber,
      league: data.competition, // Используем название лиги из ответа
      overall: 75 // Базовый рейтинг
    })) || [];
    
    console.log(`✅ Загружено игроков из лиги ${leagueId}: ${players.length}`);
    
    // Сохраняем в кэш
    setCachedData(cacheKey, players);
    
    return players;
  } catch (error) {
    handleApiError(error);
    return [];
  }
};

// Функция для определения лиги по ID команды
const getLeagueNameByTeamId = (teamId: number): string => {
  // Маппинг ID команд на лиги (примерные значения)
  const teamLeagueMap: { [key: number]: string } = {
    // Premier League teams
    57: 'Premier League',   // Arsenal
    65: 'Premier League',   // Manchester City
    1044: 'Premier League', // AFC Bournemouth
    64: 'Premier League',   // Liverpool
    61: 'Premier League',   // Chelsea
    73: 'Premier League',   // Tottenham
    71: 'Premier League',   // Sunderland
    354: 'Premier League',  // Crystal Palace
    66: 'Premier League',   // Manchester United
    397: 'Premier League',  // Brighton
    58: 'Premier League',   // Aston Villa
    62: 'Premier League',   // Everton
    402: 'Premier League',  // Brentford
    67: 'Premier League',   // Newcastle
    63: 'Premier League',   // Fulham
    341: 'Premier League',  // Leeds
    328: 'Premier League',  // Burnley
    351: 'Premier League',  // Nottingham Forest
    563: 'Premier League',  // West Ham
    76: 'Premier League',   // Wolves
  };
  
  return teamLeagueMap[teamId] || 'Unknown';
};

// 🏆 Получение матчей всех лиг
export const getAllMatches = async (): Promise<Match[]> => {
  try {
    console.log('🔄 Загружаем матчи всех лиг...');
    
    const response = await fetch('http://localhost:8000/matches/all');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('🔍 Matches data:', data);
    console.log('🔍 Total matches:', data.matches?.length || 0);
    
    // Преобразуем данные матчей в формат, ожидаемый фронтендом
    const matches = data.matches?.map((match: any) => ({
      id: match.id.toString(),
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      homeTeamShort: match.homeTeam.shortName,
      awayTeamShort: match.awayTeam.shortName,
      homeTeamCrest: match.homeTeam.crest,
      awayTeamCrest: match.awayTeam.crest,
      date: match.utcDate,
      status: match.status,
      competition: match.competition.name,
      league: match.competition.code,
      score: match.score ? {
        home: match.score.fullTime?.home,
        away: match.score.fullTime?.away
      } : null,
      stage: match.stage
    })) || [];
    
    console.log(`✅ Загружено матчей: ${matches.length}`);
    return matches;
  } catch (error) {
    handleApiError(error);
    return [];
  }
};

// 🏆 Получение матчей по турам
export const getMatchesByRounds = async (league: string = 'all'): Promise<any> => {
  try {
    console.log(`🔄 Загружаем матчи по турам для лиги: ${league}`);
    
    const endpoint = league === 'all' 
      ? 'http://localhost:8000/matches/rounds/all'
      : `http://localhost:8000/matches/rounds/${league}`;
    
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('🔍 Rounds data:', data);
    
    // Преобразуем данные туров
    if (league === 'all') {
      const allRounds: { [key: string]: { [key: string]: any[] } } = {};
      Object.keys(data.rounds).forEach(leagueName => {
        allRounds[leagueName] = {};
        Object.keys(data.rounds[leagueName]).forEach(roundNumber => {
          allRounds[leagueName][roundNumber] = data.rounds[leagueName][roundNumber].map((match: any) => ({
            id: match.id.toString(),
            homeTeam: match.homeTeam.name,
            awayTeam: match.awayTeam.name,
            homeTeamShort: match.homeTeam.shortName,
            awayTeamShort: match.awayTeam.shortName,
            homeTeamCrest: match.homeTeam.crest,
            awayTeamCrest: match.awayTeam.crest,
            date: match.utcDate,
            status: match.status,
            competition: match.competition.name,
            league: match.competition.code,
            score: match.score ? {
              home: match.score.fullTime?.home,
              away: match.score.fullTime?.away
            } : null,
            stage: match.stage
          }));
        });
      });
      return allRounds;
    } else {
      const rounds: { [key: string]: any[] } = {};
      Object.keys(data.rounds).forEach(roundNumber => {
        rounds[roundNumber] = data.rounds[roundNumber].map((match: any) => ({
          id: match.id.toString(),
          homeTeam: match.homeTeam.name,
          awayTeam: match.awayTeam.name,
          homeTeamShort: match.homeTeam.shortName,
          awayTeamShort: match.awayTeam.shortName,
          homeTeamCrest: match.homeTeam.crest,
          awayTeamCrest: match.awayTeam.crest,
          date: match.utcDate,
          status: match.status,
          competition: match.competition.name,
          league: match.competition.code,
          score: match.score ? {
            home: match.score.fullTime?.home,
            away: match.score.fullTime?.away
          } : null,
          stage: match.stage
        }));
      });
      return rounds;
    }
  } catch (error) {
    handleApiError(error);
    return {};
  }
};

// ⚽ Получение игроков команды
export const getPlayersByTeam = async (teamId: string): Promise<Player[]> => {
  try {
    console.log(`🔄 Загружаем игроков команды: ${teamId}`);
    
    const pythonData = await loadPythonData();
    if (pythonData && pythonData.players) {
      const teamPlayers = pythonData.players.filter((player: Player) => player.team === teamId);
      return teamPlayers;
    }
    
    return [];
  } catch (error) {
    handleApiError(error);
    return [];
  }
};

// ⚽ Получение всех команд
export const getAllTeams = async (): Promise<Team[]> => {
  try {
    console.log('🔄 Загружаем все команды...');
    
    const pythonData = await loadPythonData();
    if (pythonData && pythonData.teams && pythonData.teams.length > 0) {
      console.log('✅ Получено команд из API:', pythonData.teams.length);
      return pythonData.teams;
    }
    
    console.log('⚠️ API данные недоступны, возвращаем пустой массив');
    return [];
  } catch (error) {
    console.error('❌ Ошибка в getAllTeams:', error);
    handleApiError(error);
    return [];
  }
};


// ⚽ Получение матчей лиги
export const getMatchesByLeague = async (leagueId: string): Promise<Match[]> => {
  try {
    console.log(`🔄 Загружаем матчи лиги: ${leagueId}`);
    
    const pythonData = await loadPythonData();
    if (pythonData && pythonData.matches) {
      const leagueMatches = pythonData.matches.filter((match: Match) => match.league === leagueId);
      return leagueMatches;
    }
    
    return [];
  } catch (error) {
    handleApiError(error);
    return [];
  }
};

// 🔍 Поиск
export const search = async (term: string) => {
  try {
    console.log(`🔍 Поиск: ${term}`);
    
    const pythonData = await loadPythonData();
    if (pythonData) {
      const results = {
        teams: pythonData.teams?.filter((team: Team) => 
          team.name.toLowerCase().includes(term.toLowerCase()) ||
          team.country.toLowerCase().includes(term.toLowerCase())
        ) || [],
        players: pythonData.players?.filter((player: Player) => 
          player.name.toLowerCase().includes(term.toLowerCase()) ||
          player.team.toLowerCase().includes(term.toLowerCase()) ||
          player.nationality.toLowerCase().includes(term.toLowerCase())
        ) || [],
        leagues: pythonData.leagues?.filter((league: League) => 
          league.name.toLowerCase().includes(term.toLowerCase()) ||
          league.country.toLowerCase().includes(term.toLowerCase())
        ) || []
      };
      
      return results;
    }
    
    return { teams: [], players: [], leagues: [] };
  } catch (error) {
    handleApiError(error);
    return { teams: [], players: [], leagues: [] };
  }
};