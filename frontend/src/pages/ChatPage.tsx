// frontend/src/pages/ChatPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
  type: 'text' | 'file' | 'image' | 'video';
}

const formatDateTime = (timestamp: number) => {
  const date = new Date(timestamp);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd} ${hh}:${min}:${ss}`;
};

const ChatPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const { userName, roomName, pin } = (location.state as {
    userName: string;
    roomName: string;
    pin: string;
  }) || { userName: '', roomName: '', pin: '' };

  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);
    newSocket.on('connect', () => {
      newSocket.emit('joinRoom', { sessionId, userName });
    });
    newSocket.on('chatHistory', (chatHistory: ChatMessage[]) => {
      setMessages(chatHistory);
    });
    newSocket.on('newMessage', (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });
    newSocket.on('errorMessage', (msg: string) => {
      setError(msg);
    });
    return () => {
      newSocket.disconnect();
    };
  }, [sessionId, userName]);

  const handleSend = () => {
    if (socket && newMessage.trim() !== '') {
      socket.emit('chatMessage', { content: newMessage, type: 'text' });
      setNewMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="container">
      <section className="chat-screen animate-in">
        <div className="chat-header">
          <div className="chat-info">
            <div className="room-name">チャットルーム: {roomName}</div>
            {/* ユーザー名を左寄せにするため、flexなどで調整済みと仮定 */}
            <div className="user-info">ユーザー名: {userName}</div>
            <div className="session-info">セッションID: {sessionId} / PIN: {pin}</div>
          </div>
        </div>
        <div className="messages-container">
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {messages.map((msg) => (
            <div key={msg.id} className="message">
              <div className="message-header" style={{ justifyContent: 'space-between' }}>
                <span className="user" style={{ textAlign: 'left', flex: 1 }}>{msg.sender}</span>
                <span className="time">{formatDateTime(msg.timestamp)}</span>
              </div>
              <div className="message-content">{msg.content}</div>
            </div>
          ))}
        </div>
        <div className="input-area">
          <input
            type="text"
            className="message-input"
            placeholder="メッセージを入力..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="send-btn" onClick={handleSend}>
            送信
          </button>
        </div>
      </section>
    </div>
  );
};

export default ChatPage;
