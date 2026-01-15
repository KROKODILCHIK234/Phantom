import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  league?: string;
  overall?: number;
}

interface FavoriteTeam {
  id: string;
  name: string;
  logo: string;
  league: string;
  country?: string;
  founded?: number;
}

interface FavoritesContextType {
  favoritePlayers: FavoritePlayer[];
  favoriteTeams: FavoriteTeam[];
  addFavoritePlayer: (player: FavoritePlayer) => void;
  removeFavoritePlayer: (playerId: string) => void;
  addFavoriteTeam: (team: FavoriteTeam) => void;
  removeFavoriteTeam: (teamId: string) => void;
  isFavoritePlayer: (playerId: string) => boolean;
  isFavoriteTeam: (teamId: string) => boolean;
  toggleFavoritePlayer: (player: FavoritePlayer) => void;
  toggleFavoriteTeam: (team: FavoriteTeam) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const [favoritePlayers, setFavoritePlayers] = useState<FavoritePlayer[]>([]);
  const [favoriteTeams, setFavoriteTeams] = useState<FavoriteTeam[]>([]);

  // Загружаем избранных игроков из localStorage при инициализации
  useEffect(() => {
    const savedPlayers = localStorage.getItem('favoritePlayers');
    if (savedPlayers) {
      try {
        setFavoritePlayers(JSON.parse(savedPlayers));
      } catch (error) {
        console.error('Error loading favorite players:', error);
        localStorage.removeItem('favoritePlayers');
      }
    }
  }, []);

  // Загружаем избранные команды из localStorage при инициализации
  useEffect(() => {
    const savedTeams = localStorage.getItem('favoriteTeams');
    if (savedTeams) {
      try {
        setFavoriteTeams(JSON.parse(savedTeams));
      } catch (error) {
        console.error('Error loading favorite teams:', error);
        localStorage.removeItem('favoriteTeams');
      }
    }
  }, []);

  // Сохраняем в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('favoritePlayers', JSON.stringify(favoritePlayers));
  }, [favoritePlayers]);

  useEffect(() => {
    localStorage.setItem('favoriteTeams', JSON.stringify(favoriteTeams));
  }, [favoriteTeams]);

  const addFavoritePlayer = (player: FavoritePlayer) => {
    setFavoritePlayers(prev => {
      if (prev.some(p => p.id === player.id)) {
        return prev;
      }
      return [...prev, player];
    });
  };

  const removeFavoritePlayer = (playerId: string) => {
    setFavoritePlayers(prev => prev.filter(player => player.id !== playerId));
  };

  const addFavoriteTeam = (team: FavoriteTeam) => {
    setFavoriteTeams(prev => {
      if (prev.some(t => t.id === team.id)) {
        return prev;
      }
      return [...prev, team];
    });
  };

  const removeFavoriteTeam = (teamId: string) => {
    setFavoriteTeams(prev => prev.filter(team => team.id !== teamId));
  };

  const isFavoritePlayer = (playerId: string) => {
    return favoritePlayers.some(player => player.id === playerId);
  };

  const isFavoriteTeam = (teamId: string) => {
    return favoriteTeams.some(team => team.id === teamId);
  };

  const toggleFavoritePlayer = (player: FavoritePlayer) => {
    if (isFavoritePlayer(player.id)) {
      removeFavoritePlayer(player.id);
    } else {
      addFavoritePlayer(player);
    }
  };

  const toggleFavoriteTeam = (team: FavoriteTeam) => {
    if (isFavoriteTeam(team.id)) {
      removeFavoriteTeam(team.id);
    } else {
      addFavoriteTeam(team);
    }
  };

  const value: FavoritesContextType = {
    favoritePlayers,
    favoriteTeams,
    addFavoritePlayer,
    removeFavoritePlayer,
    addFavoriteTeam,
    removeFavoriteTeam,
    isFavoritePlayer,
    isFavoriteTeam,
    toggleFavoritePlayer,
    toggleFavoriteTeam
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};
