import React, { useState, useEffect } from 'react';
import { getTeamsByLeague, Team } from '../services/footballApi';

interface LeagueTableProps {
  leagueId: string;
  leagueName: string;
  onTeamSelect?: (teamId: string) => void;
}

const LeagueTable: React.FC<LeagueTableProps> = ({ leagueId, leagueName, onTeamSelect }) => {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);

  // Список команд с маленькими логотипами, которые нужно увеличить
  const smallLogoTeams = [
    'Nottingham Forest FC',
    'Real Oviedo',
    'AS Monaco FC',
    'AJ Auxerre',
    'VfB Stuttgart',
    'Hamburger SV',
    'FC Augsburg',
    'VfL Wolfsburg',
    '1. FSV Mainz 05',
    '1. FC Heidenheim 1846'
  ];

  // Загружаем команды при изменении лиги
  useEffect(() => {
    const loadTeams = async () => {
      try {
        console.log(`🔄 Загружаем команды для лиги: ${leagueId}`);
        const teamsData = await getTeamsByLeague(leagueId);
        setTeams(teamsData);
        console.log(`✅ Загружено команд: ${teamsData.length}`);
      } catch (error) {
        console.error('❌ Ошибка загрузки команд:', error);
        setTeams([]);
      }
    };

    loadTeams();
  }, [leagueId]);

  const handleTeamClick = (teamId: string) => {
    setSelectedTeam(teamId);
    if (onTeamSelect) {
      onTeamSelect(teamId);
    }
  };

  if (teams.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="text-gray-500 mb-4">📊 Нет данных для отображения</div>
        <p className="text-sm text-gray-400">
          Команды для лиги "{leagueName}" не найдены
        </p>
      </div>
    );
  }

  return (
    <div className="league-table bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white rounded-xl overflow-hidden shadow-2xl">
      {/* Заголовок */}
      <div className="px-6 py-5 border-b border-gray-600 bg-gradient-to-r from-gray-800 to-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-white flex items-center">
            <span className="mr-3">🏆</span>
            Standings:
          </h3>
          <div className="flex space-x-2">
            <button className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg text-sm font-semibold shadow-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200">
              TOTAL
            </button>
            <button className="px-5 py-2.5 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-500 transition-all duration-200">
              HOME
            </button>
            <button className="px-5 py-2.5 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-500 transition-all duration-200">
              AWAY
            </button>
          </div>
        </div>
      </div>

      {/* Таблица */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-700 to-gray-600">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-200 uppercase tracking-wider">Pos</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-200 uppercase tracking-wider">Team</th>
              <th className="px-6 py-4 text-center text-sm font-bold text-gray-200 uppercase tracking-wider">Matches</th>
              <th className="px-6 py-4 text-center text-sm font-bold text-gray-200 uppercase tracking-wider">Points</th>
              <th className="px-6 py-4 text-center text-sm font-bold text-gray-200 uppercase tracking-wider">+/-</th>
              <th className="px-6 py-4 text-center text-sm font-bold text-gray-200 uppercase tracking-wider">Goals</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-600">
            {teams.map((team, index) => (
              <tr 
                key={team.id} 
                className={`hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600 cursor-pointer transition-all duration-200 ${
                  selectedTeam === team.id ? 'bg-gradient-to-r from-gray-700 to-gray-600' : ''
                } ${index % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-800/10'}`}
                onClick={() => handleTeamClick(team.id)}
              >
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg position-animated ${
                      team.position <= 4 ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                      team.position <= 6 ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                      team.position >= 18 ? 'bg-gradient-to-br from-red-500 to-rose-600' : 'bg-gradient-to-br from-gray-500 to-gray-700'
                    }`}>
                      <span className="text-xl font-black text-white drop-shadow-lg">
                        {team.position}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1 shadow-lg team-logo-animated ${
                        smallLogoTeams.includes(team.name) ? 'team-logo-container-small' : ''
                      }`}>
                        <img
                          src={team.logo}
                          alt={team.name}
                          className={`w-full h-full rounded-full object-cover bg-white p-2 shadow-inner ${
                            smallLogoTeams.includes(team.name) ? 'team-logo-small-fix' : ''
                          }`}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            const firstChar = team.name.charAt(0).toUpperCase();
                            target.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
                              <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
                                <rect width="64" height="64" fill="#3b82f6" rx="32"/>
                                <text x="50%" y="50%" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dy=".3em">${firstChar}</text>
                              </svg>
                            `)}`;
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-lg font-bold text-white truncate max-w-48">
                      {team.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-3 py-2 rounded-full shadow-lg">
                      <span className="text-lg font-bold text-white drop-shadow-lg">
                        {team.played}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 shadow-xl flex items-center justify-center points-animated">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center shadow-inner">
                          <span className="text-2xl font-black text-white drop-shadow-lg">
                            {team.points}
                          </span>
                        </div>
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-xs font-bold text-white">PTS</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg goals-animated ${
                      (team.goalDifference || 0) >= 0 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                        : 'bg-gradient-to-br from-red-500 to-rose-600'
                    }`}>
                      <span className="text-lg font-black text-white drop-shadow-lg">
                        {(team.goalDifference || 0) > 0 ? '+' : ''}{team.goalDifference || 0}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 rounded-full shadow-lg">
                      <span className="text-lg font-bold text-white drop-shadow-lg">
                        {team.goalsFor}:{team.goalsAgainst}
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Подвал таблицы */}
      <div className="px-6 py-4 bg-gradient-to-r from-gray-800 to-gray-700 border-t border-gray-600">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>📊 {leagueName} 2024/25 Season</span>
          <span>For the 💙 of the game</span>
        </div>
      </div>

      {/* Team Detail Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setSelectedTeam(null)}>
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img 
                    src={teams.find(t => t.id === selectedTeam)?.logo} 
                    alt={teams.find(t => t.id === selectedTeam)?.name}
                    className="w-16 h-16 rounded-full object-contain bg-white p-2 shadow-lg"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/64x64/cccccc/666666?text=FC';
                    }}
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {teams.find(t => t.id === selectedTeam)?.name}
                    </h2>
                    <p className="text-gray-400">{leagueName} 2024/25</p>
                  </div>
                </div>
                <button
                  className="text-gray-400 hover:text-white text-3xl font-bold transition-colors duration-200"
                  onClick={() => setSelectedTeam(null)}
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-gray-700 to-gray-600 p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <span className="mr-2">📊</span>
                    Статистика матчей
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-500">
                      <span className="text-gray-300">Игры:</span>
                      <span className="text-white font-bold text-lg">{teams.find(t => t.id === selectedTeam)?.played}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-500">
                      <span className="text-gray-300">Победы:</span>
                      <span className="text-green-400 font-bold text-lg">{teams.find(t => t.id === selectedTeam)?.won}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-500">
                      <span className="text-gray-300">Ничьи:</span>
                      <span className="text-yellow-400 font-bold text-lg">{teams.find(t => t.id === selectedTeam)?.drawn}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-300">Поражения:</span>
                      <span className="text-red-400 font-bold text-lg">{teams.find(t => t.id === selectedTeam)?.lost}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-gray-700 to-gray-600 p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <span className="mr-2">⚽</span>
                    Голы и очки
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-500">
                      <span className="text-gray-300">Забито:</span>
                      <span className="text-green-400 font-bold text-lg">{teams.find(t => t.id === selectedTeam)?.goalsFor}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-500">
                      <span className="text-gray-300">Пропущено:</span>
                      <span className="text-red-400 font-bold text-lg">{teams.find(t => t.id === selectedTeam)?.goalsAgainst}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-500">
                      <span className="text-gray-300">Разность:</span>
                      <span className={`font-bold text-lg ${
                        (teams.find(t => t.id === selectedTeam)?.goalDifference || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {teams.find(t => t.id === selectedTeam)?.goalDifference || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg px-4 py-3">
                      <span className="text-white font-bold">Очки:</span>
                      <span className="text-white font-bold text-2xl">{teams.find(t => t.id === selectedTeam)?.points}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Позиция в лиге */}
              <div className="mt-6 bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Позиция в лиге</h3>
                    <p className="text-gray-200">Текущее место в турнирной таблице</p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-white">
                      {teams.find(t => t.id === selectedTeam)?.position}
                    </div>
                    <div className="text-sm text-gray-200">
                      из {teams.length} команд
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeagueTable;