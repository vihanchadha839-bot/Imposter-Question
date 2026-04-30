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
  { normal: "What's something you do in private you'd never admit?", imposter: "What's something you do alone at home you'd never admit?" },
  { normal: "What's the most embarrassing thing in your search history?", imposter: "What's the most embarrassing thing in your browser history?" },
  { normal: "Name a red flag you ignored in a relationship", imposter: "Name a red flag you ignored in a friendship" },
  { normal: "What would your ex say about you behind your back?", imposter: "What would your best friend say about you behind your back?" },
  { normal: "Name something people lie about on their dating profile", imposter: "Name something people exaggerate on their dating profile" },
  { normal: "What's the worst excuse you've used to cancel plans?", imposter: "What's the worst excuse you've used to avoid someone?" },
  { normal: "What do people do when they think no one is watching?", imposter: "What do people do when they think no one is listening?" },
  { normal: "Name something people pretend to understand but don't", imposter: "Name something people pretend to enjoy but secretly hate" },
  { normal: "What's something you'd only admit when you're drunk?", imposter: "What's something you'd only admit to your closest friend?" },
  { normal: "What would your pet say about you if it could talk?", imposter: "What would your sibling say about you if they were brutally honest?" },
  { normal: "Name a sign someone was raised badly", imposter: "Name a sign someone had strict parents growing up" },
  { normal: "What's the worst text to accidentally send your boss?", imposter: "What's the worst text to accidentally send your teacher?" },
  { normal: "What do people Google at 2am that they'd never say out loud?", imposter: "What do people search at 3am that they'd never admit?" },
  { normal: "Name something that makes someone instantly unlikeable", imposter: "Name something that makes someone instantly annoying" },
  { normal: "What's the most passive aggressive gift you could give?", imposter: "What's the most passive aggressive thing to say to someone?" },
  { normal: "Name a sentence that would ruin a first date", imposter: "Name a sentence that would ruin a second date" },
  { normal: "What's the most unhinged thing to order at McDonald's?", imposter: "What's the most unhinged thing to order at KFC?" },
  { normal: "What would a villain's morning routine look like?", imposter: "What would a villain's bedtime routine look like?" },
  { normal: "Name the worst thing to say at a funeral", imposter: "Name the worst thing to say at a memorial service" },
  { normal: "What does your Spotify wrapped say about your personality?", imposter: "What does your YouTube history say about your personality?" },
  { normal: "Name something only broke people relate to", imposter: "Name something only people with no money understand" },
  { normal: "Name a job that sounds fun but is actually miserable", imposter: "Name a job that looks glamorous but is actually stressful" },
  { normal: "Name a sign someone is having a quarter-life crisis", imposter: "Name a sign someone is having a midlife crisis" },
  { normal: "What's the most suspicious thing to buy at a supermarket at midnight?", imposter: "What's the most suspicious thing to buy at a pharmacy?" },
  { normal: "Name something people do at 2am they regret at 8am", imposter: "Name something people do on Saturday night they regret Sunday morning" },
  { normal: "What's something you've done you'd take to the grave?", imposter: "What's something you've said you'd take to the grave?" },
  { normal: "Name something normal that gets weird if you think too long", imposter: "Name a word that sounds wrong the more you say it" },
  { normal: "What's your villain trait you try to hide?", imposter: "What's your worst habit you try to hide from people?" },
  { normal: "What would the warning label on you say?", imposter: "What would the instruction manual for you say?" },
  { normal: "Name something that hits different at 3am", imposter: "Name something that hits different when you're tired" },
  { normal: "Name a footballer with main character energy", imposter: "Name a footballer who acts like the main character but isn't" },
  { normal: "What would a footballer post on their finsta?", imposter: "What would a footballer post on their private story?" },
  { normal: "Name something Ronaldo does that Messi would never", imposter: "Name something Messi does that Ronaldo would never" },
  { normal: "Name a footballer who looks like they smell amazing", imposter: "Name a footballer who looks like they take forever to get ready" },
  { normal: "What would a footballer's dating profile say?", imposter: "What would a footballer's Hinge profile say?" },
  { normal: "Name a footballer who would definitely ghost you", imposter: "Name a footballer who would leave you on read" },
  { normal: "Name a football celebration that looks ridiculous in slow motion", imposter: "Name a football celebration that looks stupid but everyone does it" },
  { normal: "Name a celebrity with a weird hidden hobby", imposter: "Name a celebrity with a surprising secret talent" },
  { normal: "What would Taylor Swift write a song about if she dated you?", imposter: "What would Taylor Swift name an album about your life?" },
  { normal: "Name a reality TV show that describes your life", imposter: "Name a reality TV show that describes your personality" },
  { normal: "What would your villain origin story be?", imposter: "What event in your life could be a villain origin story?" },
  { normal: "Name a movie character you'd be in a horror film", imposter: "Name a horror film character you'd relate to most" },
  { normal: "Name a celebrity you could beat in a fight", imposter: "Name a celebrity you could outrun" },
  { normal: "What song plays when you walk into a room?", imposter: "What song plays when you enter a party?" },
  { normal: "Name a Disney villain who was actually right", imposter: "Name a Disney villain you secretly agreed with" },
  { normal: "If your personality was a food what would it be?", imposter: "If your vibe was a drink what would it be?" },
  { normal: "What's the most unhinged thing you believe that you can't prove?", imposter: "What's a weird theory you have that you can't prove?" },
  { normal: "If you had to describe yourself using only a font which would it be?", imposter: "If you had to describe yourself using only a colour which would it be?" },
  { normal: "If your friend group was a sitcom what would it be called?", imposter: "If your friend group was a reality show what would it be called?" },
  { normal: "Name something that exists that really shouldn't", imposter: "Name something that was invented that nobody asked for" },
  { normal: "What would you do with a free hour if no one found out?", imposter: "What would you do with a free day if no one was watching?" },
  { normal: "Name a smell that unlocks a core memory", imposter: "Name a song that instantly takes you back to a memory" },
  { normal: "Name something that was better before it got popular", imposter: "Name something that got ruined when everyone started doing it" },
  { normal: "Name something you do that you'd hate to see on CCTV", imposter: "Name something you do alone you'd be embarrassed if filmed" },
  { normal: "What's the most unserious reason you've ended a friendship?", imposter: "What's the most petty reason you've fallen out with someone?" },
  { normal: "What's something your body does you have no explanation for?", imposter: "What's something your brain does you have no control over?" },
  { normal: "What's the most unhinged thing someone said to you like it was normal?", imposter: "What's the most unhinged thing someone texted you like it was fine?" },
  { normal: "Name something technically legal that feels like it shouldn't be", imposter: "Name something completely legal that still feels wrong" },
  { normal: "What does everyone think is normal but is actually insane?", imposter: "What does society accept that makes no sense when you think about it?" },
  { normal: "What would your Roman Empire be?", imposter: "What's something you think about way more than you should?" },
  { normal: "Name something you do before bed no one knows about", imposter: "Name something you do at night you'd never tell anyone" },
  { normal: "What's the most unserious hill you'd die on?", imposter: "What's the most petty opinion you'd argue about forever?" },
  { normal: "Name a kids show character with unresolved trauma", imposter: "Name a cartoon character who definitely needs therapy" },
  { normal: "What's the most embarrassing thing you've done to impress someone?", imposter: "What's the cringiest thing you've done to get someone's attention?" },
  { normal: "What would you do if you found 50 pounds on the floor in public?", imposter: "What would you do if you found 50 pounds in an Uber?" },
  { normal: "Name something you do differently when no one else is in the house", imposter: "Name something you do differently when you're home alone at night" },
  { normal: "What's the most unserious thing you've cried about?", imposter: "What's the most embarrassing thing that's made you emotional?" },
  { normal: "Name a totally normal thing that feels illegal when you do it", imposter: "Name something you always feel guilty about even though it's fine" },
  { normal: "What would you do if you woke up and had 10 million in your account?", imposter: "What would you do if you woke up and had 1 million in your account?" },
  { normal: "Name something people do on their phone during a conversation", imposter: "Name something people do on their phone when they're bored of you" },
  { normal: "What's the most unhinged thing you've done when you were bored?", imposter: "What's the most chaotic thing you've done out of boredom?" },
  { normal: "Name a fictional character you'd be best friends with", imposter: "Name a fictional character you'd fall out with immediately" },
  { normal: "What's the worst thing about being the youngest sibling?", imposter: "What's the worst thing about being the oldest sibling?" },
  { normal: "Name something that sounds like a compliment but is actually an insult", imposter: "Name something that sounds like an insult but is actually a compliment" },
  { normal: "What's the most awkward thing that's happened to you in a lift?", imposter: "What's the most awkward thing that's happened to you on public transport?" },
  { normal: "Name a sign someone has never had to struggle in life", imposter: "Name a sign someone grew up with money" },
  { normal: "What's the most embarrassing thing autocorrect has done to you?", imposter: "What's the worst thing you've accidentally sent because of autocorrect?" },
  { normal: "Name something that always starts an argument at a family dinner", imposter: "Name something that always causes drama at a family gathering" },
  { normal: "What's a compliment that actually offends you?", imposter: "What's a nice thing someone said that secretly annoyed you?" },
  { normal: "Name something people do at the gym that is actually embarrassing", imposter: "Name something people do at the gym that no one talks about" },
  { normal: "What's the most unserious reason you've had a bad day?", imposter: "What's the most trivial thing that completely ruined your mood?" },
  { normal: "Name a phrase that immediately makes you distrust someone", imposter: "Name something someone says that instantly makes you suspicious" },
  { normal: "What's something everyone lies about on a first date?", imposter: "What's something people always pretend on a first date?" },
  { normal: "Name something that only children of immigrants understand", imposter: "Name something that only people from big families understand" },
  { normal: "What's the most unhinged group chat name you've been in?", imposter: "What's the most chaotic thing that's happened in a group chat you're in?" },
  {normal: "What's the most embarrassing thing you've done on a night out?", imposter: "What's the most embarrassing thing you've done at a party?" },
  { normal: "Name something you pretend to be good at but absolutely aren't", imposter: "Name something you claim to know about but actually don't" },
  { normal: "What's the worst thing someone has said to you that they thought was helpful?", imposter: "What's the worst advice someone has given you like it was brilliant?" },
  { normal: "Name a habit that says a lot about someone's personality", imposter: "Name a small thing someone does that tells you everything about them" },
  { normal: "What's the most unhinged purchase you've made when you were sad?", imposter: "What's the most impulsive thing you've bought online at night?" },
  { normal: "Name something you did as a kid that you now realise was unhinged", imposter: "Name something you did as a teenager that you cringe about now" },
  { normal: "What's the most awkward compliment you've ever received?", imposter: "What's the strangest thing someone has said to you thinking it was nice?" },
  { normal: "Name a movie everyone pretends to love but hasn't actually watched", imposter: "Name a book everyone claims to have read but hasn't" },
  { normal: "What's something you do to look busy when you're doing nothing?", imposter: "What's something you do to look productive when you're procrastinating?" },
  { normal: "Name the worst type of person to sit next to on a plane", imposter: "Name the worst type of person to sit next to on a long train journey" },
  { normal: "What's a skill you put on your CV that you'd panic if tested on?", imposter: "What's something you claimed you could do in a job interview that you can't?" },
  { normal: "Name something that hits different when it rains", imposter: "Name something that feels better on a cold dark evening" },
  { normal: "What's the most unserious injury you've dramatically overreacted to?", imposter: "What's the smallest pain you've acted like was unbearable?" },
  { normal: "Name a food combination that sounds wrong but is actually amazing", imposter: "Name a food combination everyone loves that you think is disgusting" },
  { normal: "What's the pettiest thing you've ever done to get back at someone?", imposter: "What's the most passive aggressive revenge you've taken on someone?" },
  { normal: "Name something that only people who grew up without money understand", imposter: "Name something that instantly tells you someone grew up poor" },
  { normal: "What's the most unhinged thing you've done because you were hungry?", imposter: "What's the most irrational decision you've made when you were starving?" },
  { normal: "Name a song that you secretly know every word to but would never admit", imposter: "Name a song you listen to alone that you'd never play in front of people" },
  { normal: "What's the most embarrassing thing you've done to stalk someone online?", imposter: "What's the deepest you've gone on someone's social media?" },
  { normal: "Name something that people in relationships do that annoys single people", imposter: "Name something couples do that secretly makes single people jealous" },
  { normal: "What's the worst thing you've said that you played off as a joke?", imposter: "What's something rude you said out loud that you pretended wasn't serious?" },
  { normal: "Name a sign someone is lying to your face", imposter: "Name a sign someone is not telling you the full story" },
  { normal: "What's the most unserious thing you've googled for health advice?", imposter: "What's the most ridiculous self-diagnosis you've given yourself?" },
  { normal: "Name something that automatically makes you respect someone less", imposter: "Name something small that makes you immediately judge someone" },
  { normal: "What's the worst text message you've ever sent to the wrong person?", imposter: "What's the most embarrassing thing you've posted thinking it was private?" },
  { normal: "Name a type of person who is always the problem in the group", imposter: "Name a type of friend who somehow always causes drama" },
  { normal: "What's something you wish you could say to someone but never will?", imposter: "What's something you've wanted to tell someone for years but haven't?" },
  { normal: "Name the most unhinged thing someone has asked you to keep secret", imposter: "Name the wildest thing someone has confessed to you" },
  { normal: "What's a totally normal thing that you are irrationally scared of?", imposter: "What's something completely harmless that genuinely makes you nervous?" },
  { normal: "Name something people do at a sleepover that they'd deny in daylight", imposter: "Name something people do at sleepovers that no one talks about after" },

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
    if (room.players.length >= 10) return socket.emit("error", "Room is full");
    room.players.push({ id: socket.id, name, isHost: false });
    socket.join(code);
    socket.emit("room_joined", { code, players: room.players, isHost: false });
    io.to(code).emit("players_updated", room.players);
    console.log(name, "joined room", code);
  });
  
socket.on("start_game", ({ code, imposterCount }) => {
    const room = rooms[code];
    if (!room) return;
    if (room.players.length < 3) return socket.emit("error", "Need at least 3 players");
    const count = Math.min(imposterCount || 1, Math.floor(room.players.length / 2));
    const shuffled = [...room.players].sort(() => Math.random() - 0.5);
    room.imposters = shuffled.slice(0, count).map(p => p.id);
    room.question = getRandomQuestion(code);
    room.phase = "question";
    room.seenCount = 0;
    room.votes = {};
    room.players.forEach((p) => {
      const isImposter = room.imposters.includes(p.id);
      const q = isImposter ? room.question.imposter : room.question.normal;
      io.to(p.id).emit("game_started", { question: q, players: room.players, isImposter, normalQuestion: room.question.normal, imposterCount: count });
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
      const imposterCaught = room.imposters.includes(mostVoted);
      const imposterPlayers = room.players.filter((p) => room.imposters.includes(p.id));
      room.phase = "reveal";
      io.to(code).emit("phase_reveal", {
        imposters: imposterPlayers,
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
    room.imposters = [];
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
