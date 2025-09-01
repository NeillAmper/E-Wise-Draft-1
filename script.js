document.addEventListener('DOMContentLoaded', () => {
    // --- Audio Context for Gamified Sounds ---
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    function playSound(type) {
        if (!audioCtx) return;
        try {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.01);

            if (type === 'correct') {
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
            } else if (type === 'wrong') {
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(164.81, audioCtx.currentTime); // E3
            } else if (type === 'achievement') {
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(261.63, audioCtx.currentTime); // C4
                setTimeout(() => oscillator.frequency.setValueAtTime(329.63, audioCtx.currentTime + 0.1), 100);
                setTimeout(() => oscillator.frequency.setValueAtTime(392.00, audioCtx.currentTime + 0.2), 200);
            }
            gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.5);
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.5);
        } catch (error) {
            console.log("Could not play sound:", error);
        }
    }

    // --- Elements ---
    const pages = document.querySelectorAll('.page');
    const navUl = document.getElementById('nav-ul');
    const logo = document.querySelector('.logo');
    const header = document.querySelector('header');
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const quizModal = document.getElementById('quiz-modal');
    const reportModal = document.getElementById('report-modal');
    const editProfileModal = document.getElementById('edit-profile-modal');
    const analyticsModal = document.getElementById('analytics-modal');
    const createQuizBtn = document.getElementById('create-quiz-btn');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const loginError = document.getElementById('login-error');
    const signupError = document.getElementById('signup-error');
    
    // --- App State & Data ---
    let users = [
        { "username": "player", "password": "player", "accountType": "player", "name": "Alex Ryder", "bio": "Just trying to be a bit more green!", "sex": "Male", "profilePicture": "https://placehold.co/120x120/00C49A/1E2D2B?text=A", "xp": 750, "ecoCoins": 1200, "loginStreak": 3, "lastActivityDate": "2025-08-31", "badges": ["Recycling Rookie", "E-Waste Expert"], "achievements": ["firstQuiz", "perfectScore"], "friends": ["greenwarrior"], "quizzesPlayed": [], "lastLogin": null, reports: 0 },
        { "username": "quizmaster", "password": "quizmaster", "accountType": "maker", "name": "Dr. Wattson", "bio": "Creating quizzes to spark change.", "sex": "Prefer not to say", "profilePicture": "", "xp": 0, "ecoCoins": 0, "loginStreak": 0, "lastActivityDate": null, "badges": [], "achievements": [], "friends": [], "quizzesPlayed": [], "lastLogin": null, reports: 0 },
        { "username": "greenwarrior", "password": "password", "accountType": "player", "name": "Greta", "bio": "Eco-warrior in training.", "sex": "Female", "profilePicture": "https://placehold.co/120x120/FFC107/1E2D2B?text=G", "xp": 180, "ecoCoins": 300, "loginStreak": 1, "lastActivityDate": "2025-09-01", "badges": ["Recycling Rookie"], "achievements": ["firstQuiz"], "friends": ["player"], "quizzesPlayed": [], "lastLogin": null, reports: 1 },
        { "username": "ecofriend", "password": "password", "accountType": "player", "name": "Sam", "bio": "", "sex": "Prefer not to say", "profilePicture": "", "xp": 420, "ecoCoins": 550, "loginStreak": 0, "lastActivityDate": "2025-08-20", "badges": ["Recycling Rookie"], "achievements": ["firstQuiz"], "friends": [], "quizzesPlayed": [], "lastLogin": null, reports: 0 }
    ];
    let quizzes = [
        { 
            id: "q1",
            title: "The Basics of E-Waste", 
            category: "General Knowledge", 
            isWeeklyChallenge: true,
            plays: [],
            ratings: [],
            comments: [],
            questions: [
                { question: "Which of these is NOT considered e-waste?", options: ["Smartphone", "Plastic Bottle", "Laptop", "Television"], answer: "Plastic Bottle", explanation: "Plastic bottles are common recyclables but don't contain electronic components, so they aren't classified as e-waste." }, 
                { question: "What toxic substance can be found in old CRT monitors?", options: ["Mercury", "Lead", "Arsenic", "Cadmium"], answer: "Lead", explanation: "Older CRT (cathode ray tube) monitors and televisions can contain several pounds of lead, which is highly toxic." }
            ] 
        },
        { 
            id: "q2",
            title: "Recycling Old Phones", 
            category: "Recycling Facts", 
            isWeeklyChallenge: false,
            plays: [],
            ratings: [],
            comments: [],
            questions: [
                { question: "What valuable metal is commonly recovered from mobile phones?", options: ["Gold", "Silver", "Platinum", "All of the above"], answer: "All of the above", explanation: "Mobile phones contain small amounts of precious metals like gold, silver, platinum, and palladium, making them valuable to recycle." }
            ] 
        },
        { 
            id: "q3",
            title: "Battery Disposal 101", 
            category: "Safety", 
            isSpecial: true,
            isWeeklyChallenge: false,
            plays: [],
            ratings: [],
            comments: [],
            questions: [
                { question: "Why shouldn't you throw lithium-ion batteries in the regular trash?", options: ["They are biodegradable", "They can cause fires", "They are not valuable", "They are too heavy"], answer: "They can cause fires", explanation: "Lithium-ion batteries can short-circuit and ignite if damaged in trash compactors, causing dangerous fires at waste facilities." }
            ] 
        }
    ];
    const funFacts = [
        "Only 17.4% of global e-waste is documented to be collected and properly recycled.",
        "E-waste is the fastest-growing domestic waste stream in the world.",
        "Recycling one million laptops saves the energy equivalent to the electricity used by 3,657 US homes in a year.",
        "There is 100 times more gold in a tonne of e-waste than in a tonne of gold ore.",
        "Improper e-waste disposal can release harmful toxins like lead and mercury into the environment."
    ];
    const events = [
        { date: "SEP 15", title: "Barangay Matina E-Waste Collection Drive", location: "Matina Aplaya Basketball Court" },
        { date: "SEP 22", title: "SM Lanang Tech Recycling Weekend", location: "SM Lanang Premier, North Wing Parking" },
        { date: "OCT 01", title: "Coastal Cleanup and E-Waste Awareness Day", location: "Times Beach, Davao City" }
    ];
    const levelTiers = { 0: "Eco-Beginner", 1: "Eco-Novice", 2: "Eco-Advocate", 3: "Eco-Champion", 4: "Eco-Hero" };
    const badgesData = {
        "Recycling Rookie": { name: "Recycling Rookie", icon: "https://placehold.co/60x60/283835/00C49A?text=♻️" },
        "E-Waste Expert": { name: "E-Waste Expert", icon: "https://placehold.co/60x60/283835/FFC107?text=💡" }
    };
    const achievementsData = {
        'firstQuiz': { name: 'Eco-Initiate', description: 'Played your first quiz.', icon: 'https://placehold.co/50x50/00A878/FFFFFF?text=▶️' },
        'perfectScore': { name: 'Perfecto', description: 'Achieved a 100% score on a quiz.', icon: 'https://placehold.co/50x50/FFC107/FFFFFF?text=⭐' },
        'quizStreak': { name: 'Quiz Whiz', description: 'Played 5 quizzes in total.', icon: 'https://placehold.co/50x50/00B2CA/FFFFFF?text=⚡' },
        'reporter': { name: 'Community Watchdog', description: 'Reported an illegal dumping site.', icon: 'https://placehold.co/50x50/EF5350/FFFFFF?text=👁️' }
    };
    let currentUser = null;
    let currentQuiz = null;
    let userAnswers = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let currentDashboard = 'player-home';
    let questionTimer;
    const seasonEndDate = new Date('2025-10-01T00:00:00');
    
    // --- FUNCTIONS ---

    const showNotification = (message, isAchievement = false) => {
        const container = document.getElementById('notification-container');
        const toast = document.createElement('div');
        toast.className = 'notification-toast';
        toast.innerHTML = message;
        container.appendChild(toast);
        if (isAchievement) playSound('achievement');
        setTimeout(() => { toast.remove(); }, 4000);
    };

    const checkAchievements = () => {
        if (!currentUser || currentUser.accountType !== 'player') return;

        const grantAchievement = (id) => {
            if (!currentUser.achievements.includes(id)) {
                currentUser.achievements.push(id);
                const achievement = achievementsData[id];
                showNotification(`🏆 Achievement Unlocked: ${achievement.name}!`, true);
            }
        };
        
        if (currentUser.quizzesPlayed.length >= 1) grantAchievement('firstQuiz');
        if (currentUser.quizzesPlayed.some(q => q.percentage === 100)) grantAchievement('perfectScore');
        if (currentUser.quizzesPlayed.length >= 5) grantAchievement('quizStreak');
        if (currentUser.reports >= 1) grantAchievement('reporter');
    };

    const populateProfile = () => {
        if (currentUser) {
            // Level and XP
            const levelXp = 500;
            const level = Math.floor(currentUser.xp / levelXp);
            const currentLevelBaseXp = level * levelXp;
            const xpIntoLevel = currentUser.xp - currentLevelBaseXp;
            const xpPercentage = (xpIntoLevel / levelXp) * 100;
            const levelName = levelTiers[level] || `Eco-Master (Lvl ${level+1})`;
            document.getElementById('dashboard-profile-name').textContent = `Eco-Hub: ${currentUser.name || currentUser.username}`;
            document.getElementById('player-level').textContent = levelName;
            document.getElementById('profile-xp').textContent = currentUser.xp;
            document.getElementById('xp-next-level').textContent = currentLevelBaseXp + levelXp;
            document.getElementById('xp-bar').style.width = `${xpPercentage}%`;
            
            // Coins and Streak
            document.querySelector('#eco-coins-display p').textContent = currentUser.ecoCoins;
            document.querySelector('#login-streak-display p').textContent = currentUser.loginStreak;

            // Badges
            const badgesContainer = document.querySelector('#profile-badges .badges-container');
            badgesContainer.innerHTML = '';
            if (currentUser.badges && currentUser.badges.length > 0) {
                currentUser.badges.forEach(badgeKey => {
                    const badgeInfo = badgesData[badgeKey];
                    if(badgeInfo) {
                        const badgeEl = document.createElement('div');
                        badgeEl.className = 'badge';
                        badgeEl.innerHTML = `<img src="${badgeInfo.icon}" alt="${badgeInfo.name}"><p>${badgeInfo.name}</p>`;
                        badgesContainer.appendChild(badgeEl);
                    }
                });
            } else { badgesContainer.innerHTML = '<p>No badges yet!</p>'; }
        }
    };

    const populateProfilePage = () => {
         if (!currentUser) return;
         const levelXp = 500;
         const level = Math.floor(currentUser.xp / levelXp);
         const levelName = levelTiers[level] || `Eco-Master (Lvl ${level+1})`;
         const profilePic = document.getElementById('profile-page-picture');
         profilePic.src = currentUser.profilePicture || `https://placehold.co/120x120/1E2D2B/F0F3F5?text=${(currentUser.name || currentUser.username).charAt(0)}`;
         profilePic.onerror = () => { profilePic.src = `https://placehold.co/120x120/1E2D2B/F0F3F5?text=${(currentUser.name || currentUser.username).charAt(0)}`; };
         document.getElementById('profile-page-name').textContent = currentUser.name || currentUser.username;
         document.getElementById('profile-page-bio').textContent = currentUser.bio || 'No bio yet.';
         document.getElementById('profile-page-level').textContent = levelName;
         const quizzesPlayed = currentUser.quizzesPlayed.length;
         const totalScore = currentUser.quizzesPlayed.reduce((sum, result) => sum + result.percentage, 0);
         const averageScore = quizzesPlayed > 0 ? Math.round(totalScore / quizzesPlayed) : 0;
         document.getElementById('stat-quizzes-played').textContent = quizzesPlayed;
         document.getElementById('stat-average-score').textContent = `${averageScore}%`;

         // Achievements Tab
         const achievementsContainer = document.getElementById('tab-achievements');
         achievementsContainer.innerHTML = '<h2>Achievements</h2>';
         if(currentUser.achievements && currentUser.achievements.length > 0) {
            currentUser.achievements.forEach(achId => {
                const ach = achievementsData[achId];
                achievementsContainer.innerHTML += `<div class="achievement"><img src="${ach.icon}" alt="${ach.name}"><div><h3>${ach.name}</h3><p>${ach.description}</p></div></div>`;
            });
         } else {
            achievementsContainer.innerHTML += '<p>No achievements unlocked yet. Keep playing!</p>';
         }
        
         // Friends Tab
         const friendsContainer = document.getElementById('friends-list');
         friendsContainer.innerHTML = '';
         if (currentUser.friends && currentUser.friends.length > 0) {
             currentUser.friends.forEach(friendUsername => {
                 const friend = users.find(u => u.username === friendUsername);
                 if(friend) {
                     const friendPic = friend.profilePicture || `https://placehold.co/40x40/1E2D2B/F0F3F5?text=${(friend.name || friend.username).charAt(0)}`;
                     friendsContainer.innerHTML += `<div class="friend-item"><img src="${friendPic}"><span>${friend.name || friend.username}</span></div>`;
                 }
             });
         } else {
             friendsContainer.innerHTML = '<p>You have not added any friends yet.</p>';
         }

         showPage('profile-page');
    };

    const createQuizCard = (quiz, isDaily, isMaker = false) => {
        const card = document.createElement('div');
        card.className = 'quiz-card';
        let headerHTML = `<h3>${quiz.title}</h3>`;
        if (isDaily) {
            card.classList.add('daily-challenge');
            headerHTML = `<div class="daily-challenge-header"><h3>${quiz.title}</h3><div id="countdown-timer"></div></div>`;
        }
        let buttonHTML = `<a class="btn btn-secondary play-quiz-btn">Play Now</a>`;
        if(isDaily) buttonHTML = `<a class="btn btn-primary play-quiz-btn">Play for 2x XP!</a>`;
        if (quiz.isWeeklyChallenge) buttonHTML = `<a class="btn btn-primary play-quiz-btn">Take Weekly Challenge (3x XP)</a>`;
        if(isMaker) buttonHTML = `<a href="#" class="btn btn-tertiary analytics-quiz-btn">View Analytics</a>`;

        card.innerHTML = `
            <div class="quiz-card-content">
                ${headerHTML}
                <p>${quiz.questions.length} Questions - ${quiz.category}</p>
            </div>
            ${buttonHTML}
        `;
        if (!isMaker) card.querySelector('.play-quiz-btn').addEventListener('click', () => startQuiz(quiz));
        if (isMaker) card.querySelector('.analytics-quiz-btn').addEventListener('click', (e) => { e.preventDefault(); showAnalytics(quiz); });
        return card;
    };
    
    const renderQuizzes = () => {
        const weeklyContainer = document.getElementById('weekly-challenge-container');
        const playerList = document.getElementById('player-quiz-list');
        const makerList = document.getElementById('maker-quiz-list');
        weeklyContainer.innerHTML = ''; playerList.innerHTML = ''; makerList.innerHTML = '';

        const weeklyQuiz = quizzes.find(q => q.isWeeklyChallenge);
        if (weeklyQuiz) {
            weeklyContainer.innerHTML = '<h3 class="category-title">Weekly Challenge 🔥</h3>';
            weeklyContainer.appendChild(createQuizCard(weeklyQuiz, false));
        }

        const dailyQuiz = quizzes.find(q => q.isSpecial);
        if (dailyQuiz) { playerList.appendChild(createQuizCard(dailyQuiz, true)); }

        const categories = [...new Set(quizzes.filter(q => !q.isSpecial && !q.isWeeklyChallenge).map(q => q.category))];
        categories.forEach(category => {
            const playerCategoryTitle = document.createElement('h3');
            playerCategoryTitle.className = 'category-title';
            playerCategoryTitle.textContent = category;
            playerList.appendChild(playerCategoryTitle);
            quizzes.filter(q => q.category === category && !q.isSpecial && !q.isWeeklyChallenge).forEach(quiz => {
                playerList.appendChild(createQuizCard(quiz, false));
            });
        });
        quizzes.forEach(quiz => makerList.appendChild(createQuizCard(quiz, false, true)));
    };

    const startQuiz = (quiz) => {
        currentQuiz = quiz; userAnswers = []; currentQuestionIndex = 0; score = 0;
        document.getElementById('quiz-title-display').textContent = currentQuiz.title;
        document.getElementById('question-container').style.display = 'block';
        document.getElementById('results-container').style.display = 'none';
        document.getElementById('rating-section').style.display = 'none';
        showPage('quiz-play'); displayQuestion();
    };

    const displayQuestion = () => {
        clearInterval(questionTimer);
        const timerDisplay = document.getElementById('question-timer');
        let timeLeft = 15;
        timerDisplay.textContent = timeLeft;
        questionTimer = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = timeLeft;
            if (timeLeft <= 5) timerDisplay.style.color = 'var(--error-red)';
            if (timeLeft <= 0) { clearInterval(questionTimer); selectAnswer(null, 'timeout'); }
        }, 1000);
        timerDisplay.style.color = 'var(--accent-blue)';
        const progress = ((currentQuestionIndex) / currentQuiz.questions.length) * 100;
        document.getElementById('quiz-progress-bar').style.width = `${progress}%`;
        const question = currentQuiz.questions[currentQuestionIndex];
        document.getElementById('question-text').textContent = question.question;
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        document.getElementById('feedback-text').textContent = '';
        question.options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option;
            button.classList.add('btn', 'option-btn');
            button.addEventListener('click', () => selectAnswer(button, option));
            optionsContainer.appendChild(button);
        });
    };

    const selectAnswer = (button, selectedOption) => {
        clearInterval(questionTimer);
        const correctAnswer = currentQuiz.questions[currentQuestionIndex].answer;
        userAnswers.push(selectedOption || 'timeout');
        document.querySelectorAll('.option-btn').forEach(opt => opt.disabled = true);
        if (selectedOption === correctAnswer) {
            score++;
            if(button) button.classList.add('correct');
            document.getElementById('feedback-text').textContent = "Correct!";
            document.getElementById('feedback-text').style.color = 'var(--success-green)';
            playSound('correct');
        } else {
            if(button) button.classList.add('wrong');
            document.getElementById('feedback-text').textContent = `Wrong! The correct answer was ${correctAnswer}.`;
            document.getElementById('feedback-text').style.color = 'var(--error-red)';
            playSound('wrong');
        }
        setTimeout(() => {
            currentQuestionIndex++;
            if (currentQuestionIndex < currentQuiz.questions.length) { displayQuestion(); } 
            else { showResults(); }
        }, 1500);
    };
    
    const showResults = () => {
        document.getElementById('quiz-progress-bar').style.width = `100%`;
        document.getElementById('question-container').style.display = 'none';
        const resultsContainer = document.getElementById('results-container');
        resultsContainer.style.display = 'block';
        const percentage = Math.round((score / currentQuiz.questions.length) * 100);
        document.getElementById('score-text').textContent = `${percentage}% (${score}/${currentQuiz.questions.length})`;
        
        let xpMultiplier = 1;
        if (currentQuiz.isSpecial) xpMultiplier = 2;
        if (currentQuiz.isWeeklyChallenge) xpMultiplier = 3;
        const xpAwarded = 50 * xpMultiplier;
        const coinsAwarded = Math.round(score * 5 * (percentage / 100));

        document.getElementById('xp-awarded-text').textContent = `+${xpAwarded} XP Awarded!`;
        document.getElementById('coins-awarded-text').textContent = `+${coinsAwarded} Eco-Coins!`;
        
        const dynamicMessageEl = document.getElementById('dynamic-message');
        if(percentage === 100) {
            dynamicMessageEl.textContent = "Perfect Score! Excellent Work, Eco-Hero!";
            dynamicMessageEl.style.color = 'var(--xp-color)';
        } else if (percentage >= 75) {
            dynamicMessageEl.textContent = "Great Job! You really know your stuff.";
            dynamicMessageEl.style.color = 'var(--success-green)';
        } else {
            dynamicMessageEl.textContent = "Good effort! Review the answers to learn more.";
            dynamicMessageEl.style.color = 'var(--text-light)';
        }

        if (currentUser) {
            const oldLevel = Math.floor(currentUser.xp / 500);
            currentUser.xp += xpAwarded;
            currentUser.ecoCoins += coinsAwarded;
            currentUser.quizzesPlayed.push({ title: currentQuiz.title, score, total: currentQuiz.questions.length, percentage });
            
            const quizInDb = quizzes.find(q => q.id === currentQuiz.id);
            if(quizInDb) {
                quizInDb.plays.push({ user: currentUser.username, percentage: percentage });
            }

            const newLevel = Math.floor(currentUser.xp / 500);
            populateProfile();
            showNotification(`+${xpAwarded} XP & +${coinsAwarded} Eco-Coins!`);
            if(newLevel > oldLevel) { setTimeout(() => showNotification(`Level Up! You're now ${levelTiers[newLevel] || `Eco-Master (Lvl ${newLevel+1})`}!`), 500); }
            checkAchievements();
        }

        document.getElementById('rating-section').style.display = 'block';
    };

    const populateReviewPage = () => {
        document.getElementById('review-title').textContent = `Review: ${currentQuiz.title}`;
        const reviewContainer = document.getElementById('review-container');
        reviewContainer.innerHTML = '';
        currentQuiz.questions.forEach((q, index) => {
            const userAnswer = userAnswers[index];
            const card = document.createElement('div');
            card.className = 'review-card';
            let optionsHTML = '<ul class="review-options">';
            q.options.forEach(opt => {
                let classes = '', indicator = '';
                if (opt === q.answer) { classes += 'correct-answer '; indicator = '✔️'; }
                if (opt === userAnswer) { classes += 'user-answer '; indicator = (userAnswer === q.answer) ? '✔️' : '❌'; }
                if (opt === userAnswer && userAnswer !== q.answer) { classes += 'wrong-answer'; }
                optionsHTML += `<li class="${classes}"><div>${opt}</div><span>${indicator}</span></li>`;
            });
            optionsHTML += '</ul>';
            card.innerHTML = `<h3>Q${index + 1}: ${q.question}</h3>${optionsHTML}<div class="explanation"><strong>Learn More:</strong> ${q.explanation}</div>`;
            reviewContainer.appendChild(card);
        });
        showPage('review-page');
    };

    const showPage = (pageId) => { 
        pages.forEach(page => page.style.display = 'none'); 
        const pageToShow = document.getElementById(pageId);
        if (pageToShow) {
            pageToShow.style.display = 'block';
            if(pageId === 'player-home') displayRandomFact();
        }
        window.scrollTo(0, 0); 
        if (navUl.classList.contains('nav-active')) { 
            navUl.classList.remove('nav-active'); hamburgerMenu.classList.remove('active'); 
        } 
    };

    const updateHeader = () => { 
        let navContent; 
        if (currentUser) { 
            let profileLink = currentUser.accountType === 'player' ? `<li><a id="profile-link">My Profile</a></li>` : '';
            navContent = `<li><a id="events-link">Events</a></li><li><a id="learn-link">Eco-Library</a></li><li><a id="map-link">Find Drop-off</a></li><li><a id="resources-link">Resources</a></li><li><a id="leaderboard-link">Leaderboard</a></li>${profileLink}<li>Welcome, ${currentUser.name || currentUser.username}!</li><li><a id="logout-link" class="btn btn-primary">Logout</a></li>`; 
        } else { navContent = `<li><a id="login-link">Login</a></li><li><a id="signup-link" class="btn btn-primary">Sign Up</a></li>`; } 
        navUl.innerHTML = navContent; 
        addHeaderListeners(); 
    };

    const addHeaderListeners = () => { 
        const loginLink = document.getElementById('login-link'), signupLink = document.getElementById('signup-link'), logoutLink = document.getElementById('logout-link'), leaderboardLink = document.getElementById('leaderboard-link'), learnLink = document.getElementById('learn-link'), mapLink = document.getElementById('map-link'), resourcesLink = document.getElementById('resources-link'), profileLink = document.getElementById('profile-link'), eventsLink = document.getElementById('events-link');
        if (loginLink) loginLink.addEventListener('click', () => showPage('login-page')); 
        if (signupLink) signupLink.addEventListener('click', () => showPage('signup-page')); 
        if (logoutLink) logoutLink.addEventListener('click', () => { currentUser = null; updateHeader(); showPage('landing-page'); }); 
        if (leaderboardLink) leaderboardLink.addEventListener('click', () => { populateLeaderboard(); showPage('leaderboard-page'); }); 
        if (learnLink) learnLink.addEventListener('click', () => showPage('learn-page')); 
        if (mapLink) mapLink.addEventListener('click', () => showPage('map-page')); 
        if (resourcesLink) resourcesLink.addEventListener('click', () => showPage('resources-page'));
        if (profileLink) profileLink.addEventListener('click', populateProfilePage);
        if (eventsLink) eventsLink.addEventListener('click', () => { populateEvents(); showPage('events-page'); });
    };

    const populateLeaderboard = () => { 
        const leaderboardList = document.getElementById('leaderboard-list'); 
        leaderboardList.innerHTML = ''; 
        const sortedUsers = [...users].filter(u => u.accountType === 'player').sort((a, b) => b.xp - a.xp); 
        sortedUsers.forEach((user, index) => { 
            const item = document.createElement('li'); item.className = 'leaderboard-item'; 
            if (currentUser && user.username === currentUser.username) item.classList.add('current-user');
            const profilePicSrc = user.profilePicture || `https://placehold.co/40x40/1E2D2B/F0F3F5?text=${(user.name || user.username).charAt(0)}`;
            const badgesHTML = user.badges.map(badgeKey => { const badgeInfo = badgesData[badgeKey]; return badgeInfo ? `<img src="${badgeInfo.icon}" alt="${badgeInfo.name}" title="${badgeInfo.name}" style="width: 30px; height: 30px;">` : ''; }).join(' ');
            item.innerHTML = `<div class="leaderboard-rank">${index + 1}</div><img src="${profilePicSrc}" alt="Profile Pic" class="leaderboard-profile-pic"><div class="leaderboard-details"><h3>${user.name || user.username}</h3><div class="badges-container" style="grid-template-columns: repeat(auto-fit, minmax(30px, 1fr)); gap: 5px; margin-top: 5px;">${badgesHTML}</div></div><div class="leaderboard-xp">${user.xp} XP</div>`; 
            leaderboardList.appendChild(item); 
        }); 
    };
    
    const populateEvents = () => {
        const eventsList = document.getElementById('events-list');
        eventsList.innerHTML = '';
        events.forEach(event => {
            const [month, day] = event.date.split(' ');
            eventsList.innerHTML += `
                <div class="event-item">
                    <div class="event-date">
                        <div class="month">${month}</div>
                        <div class="day">${day}</div>
                    </div>
                    <div class="event-details">
                        <h3>${event.title}</h3>
                        <p>${event.location}</p>
                    </div>
                </div>
            `;
        });
    };

    const addQuestionToModal = () => {
        const container = document.getElementById('new-question-container');
        const questionIndex = container.children.length;
        const newQuestion = document.createElement('div');
        newQuestion.className = 'form-group';
        newQuestion.innerHTML = `
            <label for="q-${questionIndex}-text">Question ${questionIndex + 1}</label>
            <textarea id="q-${questionIndex}-text" placeholder="What is...?" required></textarea>
            <label for="q-${questionIndex}-opt1">Option A</label><input type="text" id="q-${questionIndex}-opt1" required>
            <label for="q-${questionIndex}-opt2">Option B</label><input type="text" id="q-${questionIndex}-opt2" required>
            <label for="q-${questionIndex}-opt3">Option C</label><input type="text" id="q-${questionIndex}-opt3" required>
            <label for="q-${questionIndex}-opt4">Option D</label><input type="text" id="q-${questionIndex}-opt4" required>
            <label for="q-${questionIndex}-ans">Correct Answer</label>
            <select id="q-${questionIndex}-ans">
                <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
            </select>
        `;
        container.appendChild(newQuestion);
    };
    
    const displayRandomFact = () => {
        const factText = document.getElementById('fun-fact-text');
        const randomIndex = Math.floor(Math.random() * funFacts.length);
        factText.textContent = funFacts[randomIndex];
    };
    
    const populateSocialFeed = () => {
        const feedContainer = document.getElementById('social-feed-container');
        feedContainer.innerHTML = '';
        if(!currentUser || !currentUser.friends || currentUser.friends.length === 0) {
            feedContainer.innerHTML = '<p>Add some friends to see their activity!</p>';
            return;
        }
        const friendActivities = [];
        currentUser.friends.forEach(friendUsername => {
            const friend = users.find(u => u.username === friendUsername);
            if (friend && friend.achievements.length > 0) {
                const latestAchievementId = friend.achievements[friend.achievements.length - 1];
                const latestAchievement = achievementsData[latestAchievementId];
                friendActivities.push(`<strong>${friend.name || friend.username}</strong> unlocked the "${latestAchievement.name}" achievement!`);
            }
        });

        if (friendActivities.length === 0) {
             feedContainer.innerHTML = '<p>Your friends have been quiet lately...</p>';
        } else {
            friendActivities.forEach(activity => {
                feedContainer.innerHTML += `<p>⚡ ${activity}</p>`;
            });
        }
    };
    
    const showAnalytics = (quiz) => {
        document.getElementById('analytics-title').textContent = `Analytics for "${quiz.title}"`;
        const content = document.getElementById('analytics-content');
        if(quiz.plays.length === 0) {
            content.innerHTML = '<p>This quiz has not been played yet.</p>';
            analyticsModal.style.display = 'flex';
            return;
        }
        const totalPlays = quiz.plays.length;
        const averageScore = quiz.plays.reduce((sum, play) => sum + play.percentage, 0) / totalPlays;
        content.innerHTML = `
            <div class="stats-grid">
                <div class="stat-item"><h3>${totalPlays}</h3><p>Total Plays</p></div>
                <div class="stat-item"><h3>${Math.round(averageScore)}%</h3><p>Average Score</p></div>
            </div>
        `;
        analyticsModal.style.display = 'flex';
    };


    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const currentlyActive = document.querySelector('.accordion-header.active');
            if(currentlyActive && currentlyActive !== header) {
                currentlyActive.classList.remove('active'); currentlyActive.nextElementSibling.style.maxHeight = null;
            }
            const content = header.nextElementSibling;
            header.classList.toggle('active');
            content.style.maxHeight = content.style.maxHeight ? null : content.scrollHeight + "px";
        });
    });

    function updateCountdown(elementId, endDate) {
        const now = new Date(); 
        const diff = endDate - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = String(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
        const minutes = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
        const seconds = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');
        const timerEl = document.getElementById(elementId);
        if (timerEl) {
            if (diff > 0) {
                timerEl.textContent = elementId === 'countdown-timer' ? `Resets in: ${hours}:${minutes}:${seconds}` : `Season ends in ${days}d ${hours}h ${minutes}m`;
            } else {
                timerEl.textContent = "Ended!";
            }
        }
    }
    setInterval(() => updateCountdown('countdown-timer', new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1)), 1000);
    setInterval(() => updateCountdown('season-countdown', seasonEndDate), 1000);

    const handleLogin = (user) => {
         currentUser = user; 
         const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
         const yesterday = new Date(Date.now() - 864e5).toISOString().split('T')[0];
         
         if (currentUser.lastActivityDate !== today) {
            if (currentUser.lastActivityDate === yesterday) {
                currentUser.loginStreak++;
                showNotification(`🔥 Login Streak: ${currentUser.loginStreak} days! +${currentUser.loginStreak * 10} XP Bonus!`);
                currentUser.xp += currentUser.loginStreak * 10;
            } else {
                currentUser.loginStreak = 1;
                showNotification("Welcome back!");
            }
            currentUser.lastActivityDate = today;
         }
         if(currentUser.lastLogin !== new Date().toDateString()){
            currentUser.xp += 20;
            setTimeout(() => showNotification("+20 XP Daily Login Bonus!"), 500);
            currentUser.lastLogin = new Date().toDateString();
         }

         updateHeader(); 
         currentDashboard = currentUser.accountType === 'maker' ? 'maker-home' : 'player-home'; 
         if (currentUser.accountType === 'player') { populateProfile(); populateSocialFeed(); }
         renderQuizzes(); 
         showPage(currentDashboard);
    }
    
    const openEditProfileModal = () => {
        if(!currentUser) return;
        document.getElementById('edit-name').value = currentUser.name || '';
        document.getElementById('edit-picture').value = currentUser.profilePicture || '';
        document.getElementById('edit-bio').value = currentUser.bio || '';
        document.getElementById('edit-sex').value = currentUser.sex || 'Prefer not to say';
        editProfileModal.style.display = 'flex';
    };
    
    let currentRating = 0;
    document.getElementById('star-rating').addEventListener('click', e => {
        if(e.target.classList.contains('star')) {
            currentRating = parseInt(e.target.dataset.value);
            document.querySelectorAll('.star').forEach(star => {
                star.classList.toggle('selected', parseInt(star.dataset.value) <= currentRating);
            });
        }
    });

    document.getElementById('comment-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const commentText = document.getElementById('comment-input').value;
        const quizInDb = quizzes.find(q => q.id === currentQuiz.id);
        if (quizInDb) {
            if (currentRating > 0) quizInDb.ratings.push(currentRating);
            if (commentText.trim()) quizInDb.comments.push({ username: currentUser.username, text: commentText });
            showNotification("Thank you for your feedback!");
        }
        document.getElementById('rating-section').style.display = 'none'; // Hide after submitting
        currentRating = 0;
        e.target.reset();
    });

    // --- EVENT LISTENERS ---
    document.getElementById('login-form').addEventListener('submit', (e) => { e.preventDefault(); loginError.style.display = 'none'; const username = document.getElementById('login-username').value; const password = document.getElementById('login-password').value; const foundUser = users.find(u => u.username === username && u.password === password); if (foundUser) { handleLogin(foundUser); } else { loginError.textContent = 'Invalid username or password.'; loginError.style.display = 'block'; } });
    document.getElementById('signup-form').addEventListener('submit', (e) => { e.preventDefault(); signupError.style.display = 'none'; const username = document.getElementById('signup-username').value; const password = document.getElementById('signup-password').value; const accountType = document.getElementById('account-type').value; if (users.some(u => u.username === username)) { signupError.textContent = 'Username is already taken.'; signupError.style.display = 'block'; } else { const newUser = { username, password, accountType, name: username, bio: '', sex: 'Prefer not to say', profilePicture: '', xp: 0, ecoCoins: 0, loginStreak: 0, lastActivityDate: null, badges: [], achievements: [], friends: [], quizzesPlayed: [], lastLogin: null, reports: 0 }; users.push(newUser); handleLogin(newUser); } });
    logo.addEventListener('click', () => { if (currentUser) showPage(currentDashboard); else showPage('landing-page'); });
    hamburgerMenu.addEventListener('click', () => { hamburgerMenu.classList.toggle('active'); navUl.classList.toggle('nav-active'); });
    document.getElementById('get-started-btn').addEventListener('click', () => showPage('signup-page'));
    document.getElementById('signup-from-login').addEventListener('click', () => showPage('signup-page'));
    document.getElementById('login-from-signup').addEventListener('click', () => showPage('login-page'));
    
    document.querySelectorAll('.back-to-dashboard-btn-new').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            showPage(currentDashboard);
        });
    });

    document.getElementById('back-to-dashboard-btn').addEventListener('click', () => showPage(currentDashboard));
    document.getElementById('review-answers-btn').addEventListener('click', populateReviewPage);
    if(createQuizBtn) createQuizBtn.addEventListener('click', (e) => { e.preventDefault(); quizModal.style.display = 'flex'; });
    
    document.querySelector('.view-profile-btn').addEventListener('click', (e) => { e.preventDefault(); populateProfilePage(); });
    document.getElementById('edit-profile-btn').addEventListener('click', (e) => { e.preventDefault(); openEditProfileModal(); });
    document.getElementById('edit-profile-form').addEventListener('submit', (e) => {
        e.preventDefault();
        if (currentUser) {
            currentUser.name = document.getElementById('edit-name').value;
            currentUser.profilePicture = document.getElementById('edit-picture').value;
            currentUser.bio = document.getElementById('edit-bio').value;
            currentUser.sex = document.getElementById('edit-sex').value;
            editProfileModal.style.display = 'none';
            showNotification("Profile updated successfully!");
            populateProfilePage(); populateProfile(); updateHeader();
        }
    });
    document.getElementById('add-friend-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const friendUsername = document.getElementById('add-friend-input').value;
        const friend = users.find(u => u.username === friendUsername);
        if (!friend) {
            showNotification("User not found.");
        } else if (friend.username === currentUser.username) {
            showNotification("You can't add yourself as a friend.");
        } else if (currentUser.friends.includes(friendUsername)) {
            showNotification("You are already friends with this user.");
        } else {
            currentUser.friends.push(friendUsername);
            showNotification(`${friend.name || friend.username} has been added as a friend!`);
            populateProfilePage();
        }
        e.target.reset();
    });

    document.querySelectorAll('.profile-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelector('.profile-tab.active').classList.remove('active');
            document.querySelector('.profile-tab-content.active').classList.remove('active');
            tab.classList.add('active');
            document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
        });
    });

    document.getElementById('change-password-form').addEventListener('submit', (e) => { e.preventDefault(); const newPassword = document.getElementById('new-password').value; if(newPassword && currentUser) { currentUser.password = newPassword; showNotification("Password updated successfully!"); document.getElementById('new-password').value = ''; } else { showNotification("Please enter a new password."); } });
    document.getElementById('report-dumping-btn').addEventListener('click', (e) => { e.preventDefault(); reportModal.style.display = 'flex'; });
    document.getElementById('report-dumping-form').addEventListener('submit', (e) => { e.preventDefault(); reportModal.style.display = 'none'; showNotification("Report submitted! Thank you. +10 XP"); if (currentUser) { currentUser.xp += 10; currentUser.reports = (currentUser.reports || 0) + 1; populateProfile(); checkAchievements(); } e.target.reset(); });
    closeModalBtns.forEach(btn => btn.addEventListener('click', () => { quizModal.style.display = 'none'; reportModal.style.display = 'none'; editProfileModal.style.display = 'none'; analyticsModal.style.display = 'none'; }));
    window.addEventListener('click', (e) => { if (e.target == quizModal) quizModal.style.display = "none"; if (e.target == reportModal) reportModal.style.display = "none"; if (e.target == editProfileModal) editProfileModal.style.display = "none"; if (e.target == analyticsModal) analyticsModal.style.display = 'none'; });
    document.getElementById('add-question-btn').addEventListener('click', (e) => { e.preventDefault(); addQuestionToModal(); });
    document.getElementById('create-quiz-form').addEventListener('submit', (e) => { e.preventDefault(); const newQuiz = { id: `q${Date.now()}`, title: document.getElementById('quiz-title-input').value, category: document.getElementById('quiz-category-input').value, questions: [], plays: [], ratings:[], comments:[] }; const questionContainers = document.querySelectorAll('#new-question-container .form-group'); questionContainers.forEach((container, index) => { const options = [ document.getElementById(`q-${index}-opt1`).value, document.getElementById(`q-${index}-opt2`).value, document.getElementById(`q-${index}-opt3`).value, document.getElementById(`q-${index}-opt4`).value, ]; const answerLetter = document.getElementById(`q-${index}-ans`).value; const answer = options[['A', 'B', 'C', 'D'].indexOf(answerLetter)]; newQuiz.questions.push({ question: document.getElementById(`q-${index}-text`).value, options: options, answer: answer, explanation: "This is a newly created quiz question." }); }); quizzes.push(newQuiz); renderQuizzes(); quizModal.style.display = 'none'; e.target.reset(); document.getElementById('new-question-container').innerHTML = ''; addQuestionToModal(); });
    window.addEventListener('scroll', () => { header.classList.toggle('scrolled', window.scrollY > 10); });

    // --- Initializer ---
    const init = () => {
        updateHeader();
        addQuestionToModal();
    };

    init();
});
