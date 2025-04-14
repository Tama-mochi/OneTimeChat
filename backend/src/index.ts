// backend/src/index.ts
import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { randomBytes } from 'crypto';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // 開発時はすべて許可。運用時は適切なオリジンに変更すること
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const SESSION_TTL = 72 * 60 * 60 * 1000; // 72時間（ミリ秒）

// チャットメッセージおよびセッションの型定義
interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
  type: 'text' | 'file' | 'image' | 'video';
}

interface ChatSession {
  id: string;
  pin: string;
  roomName: string;
  type: 'individual' | 'group';
  createdAt: number;
  messages: ChatMessage[];
  timeout?: NodeJS.Timeout;
}

// メモリ上に保持するチャットセッション
const chatSessions: { [id: string]: ChatSession } = {};

// ランダムなセッションID生成
function generateSessionId(): string {
  return randomBytes(8).toString('hex');
}

// 6桁のランダムPIN生成（大文字・小文字・数字）
function generateRandomPin(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let pin = '';
  for (let i = 0; i < 6; i++) {
    pin += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pin;
}

// 【エンドポイント】チャットセッションの作成
app.post('/api/createSession', (req: Request, res: Response): void => {
  const { roomName, type } = req.body;
  if (!roomName || !type || (type !== 'individual' && type !== 'group')) {
    res.status(400).json({ error: 'Invalid room name or type' });
    return;
  }
  const sessionId = generateSessionId();
  const pin = generateRandomPin();
  const createdAt = Date.now();

  const newSession: ChatSession = {
    id: sessionId,
    pin,
    roomName,
    type,
    createdAt,
    messages: []
  };

  // 72時間後に自動削除（エフェメラル性の実現）
  newSession.timeout = setTimeout(() => {
    delete chatSessions[sessionId];
    console.log(`Session ${sessionId} expired and removed.`);
  }, SESSION_TTL);

  chatSessions[sessionId] = newSession;
  res.json({ sessionId, pin, roomName, type });
});

// 【エンドポイント】チャットセッションへの参加チェック
app.post('/api/joinSession', (req: Request, res: Response): void => {
  const { sessionId, pin, userName } = req.body;
  if (!sessionId || !pin || !userName) {
    res.status(400).json({ error: 'sessionId, pin, and userName are required' });
    return;
  }
  const session = chatSessions[sessionId];
  if (!session || session.pin !== pin) {
    res.status(404).json({ error: 'Session not found or invalid pin' });
    return;
  }
  // timeout プロパティを除外してレスポンス用のセッションデータを作成する
  const { timeout, ...sessionData } = session;
  res.json({ message: 'Session joined', session: sessionData });
});

// Socket.IO によるリアルタイム通信処理
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // クライアントは 'joinRoom' イベントでセッション参加情報（sessionId, userName）を送信する
  socket.on('joinRoom', (data) => {
    const { sessionId, userName } = data;
    const session = chatSessions[sessionId];
    if (!session) {
      socket.emit('errorMessage', 'Session not found or expired');
      return;
    }
    socket.join(sessionId);
    // ユーザー情報を socket.data に保持
    socket.data.userName = userName;
    socket.data.sessionId = sessionId;
    console.log(`${userName} joined session ${sessionId}`);

    // 参加時に既存のチャット履歴を送信
    socket.emit('chatHistory', session.messages);
  });

  // チャットメッセージの受信およびブロードキャスト
  socket.on('chatMessage', (data) => {
    const { content, type } = data; // type: 'text', 'file', 'image', 'video'
    const userName = socket.data.userName;
    const sessionId = socket.data.sessionId;
    if (!userName || !sessionId) {
      socket.emit('errorMessage', 'User not joined to a session');
      return;
    }
    const session = chatSessions[sessionId];
    if (!session) {
      socket.emit('errorMessage', 'Session not found or expired');
      return;
    }
    const message: ChatMessage = {
      id: randomBytes(8).toString('hex'),
      sender: userName,
      content,
      timestamp: Date.now(),
      type: type || 'text'
    };
    session.messages.push(message);
    // 同じセッション内の全クライアントにメッセージをブロードキャスト
    io.to(sessionId).emit('newMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// サーバー起動
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
