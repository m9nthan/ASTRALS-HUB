// Global variables
let currentSubject = '';
let currentClass = 6;
let chatHistory = []; // Initialize chat history array
let userProfile = {
    name: 'Space Explorer',
    level: 1,
    xp: 0,
    totalXP: 0,
    badges: [],
    achievements: [],
    streak: 0,
    lastLogin: null,
    class: 6,
    favoriteSubjects: [],
    studySessions: 0,
    questionsAsked: 0,
    topicsExplored: 0,
    hoursStudied: 0,
    quizScores: [],
    perfectScores: 0
};

let currentQuiz = {
    subject: '',
    questions: [],
    currentQuestion: 0,
    score: 0,
    streak: 0,
    selectedAnswer: null
};

let leaderboardData = {
    weekly: [],
    monthly: [],
    allTime: []
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Astrals Hub initializing...');
    
    // Initialize splash video
    initializeSplashVideo();
    
    // Hide splash screen after 8 seconds (increased from 3 seconds)
    setTimeout(() => {
        console.log('🎬 Hiding splash screen...');
        const splashScreen = document.getElementById('splashScreen');
        if (splashScreen) {
            splashScreen.style.display = 'none';
            console.log('✅ Splash screen hidden');
        } else {
            console.log('❌ Splash screen element not found');
        }
        
        // Show login modal if user is not registered
        console.log('🔍 Checking user registration...');
        checkUserRegistration();
        
        // Force show login modal after a delay if it doesn't appear
        setTimeout(() => {
            const modal = document.getElementById('loginModal');
            if (modal && !modal.classList.contains('show')) {
                console.log('⚠️ Login modal not shown, forcing display...');
                showLoginModal();
            }
        }, 1000);
    }, 8000);
    
    console.log('⚙️ Initializing app components...');
    initializeApp();
    setupEventListeners();
    loadUserProfile();
    initializeGamification();
    console.log('✅ Astrals Hub initialization complete!');
});

function initializeApp() {
    // Set up navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('href').substring(1);
            console.log('Navigating to:', targetSection);
            showSection(targetSection);
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Ensure home section is active by default
    showSection('home');
    
    // Set up message input (if it exists)
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        
        // Auto-resize textarea
        messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
    } else {
        console.log('ℹ️ Message input not found - chat functionality disabled');
    }
}

function setupEventListeners() {
    // Add any additional event listeners here
    window.addEventListener('beforeunload', function() {
        saveChatHistory();
    });
}

function showSection(sectionId) {
    console.log('Showing section:', sectionId);
    
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
        console.log('Hiding section:', section.id);
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        console.log('Showing section:', sectionId);
    } else {
        console.error('Section not found:', sectionId);
        // Fallback to home if section not found
        const homeSection = document.getElementById('home');
        if (homeSection) {
            homeSection.classList.add('active');
            console.log('Fallback to home section');
        }
    }
}

function startLearning() {
    showSection('learn');
    document.querySelector('.nav-link[href="#learn"]').classList.add('active');
    document.querySelector('.nav-link[href="#home"]').classList.remove('active');
}

function showQuiz() {
    showSection('quiz');
    document.querySelector('.nav-link[href="#quiz"]').classList.add('active');
    document.querySelector('.nav-link[href="#home"]').classList.remove('active');
}

function selectSubject(subject) {
    currentSubject = subject;
    // Award XP for subject selection
    awardXP(10, `Selected ${subject} subject`);
    
    // Update progress
    updateSubjectProgress(subject, 5);
    
    // Show success message
    showNotification(`Great choice! You earned 10 XP for selecting ${subject}!`, 'success');
    
    // Update UI
    updateUserStats();
}

async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    if (!messageInput) {
        console.log('❌ Message input not found - chat functionality not available');
        return;
    }
    
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addUserMessage(message);
    
    // Clear input
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    // Show loading
    showLoading();
    
    try {
        // Get AI response from backend
        const aiResponse = await generateAIResponse(message);
        addAIMessage(aiResponse);
        
        // Update user profile stats
        updateUserStats();
    } catch (error) {
        console.error('Error in sendMessage:', error);
        addAIMessage("I'm sorry, I'm having trouble connecting right now. Please try again in a moment.");
    } finally {
        hideLoading();
    }
}

function addUserMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) {
        console.log('❌ Chat messages container not found - chat functionality not available');
        return;
    }
    
    const messageElement = createMessageElement('user', message);
    chatMessages.appendChild(messageElement);
    scrollToBottom();
    
    // Save to chat history
    chatHistory.push({
        type: 'user',
        message: message,
        timestamp: new Date().toISOString()
    });
}

function addAIMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) {
        console.log('❌ Chat messages container not found - chat functionality not available');
        return;
    }
    
    const messageElement = createMessageElement('ai', message);
    chatMessages.appendChild(messageElement);
    scrollToBottom();
    
    // Save to chat history
    chatHistory.push({
        type: 'ai',
        message: message,
        timestamp: new Date().toISOString()
    });
}

function createMessageElement(type, message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = type === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.innerHTML = `<p>${message}</p>`;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    return messageDiv;
}

async function generateAIResponse(userMessage) {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: userMessage,
                session_id: getSessionId(),
                subject: currentSubject,
                user_level: userProfile.level
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.response;
        
    } catch (error) {
        console.error('Error getting AI response:', error);
        // Fallback to local responses if backend is not available
        return getFallbackResponse(userMessage);
    }
}

function getFallbackResponse(userMessage) {
    const responses = {
        greetings: [
            "Hello! I'm excited to help you learn! What subject would you like to explore today?",
            "Hi there! I'm your AI study buddy. What can I help you understand better?",
            "Welcome! I'm here to make learning fun and easy. What would you like to study?"
        ],
        math: [
            "Mathematics is fascinating! Let me break this down step by step for you.",
            "Great question about math! Here's how we can approach this problem...",
            "I love helping with math problems! Let me explain this concept clearly."
        ],
        science: [
            "Science is all about understanding the world around us! Let me explain this concept.",
            "Excellent scientific question! Here's what's happening here...",
            "Science can be complex, but I'll make it simple and clear for you."
        ],
        help: [
            "I'm here to help! You can ask me about any subject - math, science, history, literature, and more.",
            "Feel free to ask me anything! I can explain concepts, provide examples, or help with practice problems.",
            "I'm your learning companion! Ask me to explain, give examples, or help you practice any topic."
        ],
        default: [
            "That's an interesting question! Let me help you understand this better.",
            "I'd be happy to explain that! Here's what I think you're asking about...",
            "Great question! Let me break this down in a way that's easy to understand."
        ]
    };
    
    const message = userMessage.toLowerCase();
    
    // Determine response category
    let category = 'default';
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
        category = 'greetings';
    } else if (message.includes('math') || message.includes('calculate') || message.includes('equation')) {
        category = 'math';
    } else if (message.includes('science') || message.includes('physics') || message.includes('chemistry') || message.includes('biology')) {
        category = 'science';
    } else if (message.includes('help') || message.includes('what can you do')) {
        category = 'help';
    }
    
    // Get random response from category
    const categoryResponses = responses[category];
    const randomResponse = categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
    
    // Add subject-specific context if available
    if (currentSubject) {
        return `${randomResponse}\n\nSince you're studying ${currentSubject}, I can provide more specific examples and explanations related to that subject. What specific aspect of ${currentSubject} would you like to explore?`;
    }
    
    return randomResponse;
}

function getSessionId() {
    let sessionId = localStorage.getItem('aiStudyBuddy_sessionId');
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('aiStudyBuddy_sessionId', sessionId);
    }
    return sessionId;
}

function askQuestion(questionType) {
    const messageInput = document.getElementById('messageInput');
    if (!messageInput) {
        console.log('❌ Message input not found - chat functionality not available');
        return;
    }
    
    const questions = {
        'Explain this concept': 'Can you explain this concept in simple terms?',
        'Give me examples': 'Can you provide some examples to help me understand better?',
        'Help me practice': 'Can you give me some practice problems to work on?',
        'Summarize this topic': 'Can you summarize the key points of this topic?'
    };
    
    messageInput.value = questions[questionType] || questionType;
    messageInput.focus();
}

function clearChat() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) {
        console.log('❌ Chat messages container not found - chat functionality not available');
        return;
    }
    
    if (confirm('Are you sure you want to clear the chat history?')) {
        chatMessages.innerHTML = `
            <div class="message ai-message">
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <p>Hello! I'm your AI study buddy. I'm here to help you with your studies. What would you like to learn about today?</p>
                </div>
            </div>
        `;
        chatHistory = [];
    }
}

function saveChat() {
    if (chatHistory.length === 0) {
        alert('No chat history to save!');
        return;
    }
    
    const chatData = {
        history: chatHistory,
        subject: currentSubject,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('aiStudyBuddy_chat', JSON.stringify(chatData));
    alert('Chat history saved successfully!');
}

function loadChatHistory() {
    const savedChat = localStorage.getItem('aiStudyBuddy_chat');
    if (savedChat) {
        const chatData = JSON.parse(savedChat);
        chatHistory = chatData.history || [];
        currentSubject = chatData.subject || '';
        
        // Restore chat messages
        if (chatHistory.length > 0) {
            const chatMessages = document.getElementById('chatMessages');
            if (chatMessages) {
                chatMessages.innerHTML = '';
                
                chatHistory.forEach(entry => {
                    const messageElement = createMessageElement(entry.type, entry.message);
                    chatMessages.appendChild(messageElement);
                });
            } else {
                console.log('ℹ️ Chat messages container not found - chat history not restored');
            }
        }
    }
}

function saveChatHistory() {
    if (chatHistory.length > 0) {
        const chatData = {
            history: chatHistory,
            subject: currentSubject,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('aiStudyBuddy_chat', JSON.stringify(chatData));
    }
}

function updateUserStats() {
    userProfile.questionsAsked++;
    userProfile.hoursStudied += 0.1; // Simulate time spent
    
    // Update profile display
    updateProfileDisplay();
}

function loadUserProfile() {
    const savedProfile = localStorage.getItem('aiStudyBuddy_profile');
    if (savedProfile) {
        userProfile = { ...userProfile, ...JSON.parse(savedProfile) };
    }
    updateProfileDisplay();
}

function updateProfileDisplay() {
    // Update profile section
    const profileDetails = document.querySelector('.profile-details');
    if (profileDetails) {
        profileDetails.innerHTML = `
            <h3>${userProfile.name} Profile</h3>
            <p>Learning Level: ${userProfile.level}</p>
            <p>Favorite Subjects: ${userProfile.favoriteSubjects.join(', ')}</p>
            <p>Study Sessions: ${userProfile.studySessions}</p>
        `;
    }
    
    // Update stats
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length >= 4) {
        statNumbers[0].textContent = userProfile.questionsAsked;
        statNumbers[1].textContent = userProfile.topicsExplored;
        statNumbers[2].textContent = userProfile.hoursStudied.toFixed(1);
        statNumbers[3].textContent = userProfile.understandingRate + '%';
    }
}

function showLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.classList.add('show');
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.classList.remove('show');
}

function scrollToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Utility functions
function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
}

// Gamification Functions
function initializeGamification() {
    // Check for daily login streak
    checkDailyStreak();
    
    // Initialize leaderboard
    initializeLeaderboard();
    
    // Initialize progress tracking
    initializeProgressTracking();
    
    // Update UI with current stats
    updateUserStats();
}

function awardXP(amount, reason) {
    userProfile.xp += amount;
    userProfile.totalXP += amount;
    
    // Check for level up
    const newLevel = Math.floor(userProfile.totalXP / 100) + 1;
    if (newLevel > userProfile.level) {
        userProfile.level = newLevel;
        showLevelUpNotification();
    }
    
    // Save to localStorage
    saveUserProfile();
    
    console.log(`Awarded ${amount} XP: ${reason}`);
}

function showLevelUpNotification() {
    showNotification(`🎉 Level Up! You're now Level ${userProfile.level}!`, 'levelup');
}

function updateUserStats() {
    // Update header stats
    const levelElement = document.querySelector('.user-level');
    const pointsElement = document.querySelector('.user-points');
    
    if (levelElement) levelElement.textContent = `Level ${userProfile.level}`;
    if (pointsElement) pointsElement.textContent = `${userProfile.xp} XP`;
    
    // Update profile section
    updateProfileDisplay();
}

function updateProfileDisplay() {
    // Update profile stats
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length >= 4) {
        statNumbers[0].textContent = userProfile.totalXP;
        statNumbers[1].textContent = userProfile.badges.length;
        statNumbers[2].textContent = userProfile.quizScores.length;
        statNumbers[3].textContent = userProfile.perfectScores;
    }
    
    // Update level badge
    const levelBadge = document.querySelector('.level-badge');
    if (levelBadge) levelBadge.textContent = `Level ${userProfile.level}`;
    
    // Update profile details
    const profileDetails = document.querySelector('.profile-details');
    if (profileDetails) {
        profileDetails.innerHTML = `
            <h3>${userProfile.name || 'Space Explorer'}</h3>
            <p>Class: ${userProfile.class || 6}</p>
            <p>Age: ${userProfile.age || 'Not specified'}</p>
            <p>XP: ${userProfile.totalXP % 100} / 100</p>
            <p>Streak: ${userProfile.streak || 0} days</p>
            <p>Village: ${userProfile.villageName || 'Not specified'}</p>
            <p>District: ${userProfile.districtName || 'Not specified'}</p>
            <p>School: ${userProfile.schoolName || 'Not specified'}</p>
            <p>Study Time: ${userProfile.studyTime || 'Not specified'}</p>
            ${userProfile.villageName ? `<p>From: ${userProfile.villageName}</p>` : ''}
            ${userProfile.schoolName ? `<p>School: ${userProfile.schoolName}</p>` : ''}
        `;
    }
}

function updateSubjectProgress(subject, percentage) {
    const progressBars = document.querySelectorAll('.progress');
    const subjectCards = document.querySelectorAll('.subject-card');
    
    subjectCards.forEach((card, index) => {
        if (card.querySelector('h3').textContent === subject) {
            const progressBar = card.querySelector('.progress');
            if (progressBar) {
                const currentWidth = parseInt(progressBar.style.width) || 0;
                const newWidth = Math.min(currentWidth + percentage, 100);
                progressBar.style.width = `${newWidth}%`;
            }
        }
    });
}

function checkDailyStreak() {
    const today = new Date().toDateString();
    const lastLogin = userProfile.lastLogin;
    
    if (lastLogin !== today) {
        if (lastLogin && new Date(lastLogin).toDateString() === new Date(Date.now() - 86400000).toDateString()) {
            // Consecutive day
            userProfile.streak++;
        } else if (lastLogin !== today) {
            // New day, reset streak if not consecutive
            userProfile.streak = 1;
        }
        
        userProfile.lastLogin = today;
        awardXP(5, 'Daily login bonus');
        saveUserProfile();
    }
}

// Quiz System
function startQuiz(subject) {
    currentQuiz.subject = subject;
    currentQuiz.questions = generateQuizQuestions(subject, currentClass);
    currentQuiz.currentQuestion = 0;
    currentQuiz.score = 0;
    currentQuiz.streak = 0;
    
    showQuizQuestion();
}

function generateQuizQuestions(subject, classLevel) {
    // Sample quiz questions for different subjects and classes
    const questions = {
        'Mathematics': {
            6: [
                {
                    question: `If a farmer has 24 mangoes and gives away 8, how many are left?`,
                    options: ['16', '32', '18', '14'],
                    correct: 0,
                    xp: 10,
                    explanation: '24 - 8 = 16 mangoes left'
                },
                {
                    question: `What is the perimeter of a square field with each side 12 meters?`,
                    options: ['48 meters', '24 meters', '36 meters', '144 meters'],
                    correct: 0,
                    xp: 15,
                    explanation: 'Perimeter = 4 × side = 4 × 12 = 48 meters'
                },
                {
                    question: `If 1 kg of rice costs ₹50, how much will 3 kg cost?`,
                    options: ['₹150', '₹100', '₹200', '₹120'],
                    correct: 0,
                    xp: 12,
                    explanation: '3 × ₹50 = ₹150'
                }
            ],
            7: [
                {
                    question: `What is 15% of 200?`,
                    options: ['30', '25', '35', '40'],
                    correct: 0,
                    xp: 15,
                    explanation: '15% of 200 = (15/100) × 200 = 30'
                },
                {
                    question: `If a train travels 120 km in 2 hours, what is its speed?`,
                    options: ['60 km/h', '240 km/h', '40 km/h', '80 km/h'],
                    correct: 0,
                    xp: 18,
                    explanation: 'Speed = Distance/Time = 120/2 = 60 km/h'
                }
            ],
            8: [
                {
                    question: `Solve: 2x + 5 = 13`,
                    options: ['x = 4', 'x = 3', 'x = 5', 'x = 6'],
                    correct: 0,
                    xp: 20,
                    explanation: '2x = 13 - 5 = 8, so x = 4'
                },
                {
                    question: `What is the area of a circle with radius 7 cm? (Use π = 22/7)`,
                    options: ['154 cm²', '44 cm²', '88 cm²', '308 cm²'],
                    correct: 0,
                    xp: 25,
                    explanation: 'Area = πr² = (22/7) × 7² = 154 cm²'
                }
            ],
            9: [
                {
                    question: `What is the value of x² - 4 when x = 3?`,
                    options: ['5', '7', '9', '11'],
                    correct: 0,
                    xp: 20,
                    explanation: 'x² - 4 = 3² - 4 = 9 - 4 = 5'
                },
                {
                    question: `In a right triangle, if one angle is 30°, what is the other acute angle?`,
                    options: ['60°', '45°', '90°', '120°'],
                    correct: 0,
                    xp: 25,
                    explanation: 'Sum of angles = 180°, so 90° + 30° + x = 180°, x = 60°'
                }
            ],
            10: [
                {
                    question: `What is the discriminant of the quadratic equation x² - 5x + 6 = 0?`,
                    options: ['1', '-1', '25', '49'],
                    correct: 0,
                    xp: 30,
                    explanation: 'Discriminant = b² - 4ac = 25 - 24 = 1'
                },
                {
                    question: `What is the probability of getting a head when tossing a coin?`,
                    options: ['1/2', '1/4', '1/3', '2/3'],
                    correct: 0,
                    xp: 25,
                    explanation: 'There are 2 outcomes, 1 favorable, so P = 1/2'
                }
            ],
            11: [
                {
                    question: `What is the derivative of x³?`,
                    options: ['3x²', 'x²', '3x', 'x³/3'],
                    correct: 0,
                    xp: 35,
                    explanation: 'd/dx(x³) = 3x²'
                },
                {
                    question: `What is the value of sin(30°)?`,
                    options: ['1/2', '√3/2', '1', '0'],
                    correct: 0,
                    xp: 30,
                    explanation: 'sin(30°) = 1/2'
                }
            ],
            12: [
                {
                    question: `What is the integral of 2x?`,
                    options: ['x² + C', '2x² + C', 'x + C', '2 + C'],
                    correct: 0,
                    xp: 40,
                    explanation: '∫2x dx = 2(x²/2) + C = x² + C'
                },
                {
                    question: `What is the limit of (x² - 1)/(x - 1) as x approaches 1?`,
                    options: ['2', '0', '1', '∞'],
                    correct: 0,
                    xp: 45,
                    explanation: 'Factor: (x-1)(x+1)/(x-1) = x+1, so limit = 2'
                }
            ]
        },
        'Science': {
            6: [
                {
                    question: `What gas do plants absorb from the atmosphere during photosynthesis?`,
                    options: ['Carbon dioxide', 'Oxygen', 'Nitrogen', 'Hydrogen'],
                    correct: 0,
                    xp: 12,
                    explanation: 'Plants absorb CO₂ and release O₂ during photosynthesis'
                },
                {
                    question: `Which part of the plant absorbs water from the soil?`,
                    options: ['Roots', 'Leaves', 'Stem', 'Flowers'],
                    correct: 0,
                    xp: 10,
                    explanation: 'Roots absorb water and nutrients from the soil'
                }
            ],
            7: [
                {
                    question: `What is the chemical symbol for gold?`,
                    options: ['Au', 'Ag', 'Go', 'Gd'],
                    correct: 0,
                    xp: 15,
                    explanation: 'Au comes from the Latin word "aurum" meaning gold'
                },
                {
                    question: `Which force keeps planets in orbit around the Sun?`,
                    options: ['Gravitational force', 'Magnetic force', 'Electric force', 'Frictional force'],
                    correct: 0,
                    xp: 18,
                    explanation: 'Gravity keeps planets in their orbits'
                }
            ],
            8: [
                {
                    question: `What is the pH of pure water?`,
                    options: ['7', '0', '14', '1'],
                    correct: 0,
                    xp: 20,
                    explanation: 'Pure water is neutral with pH = 7'
                },
                {
                    question: `Which organelle is known as the powerhouse of the cell?`,
                    options: ['Mitochondria', 'Nucleus', 'Ribosome', 'Chloroplast'],
                    correct: 0,
                    xp: 22,
                    explanation: 'Mitochondria produce energy (ATP) for the cell'
                }
            ],
            9: [
                {
                    question: `What is the speed of light in vacuum?`,
                    options: ['3 × 10⁸ m/s', '3 × 10⁶ m/s', '3 × 10¹⁰ m/s', '3 × 10⁴ m/s'],
                    correct: 0,
                    xp: 25,
                    explanation: 'Speed of light = 299,792,458 m/s ≈ 3 × 10⁸ m/s'
                },
                {
                    question: `What is the chemical formula for methane?`,
                    options: ['CH₄', 'C₂H₆', 'CO₂', 'H₂O'],
                    correct: 0,
                    xp: 20,
                    explanation: 'Methane has one carbon and four hydrogen atoms'
                }
            ],
            10: [
                {
                    question: `What is the unit of electric current?`,
                    options: ['Ampere', 'Volt', 'Watt', 'Ohm'],
                    correct: 0,
                    xp: 25,
                    explanation: 'Ampere (A) is the SI unit of electric current'
                },
                {
                    question: `Which blood group is known as the universal donor?`,
                    options: ['O negative', 'A positive', 'B positive', 'AB positive'],
                    correct: 0,
                    xp: 30,
                    explanation: 'O negative can be donated to any blood type'
                }
            ],
            11: [
                {
                    question: `What is the first law of thermodynamics?`,
                    options: ['Energy cannot be created or destroyed', 'Entropy always increases', 'Heat flows from hot to cold', 'Pressure and volume are inversely related'],
                    correct: 0,
                    xp: 35,
                    explanation: 'First law states conservation of energy'
                },
                {
                    question: `What is the molecular formula for glucose?`,
                    options: ['C₆H₁₂O₆', 'C₆H₁₀O₅', 'C₅H₁₀O₅', 'C₆H₁₄O₆'],
                    correct: 0,
                    xp: 30,
                    explanation: 'Glucose has 6 carbons, 12 hydrogens, and 6 oxygens'
                }
            ],
            12: [
                {
                    question: `What is the uncertainty principle in quantum mechanics?`,
                    options: ['Position and momentum cannot be precisely measured simultaneously', 'Energy and time are inversely related', 'Wave and particle nature are complementary', 'All of the above'],
                    correct: 3,
                    xp: 45,
                    explanation: 'Heisenberg uncertainty principle has multiple formulations'
                },
                {
                    question: `What is the half-life of Carbon-14?`,
                    options: ['5730 years', '573 years', '57300 years', '573000 years'],
                    correct: 0,
                    xp: 40,
                    explanation: 'C-14 has a half-life of approximately 5730 years'
                }
            ]
        },
        'English': {
            6: [
                {
                    question: `What is the past tense of "go"?`,
                    options: ['went', 'goed', 'gone', 'going'],
                    correct: 0,
                    xp: 10,
                    explanation: 'The past tense of "go" is "went"'
                },
                {
                    question: `Which word is an adjective in: "The beautiful sunset"?`,
                    options: ['beautiful', 'sunset', 'the', 'All of them'],
                    correct: 0,
                    xp: 12,
                    explanation: '"Beautiful" describes the noun "sunset"'
                }
            ],
            7: [
                {
                    question: `What is a synonym for "happy"?`,
                    options: ['joyful', 'sad', 'angry', 'tired'],
                    correct: 0,
                    xp: 12,
                    explanation: 'Joyful means the same as happy'
                },
                {
                    question: `Which sentence is in passive voice?`,
                    options: ['The book was read by me', 'I read the book', 'Reading the book', 'I will read the book'],
                    correct: 0,
                    xp: 15,
                    explanation: 'Passive voice: subject receives the action'
                }
            ],
            8: [
                {
                    question: `What is the literary device in: "The stars danced playfully"?`,
                    options: ['Personification', 'Metaphor', 'Simile', 'Alliteration'],
                    correct: 0,
                    xp: 18,
                    explanation: 'Giving human qualities to non-human things'
                },
                {
                    question: `What is the plural of "crisis"?`,
                    options: ['crises', 'crisises', 'crisis', 'crisi'],
                    correct: 0,
                    xp: 20,
                    explanation: 'Words ending in -is become -es in plural'
                }
            ],
            9: [
                {
                    question: `What is the theme of a story?`,
                    options: ['The main message or lesson', 'The setting', 'The characters', 'The plot'],
                    correct: 0,
                    xp: 22,
                    explanation: 'Theme is the central message or lesson'
                },
                {
                    question: `Which is a compound sentence?`,
                    options: ['I like tea, and she likes coffee', 'I like tea', 'Liking tea', 'Tea is good'],
                    correct: 0,
                    xp: 25,
                    explanation: 'Compound sentence has two independent clauses joined by conjunction'
                }
            ],
            10: [
                {
                    question: `What is the tone of: "I can\'t believe you did that!"?`,
                    options: ['Shocked/Disappointed', 'Happy', 'Calm', 'Excited'],
                    correct: 0,
                    xp: 25,
                    explanation: 'The exclamation and "can\'t believe" show shock'
                },
                {
                    question: `What is the purpose of a thesis statement?`,
                    options: ['To state the main argument', 'To provide evidence', 'To conclude', 'To introduce characters'],
                    correct: 0,
                    xp: 30,
                    explanation: 'Thesis statement presents the main argument'
                }
            ],
            11: [
                {
                    question: `What is the difference between "affect" and "effect"?`,
                    options: ['Affect is a verb, effect is a noun', 'Effect is a verb, affect is a noun', 'They are the same', 'They are opposites'],
                    correct: 0,
                    xp: 30,
                    explanation: 'Affect (verb) = to influence; Effect (noun) = result'
                },
                {
                    question: `What is the purpose of a counterargument?`,
                    options: ['To address opposing views', 'To support your argument', 'To conclude', 'To introduce the topic'],
                    correct: 0,
                    xp: 35,
                    explanation: 'Counterarguments address opposing viewpoints'
                }
            ],
            12: [
                {
                    question: `What is the purpose of rhetorical questions?`,
                    options: ['To engage the audience', 'To provide answers', 'To confuse readers', 'To end arguments'],
                    correct: 0,
                    xp: 35,
                    explanation: 'Rhetorical questions engage and make readers think'
                },
                {
                    question: `What is the difference between denotation and connotation?`,
                    options: ['Denotation is literal meaning, connotation is implied meaning', 'Connotation is literal, denotation is implied', 'They are the same', 'They are opposites'],
                    correct: 0,
                    xp: 40,
                    explanation: 'Denotation = dictionary meaning; Connotation = emotional/implied meaning'
                }
            ]
        },
        'Social Studies': {
            6: [
                {
                    question: `What is the capital of India?`,
                    options: ['New Delhi', 'Mumbai', 'Kolkata', 'Chennai'],
                    correct: 0,
                    xp: 10,
                    explanation: 'New Delhi is the capital of India'
                },
                {
                    question: `Which is the largest state in India by area?`,
                    options: ['Rajasthan', 'Madhya Pradesh', 'Maharashtra', 'Uttar Pradesh'],
                    correct: 0,
                    xp: 12,
                    explanation: 'Rajasthan is the largest state by area'
                }
            ],
            7: [
                {
                    question: `Who was the first Prime Minister of India?`,
                    options: ['Jawaharlal Nehru', 'Mahatma Gandhi', 'Sardar Patel', 'Dr. Rajendra Prasad'],
                    correct: 0,
                    xp: 15,
                    explanation: 'Jawaharlal Nehru was the first PM of independent India'
                },
                {
                    question: `What is the currency of Japan?`,
                    options: ['Yen', 'Dollar', 'Euro', 'Pound'],
                    correct: 0,
                    xp: 12,
                    explanation: 'Japanese Yen is the currency of Japan'
                }
            ],
            8: [
                {
                    question: `Which battle marked the beginning of British rule in India?`,
                    options: ['Battle of Plassey', 'Battle of Panipat', 'Battle of Haldighati', 'Battle of Buxar'],
                    correct: 0,
                    xp: 18,
                    explanation: 'Battle of Plassey (1757) established British dominance'
                },
                {
                    question: `What is the largest ocean on Earth?`,
                    options: ['Pacific Ocean', 'Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean'],
                    correct: 0,
                    xp: 15,
                    explanation: 'Pacific Ocean covers about 1/3 of Earth'
                }
            ],
            9: [
                {
                    question: `What is the significance of the year 1947 in Indian history?`,
                    options: ['India gained independence', 'India became a republic', 'First general election', 'Constitution was adopted'],
                    correct: 0,
                    xp: 20,
                    explanation: 'India gained independence from British rule on August 15, 1947'
                },
                {
                    question: `What is the main function of the Parliament?`,
                    options: ['To make laws', 'To enforce laws', 'To interpret laws', 'To execute laws'],
                    correct: 0,
                    xp: 22,
                    explanation: 'Parliament is the legislative body that makes laws'
                }
            ],
            10: [
                {
                    question: `What is the difference between weather and climate?`,
                    options: ['Weather is short-term, climate is long-term', 'Climate is short-term, weather is long-term', 'They are the same', 'Weather is global, climate is local'],
                    correct: 0,
                    xp: 25,
                    explanation: 'Weather = daily conditions; Climate = average over time'
                },
                {
                    question: `What is the main cause of inflation?`,
                    options: ['Increase in money supply', 'Decrease in production', 'Increase in taxes', 'All of the above'],
                    correct: 3,
                    xp: 30,
                    explanation: 'Inflation can be caused by multiple factors'
                }
            ],
            11: [
                {
                    question: `What is the concept of federalism?`,
                    options: ['Division of power between central and state governments', 'Concentration of power in central government', 'Power only with state governments', 'No government power'],
                    correct: 0,
                    xp: 35,
                    explanation: 'Federalism divides power between different levels of government'
                },
                {
                    question: `What is the significance of the Green Revolution?`,
                    options: ['Increased agricultural production', 'Reduced pollution', 'Increased industrialization', 'Reduced population'],
                    correct: 0,
                    xp: 30,
                    explanation: 'Green Revolution increased food production through new techniques'
                }
            ],
            12: [
                {
                    question: `What is the concept of sustainable development?`,
                    options: ['Development that meets present needs without compromising future', 'Fast economic growth', 'Maximum resource extraction', 'Urban development only'],
                    correct: 0,
                    xp: 40,
                    explanation: 'Sustainable development balances present and future needs'
                },
                {
                    question: `What is the role of the judiciary in democracy?`,
                    options: ['To interpret and protect the constitution', 'To make laws', 'To execute laws', 'To collect taxes'],
                    correct: 0,
                    xp: 35,
                    explanation: 'Judiciary interprets laws and protects constitutional rights'
                }
            ]
        }
    };
    
    // Return questions for the specific subject and class, or default to class 6 if not found
    const subjectQuestions = questions[subject];
    if (subjectQuestions && subjectQuestions[classLevel]) {
        return subjectQuestions[classLevel];
    } else if (subjectQuestions && subjectQuestions[6]) {
        return subjectQuestions[6]; // Fallback to class 6
    } else {
        return []; // No questions available
    }
}

function showQuizQuestion() {
    const questionContainer = document.getElementById('quizQuestion');
    const optionsContainer = document.getElementById('quizOptions');
    const controlsContainer = document.getElementById('quizControls');
    
    if (currentQuiz.currentQuestion >= currentQuiz.questions.length) {
        endQuiz();
        return;
    }
    
    const question = currentQuiz.questions[currentQuiz.currentQuestion];
    
    questionContainer.innerHTML = `
        <h4>Question ${currentQuiz.currentQuestion + 1} of ${currentQuiz.questions.length}</h4>
        <p>${question.question}</p>
    `;
    
    optionsContainer.innerHTML = '';
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'quiz-option';
        optionElement.textContent = option;
        optionElement.onclick = () => selectAnswer(index);
        optionsContainer.appendChild(optionElement);
    });
    
    optionsContainer.style.display = 'block';
    controlsContainer.style.display = 'flex';
    
    // Update quiz stats
    updateQuizStats();
}

function selectAnswer(index) {
    // Remove previous selection
    document.querySelectorAll('.quiz-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selection to clicked option
    document.querySelectorAll('.quiz-option')[index].classList.add('selected');
    currentQuiz.selectedAnswer = index;
}

function submitAnswer() {
    if (currentQuiz.selectedAnswer === null) {
        showNotification('Please select an answer!', 'error');
        return;
    }
    
    const question = currentQuiz.questions[currentQuiz.currentQuestion];
    const isCorrect = currentQuiz.selectedAnswer === question.correct;
    
    if (isCorrect) {
        currentQuiz.score++;
        currentQuiz.streak++;
        awardXP(question.xp, `Correct answer in ${currentQuiz.subject}`);
        showNotification(`Correct! +${question.xp} XP`, 'success');
    } else {
        currentQuiz.streak = 0;
        showNotification('Incorrect answer', 'error');
    }
    
    currentQuiz.currentQuestion++;
    currentQuiz.selectedAnswer = null;
    
    setTimeout(() => {
        showQuizQuestion();
    }, 1000);
}

function skipQuestion() {
    currentQuiz.currentQuestion++;
    currentQuiz.selectedAnswer = null;
    showQuizQuestion();
}

function endQuiz() {
    const score = currentQuiz.score;
    const total = currentQuiz.questions.length;
    const percentage = Math.round((score / total) * 100);
    
    // Award bonus XP based on performance
    let bonusXP = 0;
    if (percentage === 100) {
        bonusXP = 50;
        userProfile.perfectScores++;
        showNotification('Perfect Score! +50 bonus XP!', 'perfect');
    } else if (percentage >= 80) {
        bonusXP = 25;
        showNotification('Great job! +25 bonus XP!', 'success');
    } else if (percentage >= 60) {
        bonusXP = 10;
        showNotification('Good effort! +10 bonus XP!', 'success');
    }
    
    if (bonusXP > 0) {
        awardXP(bonusXP, `Quiz completion bonus`);
    }
    
    // Save quiz score
    userProfile.quizScores.push({
        subject: currentQuiz.subject,
        score: score,
        total: total,
        percentage: percentage,
        date: new Date().toISOString()
    });
    
    // Calculate total XP earned
    let totalXP = 0;
    for (let i = 0; i < score; i++) {
        if (currentQuiz.questions[i]) {
            totalXP += currentQuiz.questions[i].xp;
        }
    }
    totalXP += bonusXP;
    
    // Reset quiz UI
    document.getElementById('quizQuestion').innerHTML = `
        <h4>Quiz Complete!</h4>
        <p>You scored ${score}/${total} (${percentage}%)</p>
        <p>Total XP earned: ${totalXP}</p>
        <div class="quiz-subjects">
            <button class="quiz-subject-btn" onclick="startQuiz('Mathematics')">
                <i class="fas fa-calculator"></i>
                Mathematics
            </button>
            <button class="quiz-subject-btn" onclick="startQuiz('Science')">
                <i class="fas fa-flask"></i>
                Science
            </button>
            <button class="quiz-subject-btn" onclick="startQuiz('English')">
                <i class="fas fa-book-open"></i>
                English
            </button>
            <button class="quiz-subject-btn" onclick="startQuiz('Social Studies')">
                <i class="fas fa-globe"></i>
                Social Studies
            </button>
        </div>
    `;
    
    document.getElementById('quizOptions').style.display = 'none';
    document.getElementById('quizControls').style.display = 'none';
    
    updateUserStats();
    updateMasteryStats();
    updateAchievementTimeline();
    saveUserProfile();
}

function updateQuizStats() {
    const scoreElement = document.querySelector('.quiz-score');
    const streakElement = document.querySelector('.quiz-streak');
    
    if (scoreElement) scoreElement.textContent = `Score: ${currentQuiz.score}`;
    if (streakElement) streakElement.textContent = `Streak: ${currentQuiz.streak}`;
}

// Leaderboard System
function initializeLeaderboard() {
    // Generate sample leaderboard data
    leaderboardData.weekly = generateSampleLeaderboard();
    leaderboardData.monthly = generateSampleLeaderboard();
    leaderboardData.allTime = generateSampleLeaderboard();
    
    showLeaderboard('weekly');
}

function generateSampleLeaderboard() {
    const names = ['Cosmic Master', 'Star Explorer', 'Galaxy Scholar', 'Space Cadet', 'Astro Student'];
    const levels = [15, 12, 10, 8, 6];
    const scores = [2500, 2100, 1800, 1500, 1200];
    
    return names.map((name, index) => ({
        name: name,
        level: levels[index],
        score: scores[index],
        avatar: index < 3 ? ['crown', 'medal', 'award'][index] : 'user-astronaut'
    }));
}

function showLeaderboard(period) {
    const data = leaderboardData[period];
    const leaderboardList = document.querySelector('.leaderboard-list');
    
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[onclick="showLeaderboard('${period}')"]`).classList.add('active');
    
    // Clear existing items
    leaderboardList.innerHTML = '';
    
    // Add leaderboard items
    data.forEach((player, index) => {
        const item = document.createElement('div');
        item.className = `leaderboard-item rank-${index + 1}`;
        item.innerHTML = `
            <div class="rank">${index + 1}</div>
            <div class="player-info">
                <div class="player-avatar">
                    <i class="fas fa-${player.avatar}"></i>
                </div>
                <div class="player-details">
                    <h4>${player.name}</h4>
                    <p>Level ${player.level} • ${player.score} XP</p>
                </div>
            </div>
            <div class="player-score">${player.score}</div>
        `;
        leaderboardList.appendChild(item);
    });
}

// Utility Functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'rgba(0, 212, 255, 0.9)' : 
                    type === 'error' ? 'rgba(255, 0, 0, 0.9)' : 
                    type === 'levelup' ? 'rgba(255, 215, 0, 0.9)' : 
                    type === 'perfect' ? 'rgba(255, 215, 0, 0.9)' : 'rgba(0, 212, 255, 0.9)'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function saveUserProfile() {
    localStorage.setItem('astralsHub_profile', JSON.stringify(userProfile));
}

function loadUserProfile() {
    const saved = localStorage.getItem('astralsHub_profile');
    if (saved) {
        userProfile = { ...userProfile, ...JSON.parse(saved) };
    }
    updateUserStats();
}

// User Registration System
function checkUserRegistration() {
    const isRegistered = localStorage.getItem('astralsHub_registered');
    console.log('🔍 Registration check - isRegistered:', isRegistered);
    if (!isRegistered) {
        console.log('📝 User not registered, showing login modal...');
        showLoginModal();
    } else {
        console.log('✅ User already registered');
    }
}

function showLoginModal() {
    const modal = document.getElementById('loginModal');
    console.log('🔍 Looking for login modal element:', modal);
    if (modal) {
        console.log('📝 Modal found, adding show class...');
        modal.classList.add('show');
        
        // Scroll modal to top when opened
        modal.scrollTop = 0;
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.scrollTop = 0;
        }
        
        console.log('✅ Login modal classes:', modal.className);
        console.log('✅ Login modal display style:', window.getComputedStyle(modal).display);
        console.log('✅ Login modal visibility:', window.getComputedStyle(modal).visibility);
        console.log('✅ Login modal opacity:', window.getComputedStyle(modal).opacity);
    } else {
        console.log('❌ Login modal element not found');
    }
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.remove('show');
        console.log('✅ Login modal closed');
    }
}

function registerStudent() {
    const name = document.getElementById('studentName').value.trim();
    const age = document.getElementById('studentAge').value;
    const studentClass = document.getElementById('studentClass').value;
    const gender = document.getElementById('studentGender').value;
    const schoolName = document.getElementById('schoolName').value.trim();
    const villageName = document.getElementById('villageName').value.trim();
    const districtName = document.getElementById('districtName').value.trim();
    const parentContact = document.getElementById('parentContact') ? document.getElementById('parentContact').value.trim() : '';
    const learningGoals = document.getElementById('learningGoals') ? document.getElementById('learningGoals').value.trim() : '';
    const studyTime = document.getElementById('studyTime').value;
    
    // Get selected subjects
    const subjectCheckboxes = document.querySelectorAll('.subject-interest:checked');
    const favoriteSubjects = Array.from(subjectCheckboxes).map(cb => cb.value);
    
    // Validate required fields
    if (!name || !age || !studentClass || !gender || !villageName || !districtName || !studyTime) {
        showNotification('Please fill in all required fields!', 'error');
        return;
    }
    
    if (favoriteSubjects.length === 0) {
        showNotification('Please select at least one favorite subject!', 'error');
        return;
    }
    
    // Update user profile with comprehensive registration data
    userProfile.name = name;
    userProfile.age = parseInt(age);
    userProfile.class = parseInt(studentClass);
    userProfile.gender = gender;
    userProfile.schoolName = schoolName;
    userProfile.villageName = villageName;
    userProfile.districtName = districtName;
    userProfile.parentContact = parentContact;
    userProfile.learningGoals = learningGoals;
    userProfile.favoriteSubjects = favoriteSubjects;
    userProfile.studyTime = studyTime;
    userProfile.registrationDate = new Date().toISOString();
    
    // Mark as registered
    localStorage.setItem('astralsHub_registered', 'true');
    localStorage.setItem('astralsHub_profile', JSON.stringify(userProfile));
    
    // Close modal and show welcome message
    closeLoginModal();
    showNotification(`Welcome to Astrals Hub, ${name}! 🚀 Your cosmic learning journey begins now!`, 'success');
    
    // Award registration bonus
    awardXP(150, 'Complete Registration Bonus');
    
    // Update UI
    updateUserStats();
    updateProfileDisplay();
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('loginModal');
    if (event.target === modal) {
        closeLoginModal();
    }
}

// Progress Tracking and Analytics
function initializeProgressTracking() {
    updateMasteryStats();
    updateStreakCalendar();
    updateAchievementTimeline();
}

function updateMasteryStats() {
    const masteryItems = document.querySelectorAll('.mastery-item');
    const subjects = ['Mathematics', 'Science', 'English', 'Social Studies'];
    
    masteryItems.forEach((item, index) => {
        const subject = subjects[index];
        const masteryFill = item.querySelector('.mastery-fill');
        const masteryPercentage = item.querySelector('.mastery-percentage');
        
        // Calculate mastery based on quiz scores and activities
        const mastery = calculateSubjectMastery(subject);
        
        if (masteryFill && masteryPercentage) {
            masteryFill.style.width = `${mastery}%`;
            masteryPercentage.textContent = `${mastery}%`;
        }
    });
}

function calculateSubjectMastery(subject) {
    // Calculate mastery based on quiz scores and activities
    const subjectQuizzes = userProfile.quizScores.filter(quiz => 
        quiz.subject.toLowerCase() === subject.toLowerCase()
    );
    
    if (subjectQuizzes.length === 0) return 0;
    
    const averageScore = subjectQuizzes.reduce((sum, quiz) => sum + quiz.percentage, 0) / subjectQuizzes.length;
    return Math.round(averageScore);
}

function updateStreakCalendar() {
    const calendarGrid = document.getElementById('streakCalendar');
    if (!calendarGrid) return;
    
    // Generate calendar for current month
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    calendarGrid.innerHTML = '';
    
    // Add calendar days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        // Mark today
        if (day === today.getDate()) {
            dayElement.classList.add('today');
        }
        
        // Mark active days (simulate based on streak)
        if (day <= userProfile.streak) {
            dayElement.classList.add('active');
        }
        
        calendarGrid.appendChild(dayElement);
    }
    
    // Update streak number
    const streakNumber = document.querySelector('.streak-number');
    if (streakNumber) {
        streakNumber.textContent = userProfile.streak;
    }
}

function updateAchievementTimeline() {
    const timeline = document.querySelector('.achievement-timeline');
    if (!timeline) return;
    
    // Add achievements based on user progress
    const achievements = [];
    
    // Registration achievement
    if (userProfile.registrationDate) {
        achievements.push({
            title: 'First Login',
            description: 'Started your cosmic journey',
            date: 'Today',
            completed: true
        });
    }
    
    // First quiz achievement
    if (userProfile.quizScores.length > 0) {
        achievements.push({
            title: 'First Quiz',
            description: 'Completed your first quiz',
            date: new Date(userProfile.quizScores[0].date).toLocaleDateString(),
            completed: true
        });
    } else {
        achievements.push({
            title: 'First Quiz',
            description: 'Complete your first quiz',
            date: 'Coming soon',
            completed: false
        });
    }
    
    // Level up achievements
    if (userProfile.level > 1) {
        achievements.push({
            title: 'Level Up!',
            description: `Reached Level ${userProfile.level}`,
            date: 'Recently',
            completed: true
        });
    }
    
    // Perfect score achievement
    if (userProfile.perfectScores > 0) {
        achievements.push({
            title: 'Perfect Score',
            description: `Achieved ${userProfile.perfectScores} perfect score(s)`,
            date: 'Recently',
            completed: true
        });
    }
    
    // Update timeline HTML
    timeline.innerHTML = achievements.map(achievement => `
        <div class="timeline-item">
            <div class="timeline-marker ${achievement.completed ? 'completed' : ''}"></div>
            <div class="timeline-content">
                <h5>${achievement.title}</h5>
                <p>${achievement.description}</p>
                <span class="timeline-date">${achievement.date}</span>
            </div>
        </div>
    `).join('');
}

function showProgress() {
    showSection('progress');
    document.querySelector('.nav-link[href="#progress"]').classList.add('active');
    document.querySelector('.nav-link[href="#home"]').classList.remove('active');
    
    // Update progress data when section is shown
    initializeProgressTracking();
}

// Splash Video Functions
let videoInitialized = false;

function initializeSplashVideo() {
    if (videoInitialized) {
        console.log('🎬 Video already initialized, skipping...');
        return;
    }
    
    const splashVideo = document.getElementById('splashVideo');
    if (splashVideo) {
        console.log('🎬 Initializing splash video...');
        videoInitialized = true;
        
        // Set video properties
        splashVideo.muted = true;
        splashVideo.loop = true;
        splashVideo.playsInline = true;
        splashVideo.preload = 'auto';
        
        // Ensure video starts from beginning
        splashVideo.currentTime = 0;
        
        // Handle video loading errors first
        splashVideo.addEventListener('error', function(e) {
            console.log('❌ Video failed to load:', e);
            console.log('Using animated background instead');
            // Hide video and show animated background
            splashVideo.style.display = 'none';
            const splashAnimation = document.querySelector('.splash-animation');
            if (splashAnimation) {
                splashAnimation.style.display = 'block';
                console.log('✅ Animated background displayed');
            }
        });
        
        // Show video when it loads successfully
        splashVideo.addEventListener('loadeddata', function() {
            console.log('✅ Video data loaded successfully');
            splashVideo.style.display = 'block';
            const splashAnimation = document.querySelector('.splash-animation');
            if (splashAnimation) {
                splashAnimation.style.display = 'none';
            }
        });
        
        // Handle video loading progress
        splashVideo.addEventListener('loadstart', function() {
            console.log('🎬 Video loading started');
        });
        
        splashVideo.addEventListener('progress', function() {
            console.log('📹 Video loading progress:', splashVideo.buffered.length > 0 ? splashVideo.buffered.end(0) : 0, '/', splashVideo.duration || 'unknown');
        });
        
        splashVideo.addEventListener('canplaythrough', function() {
            console.log('✅ Video can play through completely');
        });
        
        // Single video play attempt when ready
        splashVideo.addEventListener('canplay', function() {
            console.log('✅ Video ready to play');
            if (splashVideo.paused) {
                console.log('🎬 Starting video playback...');
                splashVideo.play().catch(error => {
                    console.log('❌ Video autoplay failed:', error);
                    // Fallback: try to play when user interacts
                    document.addEventListener('click', () => {
                        splashVideo.play().then(() => {
                            console.log('✅ Video started after user interaction');
                        }).catch(e => console.log('❌ Video play failed:', e));
                    }, { once: true });
                });
            }
        });
        
        // Handle video duration
        splashVideo.addEventListener('loadedmetadata', function() {
            console.log(`📹 Video duration: ${splashVideo.duration} seconds`);
        });
        
        // Try to load the video
        splashVideo.load();
        
        // Pause video when splash screen fades out
        setTimeout(() => {
            if (splashVideo && !splashVideo.paused) {
                splashVideo.pause();
                console.log('⏸️ Video paused as splash screen fades out');
            }
        }, 8000);
    } else {
        console.log('❌ Splash video element not found');
    }
}

// Export functions for potential backend integration
window.AstralsHub = {
    startLearning,
    showQuiz,
    selectSubject,
    startQuiz,
    submitAnswer,
    skipQuestion,
    showLeaderboard,
    awardXP,
    updateUserStats,
    userProfile,
    currentQuiz,
    initializeSplashVideo
};
