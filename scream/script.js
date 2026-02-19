/* ==========================================================
   SCREAM EXPERIENCE - WebPrime
   script.js - Chat Professor + Reveal progressif
   ========================================================== */

// ==================== CONFIG ====================
const CONFIG = {
  typingDelay: 1200,
  afterTypingDelay: 400,
  correctDelay: 800,
  wrongDelay: 600,
  victoryWait: 3000,
  redirectDelay: 2000,
  revealSteps: [
    { opacity: 0.95, blur: 20 },  // départ
    { opacity: 0.78, blur: 16 },  // Q1 réussie
    { opacity: 0.60, blur: 12 },  // Q2 réussie
    { opacity: 0.40, blur: 7 },   // Q3 réussie
    { opacity: 0.20, blur: 3 },   // Q4 réussie
    { opacity: 0, blur: 0 },      // Q5 réussie = site révélé
  ],
};

// ==================== DONNÉES DES QUESTIONS ====================
const questions = [
  {
    text: "Seulement 10% des sites peuvent être en première page Google, pour y être tu fais quoi ?",
    answers: [
      { letter: "A", text: "Tu fais appel à un expert SEO qui sait ce qu'il fait" },
      { letter: "B", text: "Tu attends que ça vienne tout seul" },
      { letter: "C", text: "Tu achètes de la pub et tu pries" }
    ],
    correct: 0,
    goodReaction: "Pas mal... tu commences à comprendre.",
    errorMsg: "MAUVAIS CALCUL ! Pendant ce temps, tes concurrents te dévorent... FUIS !"
  },
  {
    text: "Une agence qui te PROUVE ses résultats SEO en vidéo, tu dis...",
    answers: [
      { letter: "A", text: "C'est du bluff" },
      { letter: "B", text: "Tout le monde peut faire ça" },
      { letter: "C", text: "Ça inspire confiance, les preuves comptent" }
    ],
    correct: 2,
    goodReaction: "Bien vu. Les preuves ne mentent pas.",
    errorMsg: "FAUX ! Les amateurs parlent, les pros prouvent... PARS D'ICI !"
  },
  {
    text: "Avoir une galerie avec + de 200 mots-clés en première page Google, c'est...",
    answers: [
      { letter: "A", text: "De la chance" },
      { letter: "B", text: "Le résultat d'une vraie expertise SEO" },
      { letter: "C", text: "Impossible pour une petite agence" }
    ],
    correct: 1,
    goodReaction: "Exactement. Le travail paie toujours.",
    errorMsg: "ERREUR ! Les résultats parlent d'eux-mêmes... QUITTE CE SITE !"
  },
  {
    text: "Si ton business dépend de ton site web, tu confies ça à...",
    answers: [
      { letter: "A", text: "Ton cousin qui « s'y connaît »" },
      { letter: "B", text: "Personne, tu te débrouilles sur Wix" },
      { letter: "C", text: "Un pro qui maîtrise la création de sites ET la sécurité" }
    ],
    correct: 2,
    goodReaction: "Tu me plais. Tu sais reconnaître un vrai pro.",
    errorMsg: "MAUVAIS CHOIX ! Scream déteste les amateurs... AU REVOIR !"
  },
  {
    text: "Tu penses qu'avoir un beau site suffit pour ramener des clients ?",
    answers: [
      { letter: "A", text: "Non, il faut aussi du SEO, du marketing et de la stratégie" },
      { letter: "B", text: "Oui, c'est évident !" },
      { letter: "C", text: "Un site ça vend tout seul" }
    ],
    correct: 0,
    goodReaction: "Impressionnant... Tu mérites de voir ce qui se cache derrière.",
    errorMsg: "FAUX ! Un site sans stratégie, c'est une vitrine dans le désert... QUITTE CE SITE !"
  }
];

// ==================== DOM ELEMENTS ====================
const chatMessages = document.getElementById('chat-messages');
const chatAnswers = document.getElementById('chat-answers');
const siteOverlay = document.getElementById('site-overlay');
const progressFill = document.getElementById('progress-fill');
const victoryMessage = document.getElementById('victory-message');
const chatZone = document.getElementById('chat-zone');

// ==================== GAME STATE ====================
let currentQuestion = 0;
let isAnswering = false;

// ==================== UTILITAIRES ====================
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ==================== CRÉER UNE BULLE GHOSTFACE ====================
function createGhostBubble(text, extraClass = '') {
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble bubble-ghost ${extraClass}`.trim();
  bubble.innerHTML = `
    <div class="ghost-header">
      <div class="ghost-avatar"><img src="webprime.webp" alt="Professor"></div>
      <span class="ghost-name">Professor</span>
    </div>
    <div class="ghost-text">${text}</div>
  `;
  return bubble;
}

// ==================== TYPING INDICATOR ====================
function showTyping() {
  const typing = document.createElement('div');
  typing.className = 'typing-indicator';
  typing.id = 'typing';
  typing.innerHTML = `
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
  `;
  chatMessages.appendChild(typing);
  scrollToBottom();
}

function hideTyping() {
  const typing = document.getElementById('typing');
  if (typing) typing.remove();
}

// ==================== ENVOYER UN MESSAGE GHOSTFACE ====================
async function sendGhostMessage(text, extraClass = '') {
  showTyping();
  await sleep(CONFIG.typingDelay);
  hideTyping();

  const bubble = createGhostBubble(text, extraClass);
  chatMessages.appendChild(bubble);
  scrollToBottom();
  await sleep(CONFIG.afterTypingDelay);
}

// ==================== ENVOYER UN MESSAGE UTILISATEUR ====================
function sendUserMessage(text) {
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble bubble-user';
  bubble.textContent = text;
  chatMessages.appendChild(bubble);
  scrollToBottom();
}

// ==================== REVEAL DU SITE ====================
function updateReveal(step) {
  const r = CONFIG.revealSteps[step];
  siteOverlay.style.background = `rgba(0, 0, 0, ${r.opacity})`;
  siteOverlay.style.backdropFilter = `blur(${r.blur}px)`;
}

// ==================== AFFICHER LES RÉPONSES ====================
function showAnswers(q) {
  chatAnswers.innerHTML = '';
  q.answers.forEach((answer, index) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.innerHTML = `
      <span class="answer-letter">${answer.letter}</span>
      <span class="answer-text">${answer.text}</span>
    `;
    btn.addEventListener('click', () => handleAnswer(index));
    chatAnswers.appendChild(btn);
  });
}

// ==================== GESTION DES RÉPONSES ====================
async function handleAnswer(ansIndex) {
  if (isAnswering) return;
  isAnswering = true;

  const q = questions[currentQuestion];

  // Afficher la réponse de l'utilisateur
  sendUserMessage(q.answers[ansIndex].text);
  chatAnswers.innerHTML = '';

  if (ansIndex === q.correct) {
    // Bonne réponse
    currentQuestion++;

    // Barre de progression
    progressFill.style.width = (currentQuestion / questions.length) * 100 + '%';

    // Reveal progressif
    updateReveal(currentQuestion);

    // Réaction de Professor
    await sendGhostMessage(q.goodReaction, 'reaction-good');

    if (currentQuestion >= questions.length) {
      showVictory();
    } else {
      // Question suivante
      await sendGhostMessage(questions[currentQuestion].text, 'question');
      showAnswers(questions[currentQuestion]);
      isAnswering = false;
    }

  } else {
    // Mauvaise réponse - effets
    triggerErrorEffects();

    await sendGhostMessage(q.errorMsg, 'reaction-bad');
    await sleep(2000);
    window.location.href = 'https://www.google.com';
  }
}

// ==================== EFFETS MAUVAISE RÉPONSE ====================
function triggerErrorEffects() {
  document.body.classList.add('screen-shake');
  setTimeout(() => document.body.classList.remove('screen-shake'), 600);

  document.body.classList.add('red-flash');
  setTimeout(() => document.body.classList.remove('red-flash'), 800);

  document.body.classList.add('glitch-effect');
  setTimeout(() => document.body.classList.remove('glitch-effect'), 1500);
}

// ==================== VICTOIRE ====================
function showVictory() {
  chatZone.classList.add('fade-out');
  victoryMessage.classList.remove('hidden');

  // Particules disparaissent
  document.getElementById('particles').style.transition = 'opacity 1.5s ease';
  document.getElementById('particles').style.opacity = '0';

  setTimeout(() => {
    victoryMessage.classList.add('hidden');

    // Marquer le quiz comme terminé
    sessionStorage.setItem('screamDone', 'true');

    setTimeout(() => {
      window.location.href = '../index.html';
    }, CONFIG.redirectDelay);
  }, CONFIG.victoryWait);
}

// ==================== LANCEMENT ====================
document.addEventListener('DOMContentLoaded', async () => {
  // Overlay initial
  updateReveal(0);

  // Professor commence la conversation
  await sendGhostMessage("Bienvenue... si tu oses.");
  await sendGhostMessage("Réponds à mes 5 questions pour accéder au site. Une seule erreur et... tu disparais.");
  await sendGhostMessage(questions[0].text, 'question');

  // Afficher les réponses de la première question
  showAnswers(questions[0]);
});
