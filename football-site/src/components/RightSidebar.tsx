import React, { useState, useEffect } from 'react';
import { Users, Star, Calendar, Clock, X } from 'lucide-react';

interface FavoriteTeam {
  id: string;
  name: string;
  logo: string;
  league: string;
  country?: string;
  founded?: number;
}

interface FavoritePlayer {
  id: string;
  name: string;
  photo: string;
  team: string;
  teamLogo?: string;
  position: string;
  rating: number;
  nationality?: string;
  age?: number;
  shirtNumber?: number;
}

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo: string;
  awayLogo: string;
  date: string;
  time: string;
  venue: string;
  league: string;
  status: 'upcoming' | 'live' | 'finished';
  homeScore?: number;
  awayScore?: number;
  minute?: number;
}

interface RightSidebarProps {
  favoritePlayers?: FavoritePlayer[];
  favoriteTeams?: FavoriteTeam[];
  onRemovePlayer?: (playerId: string) => void;
  onRemoveTeam?: (teamId: string) => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ 
  favoritePlayers: propFavoritePlayers,
  favoriteTeams: propFavoriteTeams,
  onRemovePlayer,
  onRemoveTeam
}) => {
  const [favoriteTeam, setFavoriteTeam] = useState<FavoriteTeam | null>(null);
  const [favoritePlayers, setFavoritePlayers] = useState<FavoritePlayer[]>([]);
  const [teamMatches, setTeamMatches] = useState<Match[]>([]);

  // Загружаем избранную команду из localStorage
  useEffect(() => {
    const savedTeam = localStorage.getItem('favoriteTeam');
    if (savedTeam) {
      try {
        // Проверяем, является ли savedTeam строкой или уже объектом
        const teamData = typeof savedTeam === 'string' ? JSON.parse(savedTeam) : savedTeam;
        if (teamData && typeof teamData === 'object' && teamData.id) {
          setFavoriteTeam(teamData);
        }
      } catch (error) {
        console.error('Error parsing favorite team:', error);
        // Очищаем некорректные данные
        localStorage.removeItem('favoriteTeam');
      }
    }
  }, []);

  // Загружаем избранных игроков из localStorage или используем props
  useEffect(() => {
    if (propFavoritePlayers) {
      setFavoritePlayers(propFavoritePlayers);
    } else {
      const savedPlayers = localStorage.getItem('favoritePlayers');
      if (savedPlayers) {
        setFavoritePlayers(JSON.parse(savedPlayers));
      }
    }
  }, [propFavoritePlayers]);

  // Используем propFavoriteTeams напрямую

  // Загружаем матчи команды
  useEffect(() => {
    if (favoriteTeam) {
      setTeamMatches([
        {
          id: '1',
          homeTeam: 'Manchester United',
          awayTeam: 'Liverpool',
          homeLogo: 'https://logos-world.net/wp-content/uploads/2020/06/Manchester-United-Logo.png',
          awayLogo: 'https://logos-world.net/wp-content/uploads/2020/06/Liverpool-Logo.png',
          date: '2024-01-15',
          time: '17:30',
          venue: 'Old Trafford',
          league: 'Premier League',
          status: 'upcoming'
        },
        {
          id: '2',
          homeTeam: 'Arsenal',
          awayTeam: 'Manchester United',
          homeLogo: 'https://logos-world.net/wp-content/uploads/2020/06/Arsenal-Logo.png',
          awayLogo: 'https://logos-world.net/wp-content/uploads/2020/06/Manchester-United-Logo.png',
          date: '2024-01-20',
          time: '16:00',
          venue: 'Emirates Stadium',
          league: 'Premier League',
          status: 'upcoming'
        },
        {
          id: '3',
          homeTeam: 'Manchester United',
          awayTeam: 'Chelsea',
          homeLogo: 'https://logos-world.net/wp-content/uploads/2020/06/Manchester-United-Logo.png',
          awayLogo: 'https://logos-world.net/wp-content/uploads/2020/06/Chelsea-Logo.png',
          date: '2024-01-10',
          time: '15:00',
          venue: 'Old Trafford',
          league: 'Premier League',
          status: 'finished',
          homeScore: 2,
          awayScore: 1
        }
      ]);
    }
  }, [favoriteTeam]);

  const removeFavoritePlayer = (playerId: string) => {
    if (onRemovePlayer) {
      onRemovePlayer(playerId);
    } else {
      const updatedPlayers = favoritePlayers.filter(player => player.id !== playerId);
      setFavoritePlayers(updatedPlayers);
      localStorage.setItem('favoritePlayers', JSON.stringify(updatedPlayers));
    }
  };

  const removeFavoriteTeam = (teamId: string) => {
    if (onRemoveTeam) {
      onRemoveTeam(teamId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'var(--football-green)';
      case 'finished': return 'var(--gray-400)';
      case 'upcoming': return 'var(--primary-blue)';
      default: return 'var(--gray-400)';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'live': return 'LIVE';
      case 'finished': return 'FT';
      case 'upcoming': return 'Upcoming';
      default: return status;
    }
  };

  return (
    <div className="right-sidebar">
      <div className="sidebar-content">
        {/* Favorite Team Section */}
        <div className="sidebar-section">
          <div className="sidebar-header">
            <Users size={20} color="var(--football-green)" />
            <h3>Моя команда</h3>
          </div>
          
          {favoriteTeam ? (
            <div className="favorite-team-card">
              <div className="team-info">
                <img
                  src={favoriteTeam.logo}
                  alt={favoriteTeam.name}
                  className="team-logo-sidebar"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <div className="team-details">
                  <h4>{favoriteTeam.name}</h4>
                  <p>{favoriteTeam.league}</p>
                </div>
              </div>

              {/* Team Matches */}
              <div className="team-matches-sidebar">
                <h5>Матчи команды</h5>
                <div className="matches-list-sidebar">
                  {teamMatches.slice(0, 5).map((match) => (
                    <div key={match.id} className="match-card-sidebar">
                      <div className="match-teams-sidebar">
                        <div className="team-sidebar">
                          <img
                            src={match.homeLogo}
                            alt={match.homeTeam}
                            className="team-logo-mini"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                          <span className="team-name-mini">{match.homeTeam}</span>
                        </div>
                        
                        <div className="match-score-sidebar">
                          {match.status === 'upcoming' ? (
                            <div className="match-time-sidebar">
                              <Clock size={10} />
                              <span>{match.time}</span>
                            </div>
                          ) : (
                            <div className="score-sidebar">
                              <span>{match.homeScore || 0}</span>
                              <span>:</span>
                              <span>{match.awayScore || 0}</span>
                            </div>
                          )}
                        </div>

                        <div className="team-sidebar">
                          <span className="team-name-mini">{match.awayTeam}</span>
                          <img
                            src={match.awayLogo}
                            alt={match.awayTeam}
                            className="team-logo-mini"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      </div>
                      
                      <div className="match-info-sidebar">
                        <div className="match-status-sidebar" style={{ color: getStatusColor(match.status) }}>
                          {getStatusText(match.status)}
                        </div>
                        <div className="match-date-sidebar">
                          <Calendar size={10} />
                          <span>{new Date(match.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="no-favorite-sidebar">
              <p>Выберите любимую команду в разделе "Избранное"</p>
            </div>
          )}
        </div>

        {/* Favorite Teams Section */}
        <div className="sidebar-section">
          <div className="sidebar-header">
            <Users size={20} color="var(--football-green)" />
            <h3>Мои команды</h3>
          </div>
          
          {propFavoriteTeams && propFavoriteTeams.length > 0 ? (
            <div className="favorite-teams-list">
              {propFavoriteTeams.map((team) => (
                <div key={team.id} className="team-card-sidebar">
                  <img
                    src={team.logo}
                    alt={team.name}
                    className="team-logo-sidebar"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <div className="team-info-sidebar">
                    <h5>{team.name}</h5>
                    <p>{team.league}</p>
                    {team.country && (
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0' }}>
                        🏴 {team.country}
                        {team.founded && ` • ${team.founded}`}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeFavoriteTeam(team.id)}
                    className="remove-team-btn"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-favorite-sidebar">
              <p>Добавьте команды в избранное</p>
            </div>
          )}
        </div>

        {/* Favorite Players Section */}
        <div className="sidebar-section">
          <div className="sidebar-header">
            <Star size={20} color="var(--football-gold)" />
            <h3>Мои игроки</h3>
          </div>
          
          {favoritePlayers.length > 0 ? (
            <div className="favorite-players-list">
              {favoritePlayers.map((player) => (
                <div key={player.id} className="player-card-sidebar">
                  <img
                    src={player.photo}
                    alt={player.name}
                    className="player-photo-sidebar"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/40x40/333333/FFFFFF?text=' + player.name.charAt(0);
                    }}
                  />
                  <div className="player-info-sidebar">
                    <h5>{player.name}</h5>
                    <p>{player.position} • {player.team}</p>
                    {player.nationality && (
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0' }}>
                        🏴 {player.nationality}
                        {player.age && ` • ${player.age} лет`}
                        {player.shirtNumber && ` • #${player.shirtNumber}`}
                      </p>
                    )}
                    <div className="player-rating-sidebar">
                      <Star size={12} fill="var(--football-gold)" color="var(--football-gold)" />
                      <span>{player.rating}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFavoritePlayer(player.id)}
                    className="remove-player-btn"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-favorite-sidebar">
              <p>Добавьте игроков в избранное</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
