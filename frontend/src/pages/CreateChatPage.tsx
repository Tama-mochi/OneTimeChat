// frontend/src/pages/CreateChatPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState('');
  const [chatType, setChatType] = useState<'individual' | 'group'>('individual');
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!roomName) {
      setError('ルーム名を入力してください');
      return;
    }
    const response = await fetch('http://localhost:3000/api/createSession', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomName, type: chatType }),
    });
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('sessionId', data.sessionId);
      localStorage.setItem('pin', data.pin);
      navigate('/join');
    } else {
      const data = await response.json();
      setError(data.error || 'チャット作成に失敗しました');
    }
  };

  return (
    <div className="container">
      <section className="create-chat animate-in">
        <h2 className="screen-title">チャット作成</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div className="form-group">
          <label htmlFor="room-name">ルーム名</label>
          <input
            type="text"
            id="room-name"
            placeholder="チャットルームの名前を入力"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
        </div>
        <div className="chat-type-selector">
          <button
            className={`chat-type-btn ${chatType === 'individual' ? 'active' : ''}`}
            onClick={() => setChatType('individual')}
          >
            個人チャット
          </button>
          <button
            className={`chat-type-btn ${chatType === 'group' ? 'active' : ''}`}
            onClick={() => setChatType('group')}
          >
            グループチャット
          </button>
        </div>
        <button className="nav-btn" onClick={handleCreate}>
          作成
        </button>
      </section>
    </div>
  );
};

export default CreateChatPage;
