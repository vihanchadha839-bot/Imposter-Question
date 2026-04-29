const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const QUESTIONS = [
  { normal: "What's something you do in private you'd NEVER admit in public?", imposter: "What's something you do in public you'd never admit to your mum?" },
  { normal: "What's the most embarrassing thing in your search history?", imposter: "What's the most embarrassing thing in your camera roll?" },
  { normal: "Name a red flag you 100% ignored in a relationship", imposter: "Name a green flag that turned out to be a massive red flag" },
  { normal: "What would your ex say about you behind your back?", imposter: "What would your situationship say about you?" },
  { normal: "Name something people lie about on their dating profile", imposter: "Name something people lie about on their CV" },
  { normal: "What's the worst excuse you've used to cancel plans?", imposter: "What's the worst excuse you've used to leave a party early?" },
  { normal: "What do people do when they think no one is watching?", imposter: "What do people do when they think no one is listening?" },
  { normal: "Name something people pretend to understand but absolutely don't", imposter: "Name something people pretend to like but secretly hate" },
  { normal: "What's something you'd only admit when you're drunk?", imposter: "What's something you'd only admit to your best friend at 3am?" },
  { normal: "What would your pet say about you if it could talk?", imposter: "What would your neighbour say about you if they were brutally honest?" },
  { normal: "Name a sign someone was definitely raised wrong", imposter: "Name a sign someone peaked in secondary school" },
  { normal: "What's the worst text to accidentally send your boss?", imposter: "What's the worst thing to accidentally post publicly instead of on your close friends?" },
  { normal: "What do people Google at 2am that they'd never say out loud?", imposter: "What do people search on YouTube at 3am?" },
  { normal: "Name something that makes someone instantly unlikeable", imposter: "Name something that makes someone instantly suspicious" },
  { normal: "What's the most passive aggressive gift you could give someone?", imposter: "What's the most passive aggressive thing to write in a birthday card?" },
  { normal: "Name a sentence that would ruin a first date instantly", imposter: "Name a sentence that would end a friendship on the spot" },
  { normal: "What's the most unhinged thing someone could order at McDonald's?", imposter: "What's the most chaotic thing someone could order at a fancy restaurant?" },
  { normal: "What would a villain's morning routine look like?", imposter: "What would a villain's Spotify wrapped look like?" },
  { normal: "Name the worst possible thing to say at a funeral", imposter: "Name the worst possible thing to say in a wedding speech" },
  { normal: "What does your Spotify wrapped say about your personality?", imposter: "What does your Netflix history say about your mental state?" },
  { normal: "Name something only broke people relate to", imposter: "Name something only extremely online people relate to" },
  { normal: "Name a job that sounds fun but is actually miserable", imposter: "Name a job that sounds boring but is secretly amazing" },
  { normal: "Name a sign someone is having a quarter-life crisis", imposter: "Name a sign someone is having a midlife crisis" },
  { normal: "What's the most suspicious thing to buy at a supermarket at midnight?", imposter: "What's the most suspicious thing to search on Amazon?" },
  { normal: "Name something people do at 2am that they regret by 8am", imposter: "Name something people do on a Sunday they regret on Monday morning" },
  { normal: "What's something you've done that you'd take to the grave?", imposter: "What's something you've witnessed that you'd take to the grave?" },
  { normal: "Name a totally normal thing that becomes weird when you think about it too long", imposter: "Name something everyone does but no one talks about" },
  { normal: "What's your villain trait that you try to hide?", imposter: "What's your main character trait that others find annoying?" },
  { normal: "What would the warning label on you say?", imposter: "What would your terms and conditions say if you were an app?" },
  { normal: "Name something that hits different at 3am", imposter: "Name something that hits different when you're sick" },
  { normal: "Name a footballer who definitely has main character energy", imposter: "Name a footballer who gives background character energy" },
  { normal: "What would a footballer post on their finsta?", imposter: "What would a football manager post if they had a secret Twitter?" },
  { normal: "Name something Ronaldo does that Messi would never", imposter: "Name something Messi does that Ronaldo would never" },
  { normal: "Name a footballer who looks like they smell amazing", imposter: "Name a footballer who looks like they'd be terrible at cooking" },
  { normal: "What would a footballer's dating profile bio say?", imposter: "What would a football pundit's dating profile say?" },
  { normal: "Name a footballer who would definitely ghost you", imposter: "Name a footballer who would definitely be way too clingy" },
  { normal: "Name a football celebration that looks ridiculous in slow motion", imposter: "Name a football celebration that looks cool but means nothing" },
  { normal: "Name a celebrity that definitely has a weird hidden hobby", imposter: "Name a celebrity that definitely has a chaotic group chat" },
  { normal: "What would Taylor Swift write a song about if she dated you?", imposter: "What would Drake write a diss track about if he met you?" },
  { normal: "Name a reality TV show that describes your life perfectly", imposter: "Name a reality TV show that describes your friendship group" },
  { normal: "What would your villain origin story be?", imposter: "What would your redemption arc look like?" },
  { normal: "Name a movie character you'd be in a horror film", imposter: "Name a movie character you'd be in a heist film" },
  { normal: "Name a celebrity you could definitely beat in a fight", imposter: "Name a celebrity who could definitely destroy you in a fight" },
  { normal: "What song plays when you walk into a room?", imposter: "What song plays when you leave a room?" },
  { normal: "Name a Disney villain who was actually right", imposter: "Name a Disney hero who was actually kind of terrible" },
  { normal: "If your personality was a food, what would it be?", imposter: "If your energy was a weather forecast, what would it say?" },
  { normal: "What's the most unhinged thing you believe that you can't prove?", imposter: "What's the most controversial opinion you hold that you think is correct?" },
  { normal: "If you had to describe yourself using only a font, which font are you?", imposter: "If you had to describe yourself using only one emoji, which one?" },
  { normal: "If your friendship group was a sitcom, what would it be called?", imposter: "If your friendship group was a documentary, what would it expose?" },
  { normal: "Name something that exists that really shouldn't", imposter: "Name something that doesn't exist but really should" },
  { normal: "What would you do with a free hour if no one would ever find out?", imposter: "What would you do with 1000 pounds if no one would ever find out?" },
  { normal: "Name a smell that unlocks a core memory", imposter: "Name a song that unlocks a core memory you'd rather forget" },
  { normal: "Name something that was better before it became popular", imposter: "Name something that only got good once everyone started doing it" },
  { normal: "Name something you do that you'd be embarrassed if it was on CCTV", imposter: "Name something you'd do differently if you knew you were being filmed" },
  { normal: "What's the most unserious reason you've ended a friendship?", imposter: "What's the most unserious reason you've fallen out with someone?" },
  { normal: "What's something your body does that you have no explanation for?", imposter: "What's something your brain does that you have absolutely no control over?" },
  { normal: "What's the most unhinged thing someone has said to you like it was normal?", imposter: "What's the most unhinged thing you've said to someone like it was completely normal?" },
  { normal: "Name something that's technically legal but feels like it really shouldn't be", imposter: "Name something that's technically free but feels like stealing" },
  { normal: "What's something everyone thinks is normal but is actually insane if you think about it?", imposter: "What's something society fully accepts that makes absolutely no sense?" },
  { normal: "What would your Roman Empire be?", imposter: "What do you think about more than you'd ever admit?" },
  { normal: "Name something you do before bed that no one knows about", imposter: "Name something you do first thing in the morning that you're embarrassed by" },
  { normal: "What's the most unserious hill you would die on?", imposter: "What's the most irrational thing you genuinely believe?" },
  { normal: "Name a character from a kids show that clearly has unresolved trauma", imposter: "Name a kids show that was definitely not made for kids" },
  { normal: "What's the most embarrassing thing you've done to impress someone?", imposter: "What's the most embarrassing thing you've done when you thought you were alone?" },
];

const rooms = {};
const usedQuestions = {};

function generateCode() {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

function getRandomQuestion(code) {
  if (!usedQuestions[code]) usedQuestions[code] = new Set();
  if (usedQuestions[code].size >= QUESTIONS.length) usedQuestions[code].clear();
  let idx;
  do {
    idx = Math.floor(Math.random() * QUESTIONS.length);
  } while (usedQuestions[code].has(idx));
  usedQuestions[code].add(idx);
  return QUESTIONS[idx];
}

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("create_room", ({ name }) => {
    const code = generateCode();
    rooms[code] = {
      code,
      players: [{ id: socket.id, name, isHost: true }],
      phase: "lobby",
      imposter: null,
      question: null,
      votes: {},
      seenCount: 0,
    };
    socket.join(code);
    io.to(code).emit("room_joined", { code, players: rooms[code].players, isHost: true });
    console.log("Room created:", code, "by", name);
  });

  socket.on("join_room", ({ name, code }) => {
    const room = rooms[code];
    if (!room) return socket.emit("error", "Room not found");
    if (room.phase !== "lobby") return socket.emit("error", "Game already started");
    if (room.players.length >= 8) return socket.emit("error", "Room is full");
    room.players.push({ id: socket.id, name, isHost: false });
    socket.join(code);
    socket.emit("room_joined", { code, players: room.players, isHost: false });
    io.to(code).emit("players_updated", room.players);
    console.log(name, "joined room", code);
  });

  socket.on("start_game", ({ code }) => {
    const room = rooms[code];
    if (!room) return;
    if (room.players.length < 3) return socket.emit("error", "Need at least 3 players");
    const imposterIndex = Math.floor(Math.random() * room.players.length);
    room.imposter = room.players[imposterIndex].id;
    room.question = getRandomQuestion(code);
    room.phase = "question";
    room.seenCount = 0;
    room.votes = {};
    room.players.forEach((p) => {
      const q = p.id === room.imposter ? room.question.imposter : room.question.normal;
      io.to(p.id).emit("game_started", { question: q, players: room.players });
    });
    console.log("Game started in room", code);
  });

  socket.on("seen_question", ({ code }) => {
    const room = rooms[code];
    if (!room) return;
    room.seenCount++;
    io.to(code).emit("seen_update", { seen: room.seenCount, total: room.players.length });
    if (room.seenCount >= room.players.length) {
      room.phase = "discuss";
      io.to(code).emit("phase_discuss");
    }
  });

  socket.on("start_vote", ({ code }) => {
    const room = rooms[code];
    if (!room) return;
    room.phase = "vote";
    io.to(code).emit("phase_vote", { players: room.players });
  });

  socket.on("submit_vote", ({ code, votedId }) => {
    const room = rooms[code];
    if (!room) return;
    room.votes[socket.id] = votedId;
    const voteCount = Object.keys(room.votes).length;
    io.to(code).emit("vote_update", { voteCount, total: room.players.length });
    if (voteCount >= room.players.length) {
      const tally = {};
      Object.values(room.votes).forEach((id) => {
        tally[id] = (tally[id] || 0) + 1;
      });
      const mostVoted = Object.entries(tally).sort((a, b) => b[1] - a[1])[0][0];
      const imposterCaught = mostVoted === room.imposter;
      const imposterPlayer = room.players.find((p) => p.id === room.imposter);
      room.phase = "reveal";
      io.to(code).emit("phase_reveal", {
        imposter: imposterPlayer,
        normalQuestion: room.question.normal,
        imposterQuestion: room.question.imposter,
        imposterCaught,
        tally,
        players: room.players,
      });
    }
  });

  socket.on("play_again", ({ code }) => {
    const room = rooms[code];
    if (!room) return;
    room.phase = "lobby";
    room.imposter = null;
    room.question = null;
    room.votes = {};
    room.seenCount = 0;
    io.to(code).emit("back_to_lobby", { players: room.players });
  });

  socket.on("disconnect", () => {
    for (const code in rooms) {
      const room = rooms[code];
      const idx = room.players.findIndex((p) => p.id === socket.id);
      if (idx === -1) continue;
      room.players.splice(idx, 1);
      if (room.players.length === 0) {
        delete rooms[code];
        delete usedQuestions[code];
      } else {
        if (idx === 0) room.players[0].isHost = true;
        io.to(code).emit("players_updated", room.players);
      }
      break;
    }
    console.log("Disconnected:", socket.id);
  });
});

app.get("/", (req, res) => res.send("Snitch Game Server Running"));

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log("Server on port", PORT));
