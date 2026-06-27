import React from "react";
import { HashRouter, Route, Routes, Navigate } from "react-router-dom";
import GameList from "./features/game-list/game-list";
import GameEditor from "./features/game-editor/game-editor";
import SettingsPage from "./features/settings/settings-page";

const App = () => (
    <HashRouter>
        <Routes>
            <Route path="/" element={<Navigate to="/games" replace />} />
            <Route path="/games" element={<GameList />} />
            <Route path="/games/new" element={<GameEditor />} />
            <Route path="/games/:id/edit" element={<GameEditor />} />
            <Route path="/settings" element={<SettingsPage />} />
        </Routes>
    </HashRouter>
);

export default App;
