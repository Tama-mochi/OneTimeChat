// frontend/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SplashScreen from './pages/SplashScreen';
import TopPage from './pages/TopPage';
import CreateChatPage from './pages/CreateChatPage';
import JoinChatPage from './pages/JoinChatPage';
import ChatPage from './pages/ChatPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/top" element={<TopPage />} />
        <Route path="/create" element={<CreateChatPage />} />
        <Route path="/join" element={<JoinChatPage />} />
        <Route path="/chat/:sessionId" element={<ChatPage />} />
      </Routes>
    </Router>
  );
};

export default App;
