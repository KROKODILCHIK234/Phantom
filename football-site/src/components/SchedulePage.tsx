import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Star } from 'lucide-react';
import ScrollAnimation from './ScrollAnimation';
import { getMatchesByRounds } from '../services/footballApi';

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamCrest: string;
  awayTeamCrest: string;
  league: string;
  date: string;
  time: string;
  venue?: string;
  status: 'upcoming' | 'live' | 'finished';
  homeScore?: number;
  awayScore?: number;
  minute?: number;
}

// Удаляем статические данные - будем использовать реальные данные из API

const SchedulePage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [selectedLeague, setSelectedLeague] = useState<string>('all');
  const [matchesData, setMatchesData] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Загружаем реальные данные матчей
  useEffect(() => {
    const loadMatches = async () => {
      try {
        setLoading(true);
        console.log('🔄 Загружаем реальные матчи...');
        
        // Преобразуем названия лиг в идентификаторы для API
        const leagueMapping: { [key: string]: string } = {
          'Premier League': 'premier-league',
          'La Liga': 'la-liga', 
          'Bundesliga': 'bundesliga',
          'Serie A': 'serie-a',
          'Ligue 1': 'ligue-1'
        };
        
        const leagueId = selectedLeague === 'all' ? 'all' : leagueMapping[selectedLeague] || 'premier-league';
        console.log(`🔄 Загружаем матчи для лиги: ${selectedLeague} (ID: ${leagueId})`);
        
        const roundsData = await getMatchesByRounds(leagueId);
        console.log('🔍 Rounds data:', roundsData);
        
        // Преобразуем данные туров в плоский список матчей
        const allMatches: Match[] = [];
        
        if (leagueId === 'all') {
          // Обрабатываем все лиги
          Object.keys(roundsData).forEach(leagueName => {
            Object.keys(roundsData[leagueName]).forEach(roundNumber => {
              roundsData[leagueName][roundNumber].forEach((match: any) => {
                const matchDate = new Date(match.date);
                allMatches.push({
                  id: match.id,
                  homeTeam: match.homeTeam,
                  awayTeam: match.awayTeam,
                  homeTeamCrest: match.homeTeamCrest,
                  awayTeamCrest: match.awayTeamCrest,
                  league: match.competition,
                  date: matchDate.toISOString().split('T')[0],
                  time: matchDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
                  venue: 'Стадион', // API не предоставляет информацию о стадионе
                  status: match.status === 'SCHEDULED' ? 'upcoming' : 
                         match.status === 'IN_PLAY' ? 'live' : 'finished',
                  homeScore: match.score?.home,
                  awayScore: match.score?.away
                });
              });
            });
          });
        } else {
          // Обрабатываем конкретную лигу
          Object.keys(roundsData).forEach(roundNumber => {
            roundsData[roundNumber].forEach((match: any) => {
              const matchDate = new Date(match.date);
              allMatches.push({
                id: match.id,
                homeTeam: match.homeTeam,
                awayTeam: match.awayTeam,
                homeTeamCrest: match.homeTeamCrest,
                awayTeamCrest: match.awayTeamCrest,
                league: match.competition,
                date: matchDate.toISOString().split('T')[0],
                time: matchDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
                venue: 'Стадион',
                status: match.status === 'SCHEDULED' ? 'upcoming' : 
                       match.status === 'IN_PLAY' ? 'live' : 'finished',
                homeScore: match.score?.home,
                awayScore: match.score?.away
              });
            });
          });
        }
        
        // Сортируем матчи по дате
        allMatches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        setMatchesData(allMatches);
        console.log(`✅ Загружено ${allMatches.length} реальных матчей`);
        } catch (err) {
          console.error('❌ Ошибка загрузки матчей:', err);
          
          // Более детальные сообщения об ошибках
          if (err instanceof Error) {
            if (err.message.includes('502')) {
              setError('Сервер временно недоступен. Попробуйте позже.');
            } else if (err.message.includes('429')) {
              setError('Превышен лимит запросов. Данные загружаются...');
            } else if (err.message.includes('Failed to fetch')) {
              setError('Проблема с подключением. Проверьте интернет.');
            } else {
              setError(`Ошибка загрузки: ${err.message}`);
            }
          } else {
            setError('Неизвестная ошибка при загрузке матчей');
          }
        } finally {
          setLoading(false);
        }
    };

    loadMatches();
  }, [selectedLeague]);

  const filteredMatches = matchesData.filter(match => {
    const dateMatch = selectedDate === 'all' || match.date === selectedDate;
    
    // Маппинг названий лиг из API на названия в интерфейсе
    const leagueNameMapping: { [key: string]: string } = {
      'Premier League': 'Premier League',
      'Primera Division': 'La Liga',  // API возвращает "Primera Division", а в UI "La Liga"
      'Bundesliga': 'Bundesliga',
      'Serie A': 'Serie A',
      'Ligue 1': 'Ligue 1'
    };
    
    // Для фильтрации по лиге используем маппинг названий
    const leagueMatch = selectedLeague === 'all' || 
      match.league === selectedLeague || 
      leagueNameMapping[match.league] === selectedLeague;
    
    return dateMatch && leagueMatch;
  });

  const leagues = ['all', 'Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1'];

  const getStatusColor = (status: Match['status']) => {
    switch (status) {
      case 'live': return 'var(--green-bright)';
      case 'upcoming': return 'var(--purple-bright)';
      case 'finished': return 'var(--text-muted)';
      default: return 'var(--text-muted)';
    }
  };

  const getStatusText = (status: Match['status'], minute?: number) => {
    switch (status) {
      case 'live': return `LIVE ${minute}'`;
      case 'upcoming': return 'Предстоящий';
      case 'finished': return 'Завершен';
      default: return status;
    }
  };

  return (
    <div className="schedule-page">
      <div className="container">
        <ScrollAnimation animation="fadeInUp">
          <div className="page-header">
            <h1>
              <span className="gradient-text">Расписание</span>
            </h1>
            <p>Следите за матчами из топ-5 лиг мира</p>
          </div>
        </ScrollAnimation>

        {/* Filters */}
        <div className="schedule-filters">
          <div className="filter-group">
            <label>Лига:</label>
            <div className="filter-buttons">
              {leagues.map(league => (
                <button
                  key={league}
                  onClick={() => setSelectedLeague(league)}
                  className={`filter-btn ${selectedLeague === league ? 'active' : ''}`}
                >
                  {league === 'all' ? 'Все лиги' : league}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Загружаем реальные матчи...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-state">
            <h3>Ошибка загрузки</h3>
            <p>{error}</p>
          </div>
        )}

        {/* Matches List */}
        {!loading && !error && (
          <div className="schedule-matches">
            {filteredMatches.map((match, index) => (
            <ScrollAnimation key={match.id} animation="fadeInUp" delay={index * 100}>
              <div className="match-card">
                <div className="match-header">
                  <div className="match-league">
                    <Star size={16} />
                    <span>{match.league}</span>
                  </div>
                  <div className="match-status" style={{ color: getStatusColor(match.status) }}>
                    {getStatusText(match.status, match.minute)}
                  </div>
                </div>

                <div className="match-teams">
                  <div className="team">
                    <img
                      src={match.homeTeamCrest}
                      alt={match.homeTeam}
                      className="team-logo"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    <span className="team-name">{match.homeTeam}</span>
                  </div>

                  <div className="match-score">
                    {match.status === 'upcoming' ? (
                      <div className="match-time">
                        <Clock size={16} />
                        <span>{match.time}</span>
                      </div>
                    ) : (
                      <span className="score">{match.homeScore} - {match.awayScore}</span>
                    )}
                  </div>

                  <div className="team">
                    <img
                      src={match.awayTeamCrest}
                      alt={match.awayTeam}
                      className="team-logo"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    <span className="team-name">{match.awayTeam}</span>
                  </div>
                </div>

                <div className="match-info">
                  <div className="match-date">
                    <Calendar size={14} />
                    <span>{new Date(match.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="match-venue">
                    <MapPin size={14} />
                    <span>{match.venue}</span>
                  </div>
                </div>
              </div>
            </ScrollAnimation>
            ))}
          </div>
        )}

        {!loading && !error && filteredMatches.length === 0 && (
          <div className="no-results">
            <h3>Матчи не найдены</h3>
            <p>Попробуйте изменить фильтры.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchedulePage;
