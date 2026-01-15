// 🎣 Кастомный хук для работы с футбольными данными
// Хуки - это функции, которые начинаются с "use" и используют другие хуки

import { useState, useEffect } from 'react';
import { 
  getLeagues, 
  getTeamsByLeague, 
  getPlayersByTeam, 
  getAllTeams, 
  getAllPlayers,
  getMatchesByLeague,
  League,
  Team,
  Player
} from '../services/footballApi';

// 🎯 Хук для загрузки лиг
export const useLeagues = () => {
  // 📊 Состояние для данных
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔄 Загрузка данных при монтировании компонента
  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 Загружаем лиги...');
        
        const data = await getLeagues();
        setLeagues(data);
        
        console.log('✅ Лиги загружены:', data.length);
      } catch (err) {
        console.error('❌ Ошибка загрузки лиг:', err);
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      } finally {
        setLoading(false);
      }
    };

    fetchLeagues();
  }, []); // Пустой массив = выполнить только один раз

  return { leagues, loading, error };
};

// ⚽ Хук для загрузки команд
export const useTeams = (leagueId?: string) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`🔄 Загружаем команды${leagueId ? ` для лиги ${leagueId}` : ''}...`);
        
        const data = leagueId 
          ? await getTeamsByLeague(leagueId)
          : await getAllTeams();
        
        setTeams(data);
        console.log('✅ Команды загружены:', data.length);
      } catch (err) {
        console.error('❌ Ошибка загрузки команд:', err);
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [leagueId]); // Перезагружаем при изменении leagueId

  return { teams, loading, error };
};

// 👤 Хук для загрузки игроков (оптимизированная версия)
export const usePlayers = (teamId?: string) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`🔄 Загружаем игроков${teamId ? ` для команды ${teamId}` : ''}...`);
        
        const data = teamId 
          ? await getPlayersByTeam(teamId)
          : await getAllPlayers();
        
        setPlayers(data);
        console.log('✅ Игроки загружены:', data.length);
      } catch (err) {
        console.error('❌ Ошибка загрузки игроков:', err);
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [teamId]);

  return { players, loading, error };
};

// 🚀 Оптимизированный хук для загрузки всех игроков с кэшированием
export const useAllPlayers = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllPlayers = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 Загружаем всех игроков...');
        
        const data = await getAllPlayers();
        setPlayers(data);
        console.log('✅ Все игроки загружены:', data.length);
      } catch (err) {
        console.error('❌ Ошибка загрузки всех игроков:', err);
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      } finally {
        setLoading(false);
      }
    };

    fetchAllPlayers();
  }, []); // Загружаем только один раз

  return { players, loading, error };
};

// 📅 Хук для загрузки матчей
export const useMatches = (leagueId?: string) => {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`🔄 Загружаем матчи${leagueId ? ` для лиги ${leagueId}` : ''}...`);
        
        const data = await getMatchesByLeague(leagueId || 'all');
        setMatches(data);
        console.log('✅ Матчи загружены:', data.length);
      } catch (err) {
        console.error('❌ Ошибка загрузки матчей:', err);
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [leagueId]);

  return { matches, loading, error };
};

// 🔍 Хук для поиска (комбинированный)
export const useSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔍 Функция поиска
  const search = async (term: string) => {
    if (!term.trim()) {
      setTeams([]);
      setPlayers([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log(`🔍 Ищем: "${term}"`);

      // Загружаем все данные
      const [teamsData, playersData] = await Promise.all([
        getAllTeams(),
        getAllPlayers()
      ]);

      // Фильтруем по поисковому запросу
      const filteredTeams = teamsData.filter(team =>
        team.name.toLowerCase().includes(term.toLowerCase()) ||
        team.league.toLowerCase().includes(term.toLowerCase()) ||
        team.country.toLowerCase().includes(term.toLowerCase())
      );

      const filteredPlayers = playersData.filter(player =>
        player.name.toLowerCase().includes(term.toLowerCase()) ||
        player.team.toLowerCase().includes(term.toLowerCase()) ||
        player.position.toLowerCase().includes(term.toLowerCase())
      );

      setTeams(filteredTeams);
      setPlayers(filteredPlayers);
      console.log(`✅ Найдено: ${filteredTeams.length} команд, ${filteredPlayers.length} игроков`);
    } catch (err) {
      console.error('❌ Ошибка поиска:', err);
      setError(err instanceof Error ? err.message : 'Ошибка поиска');
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Обновляем поиск при изменении термина
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      search(searchTerm);
    }, 300); // Задержка 300мс для оптимизации

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    teams,
    players,
    loading,
    error,
    search
  };
};




