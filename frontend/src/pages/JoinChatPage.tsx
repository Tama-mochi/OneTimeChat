// frontend/src/pages/JoinChatPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const JoinChatPage: React.FC = () => {
  const navigate = useNavigate();
  const storedSessionId = localStorage.getItem('sessionId') || '';
  const storedPin = localStorage.getItem('pin') || '';
  const [chatId, setChatId] = useState(storedSessionId);
  const [pin, setPin] = useState(storedPin);
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');

  const handleJoin = async () => {
    if (!chatId || !pin || !userName) {
      setError('すべての項目を入力してください');
      return;
    }
    const sessionId = chatId;
    const response = await fetch('http://localhost:3000/api/joinSession', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, pin, userName }),
    });
    if (response.ok) {
      const data = await response.json();
      const roomName = data.session.roomName;
      navigate(`/chat/${sessionId}`, { state: { userName, roomName, pin } });
    } else {
      const data = await response.json();
      setError(data.error || '参加に失敗しました');
    }
  };

  return (
    <div className="container">
      <section className="join-chat animate-in">
        <h2 className="screen-title">チャット参加</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div className="input-group">
          <label htmlFor="chat-id">チャットID</label>
          <input
            type="text"
            id="chat-id"
            placeholder="チャットIDを入力"
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label htmlFor="pin">PIN</label>
          <input
            type="text"
            id="pin"
            placeholder="PINを入力"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label htmlFor="username">ユーザー名</label>
          <input
            type="text"
            id="username"
            placeholder="あなたの表示名を入力"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
        <button className="nav-btn" onClick={handleJoin}>
          参加
        </button>
      </section>
    </div>
  );
};

export default JoinChatPage;
