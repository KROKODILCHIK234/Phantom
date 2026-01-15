import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Leagues from './components/Leagues';
import LeaguesPage from './components/LeaguesPage';
import SchedulePage from './components/SchedulePage';
import TeamsPage from './components/TeamsPage';
import PlayersPage from './components/PlayersPage';
import FavoritesPage from './components/FavoritesPage';
import RightSidebar from './components/RightSidebar';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';
import { FavoritesProvider, useFavorites } from './context/FavoritesContext';

// Компонент для отображения RightSidebar с данными из контекста
const RightSidebarWithData = () => {
  const { favoritePlayers, favoriteTeams, removeFavoritePlayer, removeFavoriteTeam } = useFavorites();
  
  return (
    <RightSidebar 
      favoritePlayers={favoritePlayers}
      favoriteTeams={favoriteTeams}
      onRemovePlayer={removeFavoritePlayer}
      onRemoveTeam={removeFavoriteTeam}
    />
  );
};

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <FavoritesProvider>
      <Router>
        <div className="App">
          <Header />
          <div className="main-layout">
            <main className="main-content">
                  <Routes>
                    <Route path="/" element={
                      <>
                        <Hero />
                        <Leagues />
                      </>
                    } />
                    <Route path="/leagues" element={<LeaguesPage />} />
                    <Route path="/schedule" element={<SchedulePage />} />
                            <Route path="/teams" element={<TeamsPage />} />
                            <Route path="/players" element={<PlayersPage />} />
                            <Route path="/favorites" element={<FavoritesPage />} />
                  </Routes>
            </main>
            <RightSidebarWithData />
          </div>
          <Footer />
        </div>
      </Router>
    </FavoritesProvider>
  );
}

export default App;