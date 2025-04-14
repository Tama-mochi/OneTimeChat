// frontend/src/pages/TopPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import FuzzyText from '../components/FuzzyText';

const TopPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container">
      <header className="app-header">
        <h1 className="app-title">Phassmoth</h1>
        <div className="nav-buttons">
          <button className="nav-btn" onClick={() => navigate('/create')}>
            チャット作成
          </button>
          <button className="nav-btn" onClick={() => navigate('/join')}>
            チャット参加
          </button>
        </div>
      </header>
      <div className="home-screen">
        <h2 className="home-title">Phassmoth</h2>
        <p className="home-subtitle">
          一時的な会話のための、シンプルで安全なチャットスペース
        </p>
      </div>
    </div>
  );
};

export default TopPage;
