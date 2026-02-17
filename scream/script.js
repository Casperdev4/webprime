/* ==========================================================
   SCREAM EXPERIENCE - WebPrime
   script.js - Quiz interactif
   ========================================================== */

// ==================== CONFIG ====================
const CONFIG = {
  timing: {
    introDuration: 3000,
    correctDelay: 1000,
    wrongDelay: 800,
    victoryWait: 4000,
    redirectDelay: 1500,
  },
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
    errorMsg: "MAUVAIS CALCUL ! Pendant ce temps, tes concurrents te dévorent... FUIS ! \u{1F480}"
  },
  {
    text: "Une agence qui te PROUVE ses résultats SEO en vidéo, tu dis...",
    answers: [
      { letter: "A", text: "C'est du bluff" },
      { letter: "B", text: "Tout le monde peut faire ça" },
      { letter: "C", text: "Ça inspire confiance, les preuves comptent" }
    ],
    correct: 2,
    errorMsg: "FAUX ! Les amateurs parlent, les pros prouvent... PARS D'ICI ! \u{1FA78}"
  },
  {
    text: "Avoir une galerie avec + de 200 mots-clés en première page Google, c'est...",
    answers: [
      { letter: "A", text: "De la chance" },
      { letter: "B", text: "Le résultat d'une vraie expertise SEO" },
      { letter: "C", text: "Impossible pour une petite agence" }
    ],
    correct: 1,
    errorMsg: "ERREUR ! Les résultats parlent d'eux-mêmes... QUITTE CE SITE ! \u{1F480}"
  },
  {
    text: "Si ton business dépend de ton site web, tu confies ça à...",
    answers: [
      { letter: "A", text: "Ton cousin qui « s'y connaît »" },
      { letter: "B", text: "Personne, tu te débrouilles sur Wix" },
      { letter: "C", text: "Un pro qui maîtrise la création de sites ET la sécurité" }
    ],
    correct: 2,
    errorMsg: "MAUVAIS CHOIX ! Scream déteste les amateurs... AU REVOIR ! \u{1FA78}"
  },
  {
    text: "Tu penses qu'avoir un beau site suffit pour ramener des clients ?",
    answers: [
      { letter: "A", text: "Non, il faut aussi du SEO, du marketing et de la stratégie" },
      { letter: "B", text: "Oui, c'est évident !" },
      { letter: "C", text: "Un site ça vend tout seul" }
    ],
    correct: 0,
    errorMsg: "FAUX ! Un site sans stratégie, c'est une vitrine dans le désert... QUITTE CE SITE ! \u{1F52A}"
  }
];

// ==================== DOM ELEMENTS ====================
const questionContainer = document.getElementById('question-container');
const questionCounter = document.getElementById('question-counter');
const questionText = document.getElementById('question-text');
const answersContainer = document.getElementById('answers-container');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const quitBtn = document.getElementById('quit-btn');
const victoryMessage = document.getElementById('victory-message');
const sceneEl = document.getElementById('scene');
const progressFill = document.getElementById('progress-fill');

// ==================== GAME STATE ====================
let currentQuestion = 0;
let isAnswering = false;

// ==================== AFFICHAGE QUESTION ====================
function showQuestion(index) {
  if (index >= questions.length) {
    showVictory();
    return;
  }

  currentQuestion = index;
  isAnswering = false;
  const q = questions[index];

  questionCounter.textContent = `Question ${index + 1} / ${questions.length}`;
  questionText.textContent = q.text;

  // Générer les boutons
  answersContainer.innerHTML = '';
  q.answers.forEach((answer, ansIndex) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.innerHTML = `
      <span class="answer-letter">${answer.letter}</span>
      <span class="answer-text">${answer.text}</span>
    `;
    btn.addEventListener('click', () => handleAnswer(ansIndex));
    answersContainer.appendChild(btn);
  });

  // Afficher avec animation
  questionContainer.classList.remove('hidden');
  questionContainer.style.animation = 'none';
  questionContainer.offsetHeight; // force reflow
  questionContainer.style.animation = '';
}

// ==================== GESTION DES RÉPONSES ====================
function handleAnswer(ansIndex) {
  if (isAnswering) return;
  isAnswering = true;

  const q = questions[currentQuestion];
  const buttons = answersContainer.querySelectorAll('.answer-btn');

  if (ansIndex === q.correct) {
    // Bonne réponse
    buttons[ansIndex].classList.add('correct');

    // Mettre à jour la barre de progression
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    progressFill.style.width = progress + '%';

    setTimeout(() => {
      questionContainer.classList.add('hidden');
      setTimeout(() => showQuestion(currentQuestion + 1), 300);
    }, CONFIG.timing.correctDelay);

  } else {
    // Mauvaise réponse
    buttons[ansIndex].classList.add('wrong');

    // Effets visuels
    triggerErrorEffects();

    // Afficher le message d'erreur
    setTimeout(() => {
      questionContainer.classList.add('hidden');
      errorText.textContent = q.errorMsg;
      errorMessage.classList.remove('hidden');
    }, CONFIG.timing.wrongDelay);
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

// ==================== BOUTON QUITTER ====================
quitBtn.addEventListener('click', () => {
  window.location.href = 'https://www.google.com';
});

// ==================== VICTOIRE ====================
function showVictory() {
  questionContainer.classList.add('hidden');
  victoryMessage.classList.remove('hidden');

  setTimeout(() => {
    sceneEl.classList.add('fade-out');

    // Fade le brouillard
    document.getElementById('fog-overlay').style.transition = 'opacity 1.5s ease';
    document.getElementById('fog-overlay').style.opacity = '0';

    // Marquer le quiz comme terminé et rediriger vers le site
    sessionStorage.setItem('screamDone', 'true');
    setTimeout(() => {
      window.location.href = '../index.html';
    }, CONFIG.timing.redirectDelay);
  }, CONFIG.timing.victoryWait);
}

// ==================== LANCEMENT ====================
document.addEventListener('DOMContentLoaded', () => {
  showQuestion(0);
});
