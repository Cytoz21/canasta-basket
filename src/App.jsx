import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import PlayerList from './pages/PlayerList';
import PlayerDetail from './pages/PlayerDetail';
import LeagueList from './pages/Public/LeagueList';
import LeagueDetail from './pages/Public/LeagueDetail';
import TeamDetail from './pages/Public/TeamDetail';
import Login from './pages/Login';
import Dashboard from './pages/Admin/Dashboard';
import PlayerManager from './pages/Admin/PlayerManager';
import PlayerForm from './pages/Admin/PlayerForm';
import TeamManager from './pages/Admin/TeamManager';
import TeamForm from './pages/Admin/TeamForm';
import LeagueManager from './pages/Admin/LeagueManager';
import LeagueForm from './pages/Admin/LeagueForm';
import MatchManager from './pages/Admin/MatchManager';
import MatchForm from './pages/Admin/MatchForm';
import MatchStats from './pages/Admin/MatchStats';
import CategoryManager from './pages/Admin/CategoryManager';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="jugadores" element={<PlayerList />} />
        <Route path="jugadores/:id" element={<PlayerDetail />} />
        <Route path="ligas" element={<LeagueList />} />
        <Route path="leagues/:id" element={<LeagueDetail />} />
        <Route path="teams/:id" element={<TeamDetail />} />
        <Route path="login" element={<Login />} />

        {/* Admin Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="admin" element={<Dashboard />} />
          <Route path="admin/players" element={<PlayerManager />} />
          <Route path="admin/players/new" element={<PlayerForm />} />
          <Route path="admin/players/:id" element={<PlayerForm />} />

          <Route path="admin/teams" element={<TeamManager />} />
          <Route path="admin/teams/new" element={<TeamForm />} />
          <Route path="admin/teams/:id" element={<TeamForm />} />

          <Route path="admin/leagues" element={<LeagueManager />} />
          <Route path="admin/leagues/new" element={<LeagueForm />} />
          <Route path="admin/leagues/:id" element={<LeagueForm />} />

          <Route path="admin/matches" element={<MatchManager />} />
          <Route path="admin/matches/new" element={<MatchForm />} />
          <Route path="admin/matches/:id/stats" element={<MatchStats />} />

          <Route path="admin/categories" element={<CategoryManager />} />
        </Route>

        <Route path="*" element={<div className="p-20 text-center">404 - No encontrado</div>} />
      </Route>
    </Routes>
  );
}

export default App;
