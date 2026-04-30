import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "";

let socket = null;
function getSocket() {
  if (!socket) {
    socket = io(SERVER_URL, { transports: ["websocket", "polling"] });
  }
  return socket;
}

const EMOJI_CHARS = ["⚽","🏆","🎯","🦁","🔥","🌟","💎","🎮","🚀","🦊","🐺","🎸"];
function getEmoji(name) { return EMOJI_CHARS[name.charCodeAt(0) % EMOJI_CHARS.length]; }

function HomeScreen({ onJoin }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const sock = getSocket();
    const handleError = (msg) => setError(msg);
    const handleJoined = ({ code, players, isHost }) => onJoin({ code, players, isHost });
    sock.on("error", handleError);
    sock.on("room_joined", handleJoined);
    return () => {
      sock.off("error", handleError);
      sock.off("room_joined", handleJoined);
    };
  }, [onJoin]);

  const handleCreate = () => {
    if (!name.trim()) return setError("Enter your name first");
    setError("");
    getSocket().emit("create_room", { name: name.trim() });
  };

  const handleJoin = () => {
    if (!name.trim()) return setError("Enter your name first");
    if (!code.trim()) return setError("Enter a room code");
    setError("");
    getSocket().emit("join_room", { name: name.trim(), code: code.trim().toUpperCase() });
  };

  return (
    <div className="screen">
      <div>
        <div className="logo">IMPOSTER<br /><span>QUESTION GAME</span></div>
        <div className="subtitle" style={{marginTop:4}}>Multiplayer party game — find the imposter!</div>
      </div>
      <div className="card">
        <div className="card-title">YOUR NAME</div>
        <input type="text" placeholder="Enter your name..." value={name} onChange={e => setName(e.target.value)} maxLength={16} autoComplete="off" />
      </div>
      <button className="btn btn-primary" onClick={handleCreate}>⚡ Create Room</button>
      <div className="divider">or join a room</div>
      <div className="card">
        <div className="card-title">ROOM CODE</div>
        <input type="text" placeholder="Enter code (e.g. XK92A)" value={code} onChange={e => setCode(e.target.value.toUpperCase())} maxLength={5} autoComplete="off" />
      </div>
      <button className="btn btn-secondary" onClick={handleJoin}>🔑 Join Room</button>
      {error && <div className="error-msg">⚠️ {error}</div>}
      <div className="card" style={{marginTop:"auto"}}>
        <div style={{fontSize:"0.8rem", color:"var(--text-muted)", lineHeight:1.6}}>
          <strong style={{color:"var(--green)"}}>How to play:</strong><br/>
          3 to 10 players — one or more are imposters<br/>
          Everyone gets a question — imposters get a slightly different one<br/>
          Discuss, vote, and reveal!
        </div>
      </div>
    </div>
  );
}

function LobbyScreen({ code, players: initPlayers, isHost, onBack }) {
  const [players, setPlayers] = useState(initPlayers);
  const [error, setError] = useState("");
  const [imposterCount, setImposterCount] = useState(1);

  useEffect(() => {
    const sock = getSocket();
    const handleUpdate = (p) => setPlayers(p);
    const handleError = (msg) => setError(msg);
    sock.on("players_updated", handleUpdate);
    sock.on("error", handleError);
    return () => {
      sock.off("players_updated", handleUpdate);
      sock.off("error", handleError);
    };
  }, []);

  const handleStart = () => {
    if (players.length < 3) return setError("Need at least 3 players to start");
    setError("");
    getSocket().emit("start_game", { code, imposterCount });
  };

  const maxImposters = Math.max(1, Math.floor(players.length / 2));

  return (
    <div className="screen">
      <div>
        <div className="logo" style={{fontSize:"2rem"}}>LOBBY</div>
        <div className="room-code" style={{marginTop:12}}>
          <div className="label">Room Code — share this!</div>
          <div className="code">{code}</div>
        </div>
      </div>
      <div className="card">
        <div className="card-title">PLAYERS ({players.length}/10)</div>
        <div className="player-list">
          {players.map(p => (
            <div className="player-item" key={p.id}>
              <div className="player-avatar">{getEmoji(p.name)}</div>
              <span className="player-name">{p.name}</span>
              {p.isHost && <span className="host-badge">Host</span>}
            </div>
          ))}
        </div>
        {players.length < 3 && (
          <div className="waiting pulse" style={{marginTop:12}}>
            Waiting for players... ({players.length}/3 minimum)
          </div>
        )}
      </div>
      {isHost && (
        <div className="card">
          <div className="card-title">NUMBER OF IMPOSTERS</div>
          <div style={{display:"flex", gap:"10px"}}>
            {Array.from({length: maxImposters}, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setImposterCount(n)} style={{
                flex:1, padding:"12px", borderRadius:"10px",
                border: imposterCount === n ? "2px solid var(--green)" : "2px solid var(--border)",
                background: imposterCount === n ? "var(--green-dim)" : "var(--surface2)",
                color: imposterCount === n ? "var(--green)" : "var(--text-muted)",
                fontFamily:"var(--font-display)", fontSize:"1.3rem", cursor:"pointer"
              }}>{n}</button>
            ))}
          </div>
          <div style={{fontSize:"0.8rem", color:"var(--text-muted)", marginTop:8, textAlign:"center"}}>
            {imposterCount} imposter{imposterCount > 1 ? "s" : ""} out of {players.length} players
          </div>
        </div>
      )}
      {error && <div className="error-msg">⚠️ {error}</div>}
      {isHost ? (
        <button className="btn btn-primary" onClick={handleStart} disabled={players.length < 3}>
          ▶ START GAME
        </button>
      ) : (
        <div className="waiting pulse" style={{textAlign:"center"}}>
          Waiting for host to start...
        </div>
      )}
      <button className="btn btn-secondary" style={{marginTop:"auto"}} onClick={onBack}>
        ← Leave Room
      </button>
    </div>
  );
}

function QuestionScreen({ question, players, code, onAllSeen }) {
  const [ready, setReady] = useState(false);
  const [readyCount, setReadyCount] = useState(0);

  useEffect(() => {
    const sock = getSocket();
    const handleSeen = ({ seen }) => setReadyCount(seen);
    const handleDiscuss = () => onAllSeen();
    sock.on("seen_update", handleSeen);
    sock.on("phase_discuss", handleDiscuss);
    return () => {
      sock.off("seen_update", handleSeen);
      sock.off("phase_discuss", handleDiscuss);
    };
  }, [onAllSeen]);

  const handleReady = () => {
    if (ready) return;
    setReady(true);
    getSocket().emit("seen_question", { code });
  };

  return (
    <div className="screen">
      <div>
        <div className="logo" style={{fontSize:"2rem"}}>YOUR QUESTION</div>
        <div className="subtitle">Read it — don't show anyone!</div>
      </div>
      <div className="question-box">
        <div className="question-label">YOUR QUESTION IS</div>
        <div className="question-text">{question}</div>
      </div>
      <div className="card" style={{fontSize:"0.85rem", color:"var(--text-muted)", textAlign:"center"}}>
        📌 Remember your question. Discuss with the group but don't reveal it directly!
      </div>
      <button className="btn btn-primary" onClick={handleReady} disabled={ready}>
        {ready ? "✅ Waiting for others..." : "✋ I'm Ready to Vote"}
      </button>
      {ready && (
        <div className="seen-counter">
          <strong>{readyCount}</strong>/{players.length} players ready...
        </div>
      )}
    </div>
  );
}

function DiscussScreen({ isHost, code, players, normalQuestion, onVote }) {
  useEffect(() => {
    const sock = getSocket();
    const handleVote = ({ players }) => onVote(players);
    sock.on("phase_vote", handleVote);
    return () => sock.off("phase_vote", handleVote);
  }, [onVote]);

  return (
    <div className="screen">
      <div>
        <div className="logo" style={{fontSize:"2rem"}}>DISCUSS</div>
        <div className="subtitle">Talk it out — who's the imposter?</div>
      </div>
   <div className="question-box">
        <div className="question-label">THE QUESTION</div>
        <div className="question-text">{normalQuestion}</div>
      </div>
        <div style={{fontSize:"0.9rem", color:"var(--text-muted)", lineHeight:1.7}}>
          ✅ Describe your question without saying it directly<br/>
          ✅ Ask others about their answers<br/>
          ❌ Don't reveal your exact question<br/>
          😈 Try to catch the imposter!
        </div>
      </div>
      <div className="card">
        <div className="card-title">PLAYERS</div>
        <div className="player-list">
          {players.map(p => (
            <div className="player-item" key={p.id}>
              <div className="player-avatar">{getEmoji(p.name)}</div>
              <span className="player-name">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
      {isHost ? (
        <button className="btn btn-gold" onClick={() => getSocket().emit("start_vote", { code })}>
          🗳 START VOTING
        </button>
      ) : (
        <div className="waiting pulse" style={{textAlign:"center"}}>
          Waiting for host to start voting...
        </div>
      )}
    </div>
  );
}

function VoteScreen({ players, myId, code, imposterCount, onReveal }) {
  const [votes, setVotes] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [voteCount, setVoteCount] = useState(0);
      
  useEffect(() => {
    const sock = getSocket();
    const handleVoteUpdate = ({ voteCount }) => setVoteCount(voteCount);
    const handleReveal = (data) => onReveal(data);
    sock.on("vote_update", handleVoteUpdate);
    sock.on("phase_reveal", handleReveal);
    return () => {
      sock.off("vote_update", handleVoteUpdate);
      sock.off("phase_reveal", handleReveal);
    };
  }, [onReveal]);

  const handleVote = (id) => {
    if (voted) return;
    setVoted(id);
    getSocket().emit("submit_vote", { code, votedId: id });
  };

  const others = players.filter(p => p.id !== myId);

  return (
    <div className="screen">
      <div>
        <div className="logo" style={{fontSize:"2rem"}}>VOTE</div>
        <div className="subtitle">Who do you think is the imposter?</div>
      </div>
      {!voted ? (
        <div className="vote-list">
          {others.map(p => (
            <button key={p.id} className="vote-btn" onClick={() => handleVote(p.id)}>
              <span style={{fontSize:"1.3rem"}}>{getEmoji(p.name)}</span>
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="card" style={{textAlign:"center"}}>
          <div style={{fontSize:"2rem", marginBottom:8}}>✅</div>
          <div style={{fontWeight:700}}>Vote submitted!</div>
          <div className="seen-counter" style={{marginTop:8}}>
            <strong>{voteCount}</strong>/{players.length} votes in...
          </div>
          <div className="waiting pulse" style={{marginTop:8}}>Waiting for others...</div>
        </div>
      )}
    </div>
  );
}

function RevealScreen({ data, isHost, code, onPlayAgain }) {
  const { imposters, normalQuestion, imposterQuestion, imposterCaught, tally, players } = data;

  useEffect(() => {
    const sock = getSocket();
    const handleLobby = ({ players }) => onPlayAgain(players);
    sock.on("back_to_lobby", handleLobby);
    return () => sock.off("back_to_lobby", handleLobby);
  }, [onPlayAgain]);

  const maxVotes = Math.max(...Object.values(tally || {1:1}), 1);

  return (
    <div className="screen">
      <div className={`reveal-banner ${imposterCaught ? "caught" : "escaped"}`}>
        <div className="reveal-emoji">{imposterCaught ? "🎉" : "😈"}</div>
        <div className="reveal-title">{imposterCaught ? "CAUGHT!" : "ESCAPED!"}</div>
        <div style={{fontSize:"0.95rem", color:"var(--text-muted)", marginTop:8}}>
          {imposterCaught
            ? "The imposter" + (imposters?.length > 1 ? "s were " : " was ") + imposters?.map(p => p.name).join(" & ") + "!"
            : imposters?.map(p => p.name).join(" & ") + " fooled everyone!"}
        </div>
      </div>
      <div className="card">
        <div className="card-title">THE QUESTIONS</div>
        <div className="q-compare">
          <div className="q-box normal">
            <div className="qlabel">✅ Normal</div>
            <div className="qtext">{normalQuestion}</div>
          </div>
          <div className="q-box imposter-q">
            <div className="qlabel">🎭 Imposter</div>
            <div className="qtext">{imposterQuestion}</div>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-title">VOTE TALLY</div>
        <div className="vote-tally">
          {players.map(p => {
            const count = tally?.[p.id] || 0;
            const isImposter = imposters?.some(i => i.id === p.id);
            return (
              <div className="tally-row" key={p.id}>
                <div className="tally-name" style={{color: isImposter ? "var(--red)" : "var(--text)"}}>
                  {getEmoji(p.name)} {p.name}{isImposter ? " 🎭" : ""}
                </div>
                <div className="tally-bar-wrap">
                  <div className={"tally-bar" + (isImposter ? " imposter" : "")} style={{width: (count/maxVotes*100) + "%"}} />
                </div>
                <div className="tally-count">{count}</div>
              </div>
            );
          })}
        </div>
      </div>
      {isHost ? (
        <button className="btn btn-primary" onClick={() => getSocket().emit("play_again", { code })}>
          🔄 PLAY AGAIN
        </button>
      ) : (
        <div className="waiting pulse" style={{textAlign:"center"}}>
          Waiting for host to restart...
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [roomCode, setRoomCode] = useState("");
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [myQuestion, setMyQuestion] = useState("");
const [revealData, setRevealData] = useState(null);
  const [normalQuestion, setNormalQuestion] = useState("");
  const [imposterCount, setImposterCount] = useState(1);
  const myIdRef = useRef(null);

  useEffect(() => {
    const sock = getSocket();
    const handleConnect = () => { myIdRef.current = sock.id; };
    if (sock.connected) myIdRef.current = sock.id;
    sock.on("connect", handleConnect);
    return () => sock.off("connect", handleConnect);
  }, []);

  useEffect(() => {
    const sock = getSocket();
   const handleGameStarted = ({ question, players, normalQuestion, imposterCount }) => {
      setMyQuestion(question);
      setPlayers(players);
      setNormalQuestion(normalQuestion);
      setImposterCount(imposterCount);
      setScreen("question");
    };
    sock.on("game_started", handleGameStarted);
    return () => sock.off("game_started", handleGameStarted);
  }, []);

  const handleJoin = ({ code, players, isHost }) => {
    setRoomCode(code);
    setPlayers(players);
    setIsHost(isHost);
    setScreen("lobby");
  };

  if (screen === "home") return <HomeScreen onJoin={handleJoin} />;
  if (screen === "lobby") return <LobbyScreen code={roomCode} players={players} isHost={isHost} onBack={() => setScreen("home")} />;
  if (screen === "question") return <QuestionScreen question={myQuestion} players={players} code={roomCode} onAllSeen={() => setScreen("discuss")} />;
if (screen === "discuss") return <DiscussScreen isHost={isHost} code={roomCode} players={players} normalQuestion={normalQuestion} onVote={(p) => { setPlayers(p); setScreen("vote"); }} />;
  if (screen === "vote") return <VoteScreen players={players} myId={myIdRef.current} code={roomCode} imposterCount={imposterCount} onReveal={(data) => { setRevealData(data); setScreen("reveal"); }} />;
  if (screen === "reveal") return <RevealScreen data={revealData} isHost={isHost} code={roomCode} onPlayAgain={(p) => { setPlayers(p); setScreen("lobby"); }} />;
  return null;
}
