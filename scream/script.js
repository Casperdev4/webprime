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
    { opacity: 0.85, blur: 17 },  // Q1 réussie
    { opacity: 0.72, blur: 14 },  // Q2 réussie
    { opacity: 0.56, blur: 11 },  // Q3 réussie
    { opacity: 0.40, blur: 8 },   // Q4 réussie
    { opacity: 0.20, blur: 4 },   // Q5 réussie
    { opacity: 0, blur: 0 },      // Q6 réussie = site révélé
  ],
};

// ==================== QUESTIONS INTRO (aiguillage) ====================
const introQuestions = [
  {
    text: "Tu cherches quoi exactement ?",
    answers: [
      { letter: "A", text: "Un site internet" },
      { letter: "B", text: "Une application mobile" }
    ],
    reactions: [
      "Bien, tu es au bon endroit.",
      null // redirect
    ],
    redirectIndex: 1,
    redirectUrl: "../creation-application-mobile.html"
  },
  {
    text: "Tu es dans quel secteur ?",
    answers: [
      { letter: "A", text: "Artisan / BTP" },
      { letter: "B", text: "Commerce / Restaurant / Beauté" },
      { letter: "C", text: "Autre secteur d'activité" }
    ],
    reactions: [
      "Parfait, les artisans c'est notre spécialité.",
      "On connaît bien ton secteur.",
      "On s'adapte à tous les secteurs."
    ]
  }
];

// ==================== QUESTIONS QUIZ ====================
const questions = [
  {
    text: "Tu es artisan et tu veux des clients via internet. C'est quoi le PLUS important ?",
    answers: [
      { letter: "A", text: "Un beau site avec de jolies photos" },
      { letter: "B", text: "Être en 1ère page Google sur les mots-clés les plus recherchés de ton métier" },
      { letter: "C", text: "Poster sur les réseaux sociaux tous les jours" }
    ],
    correct: 1,
    goodReaction: "Exactement. Sans visibilité sur Google, ton site c'est une vitrine dans une ruelle que personne ne connaît.",
    errorMsg: "FAUX ! Un site que personne ne trouve, c'est un site qui n'existe pas... DÉGAGE !"
  },
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
    text: "Une agence web te promet la 1ère page Google. Tu fais quoi avant de signer ?",
    answers: [
      { letter: "A", text: "Tu signes direct, ils ont l'air sérieux" },
      { letter: "B", text: "Tu vérifies juste leur propre site" },
      { letter: "C", text: "Tu demandes les preuves : quels sites, quels mots-clés, quelles positions" }
    ],
    correct: 2,
    goodReaction: "Malin. 90% des agences ne peuvent PAS prouver leurs résultats. Nous on a une galerie de +200 preuves.",
    errorMsg: "NAÏF ! N'importe qui peut PROMETTRE la lune. Les preuves, c'est tout ce qui compte... FUIS !"
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
    text: "Pourquoi beaucoup d'artisans n'ont aucun appel malgré leur site web ?",
    answers: [
      { letter: "A", text: "Internet ça marche pas pour les artisans" },
      { letter: "B", text: "Leur site n'apparaît pas en 1ère page sur les bons mots-clés" },
      { letter: "C", text: "Ils n'ont pas assez de pages sur leur site" }
    ],
    correct: 1,
    goodReaction: "Voilà la vérité. Pas de visibilité = pas de clients. C'est aussi simple que ça.",
    errorMsg: "FAUX ! Le problème c'est jamais internet, c'est ceux qui ne savent pas l'utiliser... QUITTE CE SITE !"
  },
  {
    text: "Ton site est en 1ère page Google mais tu estimes ne pas recevoir assez d'appels. Tu fais quoi ?",
    answers: [
      { letter: "A", text: "Tu accuses ton développeur web, c'est forcément sa faute" },
      { letter: "B", text: "Tu vérifies tes offres, ta fiche Google et ton discours commercial" },
      { letter: "C", text: "Tu supprimes ton site, de toute façon ça sert à rien" }
    ],
    correct: 1,
    goodReaction: "Enfin quelqu'un qui réfléchit. Être premier sur Google c'est 50% du travail. Le reste, c'est TOI : tes offres, ton accueil téléphonique, tes avis clients.",
    errorMsg: "PATHÉTIQUE ! Tu es en 1ère page Google et tu te plains ?! Le problème c'est pas le site, c'est ce que TU en fais... DÉGAGE !"
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
let currentIntro = 0;
let isAnswering = false;
let introPhase = true;

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

// ==================== AFFICHER LES RÉPONSES (intro) ====================
function showIntroAnswers(q) {
  chatAnswers.innerHTML = '';
  q.answers.forEach((answer, index) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.innerHTML = `
      <span class="answer-letter">${answer.letter}</span>
      <span class="answer-text">${answer.text}</span>
    `;
    btn.addEventListener('click', () => handleIntroAnswer(index));
    chatAnswers.appendChild(btn);
  });
}

// ==================== GESTION RÉPONSES INTRO ====================
async function handleIntroAnswer(ansIndex) {
  if (isAnswering) return;
  isAnswering = true;

  const q = introQuestions[currentIntro];

  // Afficher la réponse de l'utilisateur
  sendUserMessage(q.answers[ansIndex].text);
  chatAnswers.innerHTML = '';

  // Redirection si nécessaire (ex: app mobile)
  if (q.redirectIndex !== undefined && ansIndex === q.redirectIndex) {
    await sendGhostMessage("Je t'envoie vers notre page application mobile. À tout de suite !");
    await sleep(1000);
    window.location.href = q.redirectUrl;
    return;
  }

  // Réaction du Professor
  await sendGhostMessage(q.reactions[ansIndex], 'reaction-good');

  currentIntro++;

  if (currentIntro >= introQuestions.length) {
    // Fin de l'intro, lancement du quiz
    introPhase = false;
    await sendGhostMessage("Bien, maintenant passons aux choses sérieuses. Réponds à mes 6 questions pour accéder au site.");
    await sendGhostMessage(questions[0].text, 'question');
    showAnswers(questions[0]);
    isAnswering = false;
  } else {
    // Question intro suivante
    await sendGhostMessage(introQuestions[currentIntro].text, 'question');
    showIntroAnswers(introQuestions[currentIntro]);
    isAnswering = false;
  }
}

// ==================== AFFICHER LES RÉPONSES (quiz) ====================
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

// ==================== GESTION DES RÉPONSES (quiz) ====================
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
    spawnErrorPopups(q.errorMsg);
    showExitButton();
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

// ==================== POP-UP FLOOD (mauvaise réponse) ====================
function spawnErrorPopups(errorText) {
  const container = document.createElement('div');
  container.id = 'popup-flood';
  document.body.appendChild(container);

  const totalPopups = 20;
  for (let i = 0; i < totalPopups; i++) {
    setTimeout(() => {
      const popup = document.createElement('div');
      popup.className = 'error-popup';
      popup.style.top = Math.random() * 80 + '%';
      popup.style.left = Math.random() * 75 + '%';
      popup.style.transform = `rotate(${(Math.random() - 0.5) * 20}deg)`;
      popup.innerHTML = `
        <div class="popup-header">
          <span class="popup-icon">&#9888;</span>
          <span>ERREUR</span>
          <span class="popup-close">&#10005;</span>
        </div>
        <div class="popup-body">${errorText}</div>
      `;
      container.appendChild(popup);
    }, i * 150);
  }
}

// ==================== BOUTON QUITTER (mauvaise réponse) ====================
function showExitButton() {
  chatAnswers.innerHTML = '';
  const btn = document.createElement('button');
  btn.className = 'answer-btn exit-btn';
  btn.textContent = 'Quitter le site';
  btn.addEventListener('click', () => {
    window.location.href = 'https://www.google.com';
  });
  chatAnswers.appendChild(btn);
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
  await sendGhostMessage("Bienvenue... attends 2 secondes.");
  await sendGhostMessage(introQuestions[0].text, 'question');

  // Afficher les réponses de la première question intro
  showIntroAnswers(introQuestions[0]);
});
