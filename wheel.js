/* ==========================================================
   ROUE DE LA FORTUNE - WebPrime
   wheel.js - Code partagé sur toutes les pages
   ========================================================== */

document.addEventListener('DOMContentLoaded', function () {
    const wheelTrigger = document.getElementById('wheelTrigger');
    const wheelModal = document.getElementById('wheelModal');
    const wheelClose = document.getElementById('wheelClose');
    const wheelContainer = document.getElementById('wheelContainer');
    const wheelForm = document.getElementById('wheelForm');
    const wheelSuccess = document.getElementById('wheelSuccess');
    const spinBtn = document.getElementById('spinBtn');
    const prizeText = document.getElementById('prizeText');
    const prizeForm = document.getElementById('prizeForm');
    const closeSuccess = document.getElementById('closeSuccess');
    const wheelCanvas = document.getElementById('wheelCanvas');

    if (!wheelCanvas || !wheelTrigger) return;

    const wheelCtx = wheelCanvas.getContext('2d');

    const segments = [
        { text: '-50\u20AC/mois', color: '#FF6600' },
        { text: '-10\u20AC/mois', color: '#1a1a1a' },
        { text: 'GROS LOT', color: '#FFD700', glow: true },
        { text: '-20\u20AC/mois', color: '#e09a40' },
        { text: '-50\u20AC/mois', color: '#FF6600' },
        { text: '-10\u20AC/mois', color: '#1a1a1a' },
        { text: 'GROS LOT', color: '#FFD700', glow: true },
        { text: '-20\u20AC/mois', color: '#e09a40' }
    ];

    const weights = {
        '-10\u20AC/mois': 7,
        '-20\u20AC/mois': 7,
        '-50\u20AC/mois': 6,
        'GROS LOT': 80
    };

    function getWeightedPrize() {
        const rand = Math.random() * 100;
        let cumulative = 0;
        for (const [prize, weight] of Object.entries(weights)) {
            cumulative += weight;
            if (rand < cumulative) return prize;
        }
        return '-10\u20AC/mois';
    }

    function getSegmentIndexForPrize(prize) {
        const matchingIndices = segments
            .map(function (s, i) { return s.text === prize ? i : -1; })
            .filter(function (i) { return i !== -1; });
        return matchingIndices[Math.floor(Math.random() * matchingIndices.length)];
    }

    let currentRotation = 0;
    let isSpinning = false;
    let currentPrize = '';

    function drawWheel() {
        const centerX = wheelCanvas.width / 2;
        const centerY = wheelCanvas.height / 2;
        const radius = Math.min(centerX, centerY) - 5;
        const segmentAngle = (2 * Math.PI) / segments.length;

        wheelCtx.save();
        wheelCtx.translate(centerX, centerY);
        wheelCtx.rotate(currentRotation);
        wheelCtx.translate(-centerX, -centerY);

        segments.forEach(function (segment, i) {
            const startAngle = i * segmentAngle - Math.PI / 2;
            const endAngle = startAngle + segmentAngle;

            wheelCtx.beginPath();
            wheelCtx.moveTo(centerX, centerY);
            wheelCtx.arc(centerX, centerY, radius, startAngle, endAngle);
            wheelCtx.closePath();

            if (segment.glow) {
                const gradient = wheelCtx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
                gradient.addColorStop(0, '#FFF8DC');
                gradient.addColorStop(0.5, '#FFD700');
                gradient.addColorStop(1, '#FFA500');
                wheelCtx.fillStyle = gradient;
                wheelCtx.shadowColor = '#FFD700';
                wheelCtx.shadowBlur = 15;
            } else {
                wheelCtx.fillStyle = segment.color;
                wheelCtx.shadowBlur = 0;
            }

            wheelCtx.fill();
            wheelCtx.shadowBlur = 0;
            wheelCtx.strokeStyle = '#333';
            wheelCtx.lineWidth = 2;
            wheelCtx.stroke();

            wheelCtx.save();
            wheelCtx.translate(centerX, centerY);
            wheelCtx.rotate(startAngle + segmentAngle / 2);
            wheelCtx.textAlign = 'right';
            wheelCtx.fillStyle = segment.glow ? '#1a1a1a' : '#fff';
            wheelCtx.font = segment.glow ? 'bold 13px Poppins, sans-serif' : '500 13px Poppins, sans-serif';
            wheelCtx.fillText(segment.text, radius - 15, 5);
            wheelCtx.restore();
        });

        wheelCtx.beginPath();
        wheelCtx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
        wheelCtx.fillStyle = '#fff';
        wheelCtx.fill();

        wheelCtx.restore();
    }

    function spinWheel() {
        if (isSpinning) return;
        isSpinning = true;
        spinBtn.disabled = true;

        const spinDuration = 5000;
        const segmentAngle = (2 * Math.PI) / segments.length;

        const selectedPrize = getWeightedPrize();
        const targetIndex = getSegmentIndexForPrize(selectedPrize);

        currentRotation = 0;
        const fullRotations = 5 * 2 * Math.PI;
        const targetAngle = (segments.length - targetIndex) * segmentAngle;
        const randomOffset = (Math.random() - 0.5) * segmentAngle * 0.3;
        const totalRotation = fullRotations + targetAngle + randomOffset;

        const startTime = Date.now();

        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / spinDuration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 4);

            currentRotation = totalRotation * easeOut;
            wheelCtx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
            drawWheel();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                isSpinning = false;
                let normalizedRotation = currentRotation % (2 * Math.PI);
                const winningIndex = Math.floor((segments.length - normalizedRotation / segmentAngle) + segments.length) % segments.length;
                currentPrize = segments[winningIndex].text;
                setTimeout(showPrizeForm, 1000);
            }
        }

        animate();
    }

    function showPrizeForm() {
        wheelContainer.style.display = 'none';
        const priceInput = document.getElementById('prizePrice');

        wheelForm.style.display = 'block';

        if (currentPrize === 'GROS LOT') {
            prizeText.innerHTML = 'Pack 1\u00E8re page Google<span class="prize-note">35\u20AC/mois \u2022 Sans engagement</span>';
            var formText = wheelForm.querySelector('.wheel-form-text');
            if (formText) formText.textContent = '\u26A0\uFE0F Offre valable uniquement maintenant';
            prizeForm.style.display = 'none';
            var stripeBtn = document.createElement('a');
            stripeBtn.href = 'https://buy.stripe.com/4gM5kEbia2Qm58FfDDgYU0b';
            stripeBtn.target = '_blank';
            stripeBtn.className = 'wheel-submit-btn';
            stripeBtn.textContent = 'Souscrire maintenant';
            stripeBtn.style.display = 'block';
            stripeBtn.style.textAlign = 'center';
            stripeBtn.style.textDecoration = 'none';
            wheelForm.appendChild(stripeBtn);
            var note = document.createElement('p');
            note.style.cssText = 'font-size:0.8rem;color:#9ca3af;margin-top:10px;';
            note.textContent = 'En quittant cette page, l\'offre ne sera plus disponible.';
            wheelForm.appendChild(note);
            localStorage.setItem('wheelPlayed', 'true');
            return;
        }

        {
            let newPrice = '';
            if (currentPrize === '-10\u20AC/mois') newPrice = '25\u20AC/mois';
            else if (currentPrize === '-20\u20AC/mois') newPrice = '15\u20AC/mois';
            else if (currentPrize === '-50\u20AC/mois') newPrice = '0\u20AC/mois';

            var prizeDescription = '<span class="prize-note">Valable sur :<br>\u2022 Pack 1\u00E8re page Google<br>\u2022 Suivi mensuel site vitrine<br>\u2022 Suivi mensuel site e-commerce<br>\u2022 Suivi mensuel site booking</span>';
            prizeText.innerHTML = 'Vous avez gagn\u00E9 : ' + currentPrize + prizeDescription;
            priceInput.style.display = 'none';
            priceInput.required = false;
        }
    }

    // Afficher le bouton après 2 secondes
    wheelTrigger.style.display = 'none';
    setTimeout(function () {
        if (!localStorage.getItem('wheelPlayed')) {
            wheelTrigger.style.display = 'flex';
        }
    }, 2000);

    wheelTrigger.addEventListener('click', function () {
        wheelModal.classList.add('active');
        drawWheel();
    });

    wheelClose.addEventListener('click', function () {
        wheelModal.classList.remove('active');
    });

    wheelModal.addEventListener('click', function (e) {
        if (e.target === wheelModal) {
            wheelModal.classList.remove('active');
        }
    });

    spinBtn.addEventListener('click', spinWheel);

    prizeForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var email = document.getElementById('prizeEmail').value;
        var submitBtn = prizeForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Envoi...';

        var formData = new FormData();
        formData.append('email', email);
        formData.append('prix_gagne', currentPrize);

        var proposedPrice = document.getElementById('prizePrice').value;
        if (currentPrize === 'GROS LOT' && proposedPrice) {
            formData.append('prix_propose', proposedPrice);
            formData.append('_subject', 'Roue WebPrime - GROS LOT : ' + proposedPrice);
        } else {
            formData.append('_subject', 'Roue WebPrime - ' + currentPrize);
        }
        formData.append('_captcha', 'false');
        formData.append('_template', 'table');
        formData.append('_honey', document.querySelector('input[name="_honey"]').value);
        formData.append('_autoresponse', '');
        formData.append('_replyto', email);

        fetch('https://formsubmit.co/ajax/contact@webprime.fr', {
            method: 'POST',
            body: formData
        })
        .then(function () {
            wheelForm.style.display = 'none';
            wheelSuccess.style.display = 'block';
            localStorage.setItem('wheelPlayed', 'true');
        })
        .catch(function () {
            wheelForm.style.display = 'none';
            wheelSuccess.style.display = 'block';
            localStorage.setItem('wheelPlayed', 'true');
        });
    });

    closeSuccess.addEventListener('click', function () {
        wheelModal.classList.remove('active');
        wheelTrigger.style.display = 'none';
    });

    if (localStorage.getItem('wheelPlayed')) {
        wheelTrigger.style.display = 'none';
    }
});
