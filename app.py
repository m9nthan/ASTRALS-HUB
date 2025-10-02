from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import json
import os
from datetime import datetime, timedelta
import logging
import random
import hashlib

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Configuration
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# In-memory storage (in production, use a database)
chat_sessions = {}
user_profiles = {}
gamification_data = {}
quiz_data = {}
achievements_data = {}

class AstralsHub:
    """Astrals Hub - Gamified Learning Platform for Rural Education"""
    
    def __init__(self):
        self.knowledge_base = {
            'mathematics': {
                'topics': ['basic_arithmetic', 'fractions', 'percentages', 'geometry', 'algebra', 'measurements'],
                'responses': {
                    'basic_arithmetic': "Let's start with basic math using examples from daily life! If you have 15 mangoes and sell 8, how many are left? 15 - 8 = 7 mangoes. This is subtraction!",
                    'fractions': "Fractions are like sharing! If you have 1 whole roti and share it equally between 2 people, each gets 1/2 (half) of the roti.",
                    'percentages': "Percentages help us understand discounts and savings. If a seed packet costs ₹100 and has 20% off, you save ₹20 and pay ₹80.",
                    'geometry': "Geometry is everywhere in farming! Your field might be rectangular (length × width = area). A circular well has a radius and circumference.",
                    'algebra': "Algebra uses letters for unknown numbers. If you have 'x' cows and buy 3 more, you have 'x + 3' cows total.",
                    'measurements': "In farming, we measure land in acres, crops in kilograms, and distances in kilometers. 1 acre = 4047 square meters."
                }
            },
            'science': {
                'topics': ['agriculture', 'weather', 'plants_animals', 'soil_water', 'health_hygiene', 'renewable_energy'],
                'responses': {
                    'agriculture': "Agriculture is the science of growing crops and raising animals. Different crops need different amounts of water, sunlight, and nutrients from soil.",
                    'weather': "Weather affects farming! Monsoon brings rain for crops, but too much rain can flood fields. Temperature affects when to plant seeds.",
                    'plants_animals': "Plants make their own food using sunlight (photosynthesis). Animals depend on plants or other animals for food. This creates a food chain.",
                    'soil_water': "Good soil has nutrients like nitrogen, phosphorus, and potassium. Water is essential for all life - plants need it to grow and animals need it to survive.",
                    'health_hygiene': "Clean water, proper sanitation, and balanced diet keep us healthy. Washing hands prevents diseases. Vaccination protects us from serious illnesses.",
                    'renewable_energy': "Solar panels use sunlight to make electricity. Windmills use wind power. These are renewable because sun and wind never run out!"
                }
            },
            'english': {
                'topics': ['basic_english', 'grammar', 'vocabulary', 'reading', 'writing', 'communication'],
                'responses': {
                    'basic_english': "English helps us communicate with people from different places. Start with simple words: 'Hello' means 'Namaste', 'Thank you' means 'Dhanyawad'.",
                    'grammar': "Grammar helps us speak and write correctly. 'I am' (present), 'I was' (past), 'I will be' (future). Subject + verb + object makes a sentence.",
                    'vocabulary': "Learn new words every day! 'Farmer' grows crops, 'village' is where we live, 'market' is where we buy things. Use a dictionary to find meanings.",
                    'reading': "Reading improves our knowledge. Start with simple stories, then newspapers. Read aloud to improve pronunciation and understanding.",
                    'writing': "Writing helps us express thoughts clearly. Start with simple sentences, then paragraphs. Practice writing about your daily life and experiences.",
                    'communication': "Good communication means speaking clearly and listening carefully. Use simple words, speak slowly, and ask questions if you don't understand."
                }
            },
            'social_studies': {
                'topics': ['indian_history', 'geography', 'government', 'rights_duties', 'culture_traditions', 'economics'],
                'responses': {
                    'indian_history': "India has a rich history! Ancient civilizations like Harappa, great empires like Maurya and Gupta, and the freedom struggle led by Gandhi shaped our country.",
                    'geography': "India has diverse geography: Himalayas in north, Thar desert in west, coastal plains in south. Different regions have different climates and crops.",
                    'government': "India is a democracy. People elect leaders through voting. Panchayat governs villages, state government manages states, central government manages the country.",
                    'rights_duties': "Every citizen has rights (freedom of speech, education) and duties (paying taxes, following laws). Rights and duties go together for a good society.",
                    'culture_traditions': "India has diverse cultures! Different states have different languages, festivals, food, and traditions. Unity in diversity is our strength.",
                    'economics': "Economics studies how people earn, spend, and save money. In villages, people earn through farming, handicrafts, and small businesses. Budgeting helps manage money."
                }
            }
        }
    
    def generate_response(self, user_message, subject=None, user_level='intermediate'):
        """Generate an AI response based on user input"""
        message_lower = user_message.lower()
        
        # Greeting responses
        if any(word in message_lower for word in ['hello', 'hi', 'hey', 'good morning', 'good afternoon']):
            return self._get_greeting_response(subject)
        
        # Help requests
        if any(word in message_lower for word in ['help', 'what can you do', 'how do you work']):
            return self._get_help_response()
        
        # Subject-specific responses
        if subject and subject.lower() in self.knowledge_base:
            return self._get_subject_response(user_message, subject.lower())
        
        # General educational responses
        return self._get_general_response(user_message, user_level)
    
    def _get_greeting_response(self, subject=None):
        greetings = [
            "Hello! I'm your AI Study Buddy, ready to help you learn!",
            "Hi there! I'm excited to be your learning companion today!",
            "Welcome! I'm here to make your studies more engaging and effective!"
        ]
        
        base_greeting = greetings[hash(datetime.now().strftime("%H")) % len(greetings)]
        
        if subject:
            return f"{base_greeting} I see you're interested in {subject}. What specific topic would you like to explore?"
        
        return f"{base_greeting} What subject would you like to study today?"
    
    def _get_help_response(self):
        return """I'm your AI Study Buddy, and I'm here to help you learn! Here's what I can do:

📚 **Subject Support**: I can help with Mathematics, Science, English, History, and more
🔍 **Concept Explanation**: I break down complex topics into easy-to-understand explanations
💡 **Examples & Practice**: I provide examples and practice problems to reinforce learning
📝 **Study Tips**: I offer personalized study strategies and learning techniques
🎯 **Progress Tracking**: I help you track your learning progress and achievements

Just ask me about any topic, and I'll do my best to help you understand it better!"""
    
    def _get_subject_response(self, user_message, subject):
        subject_data = self.knowledge_base[subject]
        message_lower = user_message.lower()
        
        # Check for specific topics within the subject
        for topic in subject_data['topics']:
            if topic.replace('_', ' ') in message_lower:
                return subject_data['responses'].get(topic, f"Great question about {topic}! Let me explain this concept in detail...")
        
        # General subject response
        return f"Excellent question about {subject.title()}! I'd be happy to help you understand this better. Could you be more specific about which aspect of {subject} you'd like to explore?"
    
    def _get_general_response(self, user_message, user_level):
        # Analyze the message for educational intent
        if any(word in user_message.lower() for word in ['explain', 'what is', 'how does', 'why']):
            return "That's a great question! I'd be happy to explain this concept. Could you provide a bit more context or specify which subject area this relates to?"
        
        if any(word in user_message.lower() for word in ['example', 'examples', 'show me']):
            return "I'd love to provide examples! To give you the most relevant examples, could you tell me which subject or topic you're studying?"
        
        if any(word in user_message.lower() for word in ['practice', 'exercise', 'problem']):
            return "Practice is essential for learning! I can help you with practice problems. What subject and topic would you like to practice?"
        
        # Default response
        return "I'm here to help you learn! Could you tell me more about what you'd like to study or which subject you're working on? I can provide explanations, examples, and practice problems."
    
    def generate_quiz_questions(self, subject, class_level):
        """Generate quiz questions for a specific subject and class level"""
        questions = {
            'mathematics': {
                6: [
                    {
                        'question': 'If a farmer has 15 mangoes and sells 8, how many are left?',
                        'options': ['7', '23', '8', '15'],
                        'correct': 0,
                        'xp': 10,
                        'explanation': '15 - 8 = 7 mangoes left'
                    },
                    {
                        'question': 'A rectangular field is 8 meters long and 5 meters wide. What is its area?',
                        'options': ['40 square meters', '13 meters', '26 meters', '35 square meters'],
                        'correct': 0,
                        'xp': 15,
                        'explanation': 'Area = length × width = 8 × 5 = 40 square meters'
                    },
                    {
                        'question': 'If 1 kg of rice costs ₹50, how much will 3 kg cost?',
                        'options': ['₹150', '₹53', '₹47', '₹100'],
                        'correct': 0,
                        'xp': 12,
                        'explanation': '3 kg × ₹50 = ₹150'
                    }
                ],
                7: [
                    {
                        'question': 'What is 3/4 + 1/2?',
                        'options': ['5/4', '4/6', '1', '3/6'],
                        'correct': 0,
                        'xp': 15,
                        'explanation': '3/4 + 1/2 = 3/4 + 2/4 = 5/4'
                    }
                ],
                8: [
                    {
                        'question': 'Solve for x: 2x + 5 = 13',
                        'options': ['x = 4', 'x = 3', 'x = 5', 'x = 6'],
                        'correct': 0,
                        'xp': 20,
                        'explanation': '2x + 5 = 13, so 2x = 8, therefore x = 4'
                    }
                ]
            },
            'science': {
                6: [
                    {
                        'question': 'What do plants need to make their own food?',
                        'options': ['Sunlight, water, and soil', 'Only water', 'Only sunlight', 'Only soil'],
                        'correct': 0,
                        'xp': 10,
                        'explanation': 'Plants use sunlight, water, and nutrients from soil to make food through photosynthesis'
                    },
                    {
                        'question': 'Which season is best for growing rice in India?',
                        'options': ['Summer', 'Monsoon', 'Winter', 'Spring'],
                        'correct': 1,
                        'xp': 15,
                        'explanation': 'Monsoon season provides the water that rice crops need to grow'
                    },
                    {
                        'question': 'What happens when we don\'t wash our hands before eating?',
                        'options': ['We can get sick', 'Nothing happens', 'Food tastes better', 'We get stronger'],
                        'correct': 0,
                        'xp': 12,
                        'explanation': 'Dirty hands carry germs that can make us sick when we eat'
                    }
                ]
            },
            'english': {
                6: [
                    {
                        'question': 'What does "Namaste" mean in English?',
                        'options': ['Hello', 'Thank you', 'Goodbye', 'Please'],
                        'correct': 0,
                        'xp': 10,
                        'explanation': '"Namaste" is a greeting that means "Hello" in English'
                    },
                    {
                        'question': 'Which word describes a person who grows crops?',
                        'options': ['Teacher', 'Farmer', 'Doctor', 'Engineer'],
                        'correct': 1,
                        'xp': 15,
                        'explanation': 'A farmer is a person who grows crops and raises animals'
                    },
                    {
                        'question': 'What is the correct way to greet someone in English?',
                        'options': ['Hello, how are you?', 'Good morning', 'Both A and B', 'None of these'],
                        'correct': 2,
                        'xp': 12,
                        'explanation': 'Both "Hello, how are you?" and "Good morning" are correct English greetings'
                    }
                ]
            },
            'social_studies': {
                6: [
                    {
                        'question': 'What is the capital of India?',
                        'options': ['Mumbai', 'New Delhi', 'Kolkata', 'Chennai'],
                        'correct': 1,
                        'xp': 10,
                        'explanation': 'New Delhi is the capital of India'
                    },
                    {
                        'question': 'Who leads the government in a village?',
                        'options': ['Sarpanch', 'Chief Minister', 'Prime Minister', 'President'],
                        'correct': 0,
                        'xp': 15,
                        'explanation': 'Sarpanch is the head of the village panchayat (local government)'
                    },
                    {
                        'question': 'Which mountain range is in the north of India?',
                        'options': ['Western Ghats', 'Himalayas', 'Vindhya', 'Aravalli'],
                        'correct': 1,
                        'xp': 12,
                        'explanation': 'The Himalayas are the highest mountain range in the north of India'
                    }
                ]
            }
        }
        
        # Get questions for the specific subject and class level
        subject_questions = questions.get(subject, {})
        class_questions = subject_questions.get(class_level, [])
        
        # If no questions for specific class, try to get from nearby classes
        if not class_questions:
            for level in [class_level - 1, class_level + 1, class_level - 2, class_level + 2]:
                if level in subject_questions:
                    class_questions = subject_questions[level]
                    break
        
        # If still no questions, return empty list
        return class_questions if class_questions else []

# Initialize Astrals Hub
astrals_hub = AstralsHub()

@app.route('/')
def index():
    """Serve the main page"""
    return render_template('index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    """Handle chat messages"""
    try:
        data = request.get_json()
        user_message = data.get('message', '').strip()
        session_id = data.get('session_id', 'default')
        subject = data.get('subject', '')
        user_level = data.get('user_level', 'intermediate')
        
        if not user_message:
            return jsonify({'error': 'Message cannot be empty'}), 400
        
        # Generate AI response
        ai_response = astrals_hub.generate_response(user_message, subject, user_level)
        
        # Store in session
        if session_id not in chat_sessions:
            chat_sessions[session_id] = []
        
        chat_sessions[session_id].append({
            'user_message': user_message,
            'ai_response': ai_response,
            'timestamp': datetime.now().isoformat(),
            'subject': subject
        })
        
        # Update user profile stats
        update_user_stats(session_id)
        
        return jsonify({
            'response': ai_response,
            'timestamp': datetime.now().isoformat(),
            'session_id': session_id
        })
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/subjects', methods=['GET'])
def get_subjects():
    """Get available subjects"""
    subjects = list(astrals_hub.knowledge_base.keys())
    return jsonify({'subjects': subjects})

@app.route('/api/subject/<subject_name>', methods=['GET'])
def get_subject_topics(subject_name):
    """Get topics for a specific subject"""
    if subject_name.lower() in astrals_hub.knowledge_base:
        topics = astrals_hub.knowledge_base[subject_name.lower()]['topics']
        return jsonify({'subject': subject_name, 'topics': topics})
    else:
        return jsonify({'error': 'Subject not found'}), 404

@app.route('/api/quiz/<subject>', methods=['GET'])
def get_quiz_questions(subject):
    """Get quiz questions for a subject"""
    try:
        class_level = request.args.get('class', 6, type=int)
        questions = astrals_hub.generate_quiz_questions(subject.lower(), class_level)
        return jsonify({'questions': questions, 'subject': subject, 'class': class_level})
    except Exception as e:
        logger.error(f"Error generating quiz: {str(e)}")
        return jsonify({'error': 'Failed to generate quiz'}), 500

@app.route('/api/gamification/award-xp', methods=['POST'])
def award_xp():
    """Award XP to user"""
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        xp_amount = data.get('xp', 0)
        reason = data.get('reason', '')
        
        if session_id not in gamification_data:
            gamification_data[session_id] = {
                'total_xp': 0,
                'level': 1,
                'badges': [],
                'achievements': []
            }
        
        gamification_data[session_id]['total_xp'] += xp_amount
        new_level = (gamification_data[session_id]['total_xp'] // 100) + 1
        
        level_up = new_level > gamification_data[session_id]['level']
        if level_up:
            gamification_data[session_id]['level'] = new_level
        
        return jsonify({
            'success': True,
            'total_xp': gamification_data[session_id]['total_xp'],
            'level': gamification_data[session_id]['level'],
            'level_up': level_up,
            'xp_awarded': xp_amount
        })
        
    except Exception as e:
        logger.error(f"Error awarding XP: {str(e)}")
        return jsonify({'error': 'Failed to award XP'}), 500

@app.route('/api/leaderboard/<period>', methods=['GET'])
def get_leaderboard(period):
    """Get leaderboard data"""
    try:
        # Generate sample leaderboard data
        sample_data = [
            {'name': 'Cosmic Master', 'level': 15, 'xp': 2500, 'avatar': 'crown'},
            {'name': 'Star Explorer', 'level': 12, 'xp': 2100, 'avatar': 'medal'},
            {'name': 'Galaxy Scholar', 'level': 10, 'xp': 1800, 'avatar': 'award'},
            {'name': 'Space Cadet', 'level': 8, 'xp': 1500, 'avatar': 'user-astronaut'},
            {'name': 'Astro Student', 'level': 6, 'xp': 1200, 'avatar': 'user-astronaut'}
        ]
        
        return jsonify({'leaderboard': sample_data, 'period': period})
        
    except Exception as e:
        logger.error(f"Error getting leaderboard: {str(e)}")
        return jsonify({'error': 'Failed to get leaderboard'}), 500

@app.route('/api/profile/<session_id>', methods=['GET'])
def get_user_profile(session_id):
    """Get user profile"""
    profile = user_profiles.get(session_id, {
        'name': 'Student',
        'level': 'intermediate',
        'favorite_subjects': [],
        'study_sessions': 0,
        'questions_asked': 0,
        'topics_explored': 0,
        'hours_studied': 0.0,
        'understanding_rate': 85
    })
    return jsonify(profile)

@app.route('/api/profile/<session_id>', methods=['POST'])
def update_user_profile(session_id):
    """Update user profile"""
    try:
        data = request.get_json()
        if session_id not in user_profiles:
            user_profiles[session_id] = {}
        
        user_profiles[session_id].update(data)
        return jsonify({'message': 'Profile updated successfully'})
        
    except Exception as e:
        logger.error(f"Error updating profile: {str(e)}")
        return jsonify({'error': 'Failed to update profile'}), 500

@app.route('/api/chat/history/<session_id>', methods=['GET'])
def get_chat_history(session_id):
    """Get chat history for a session"""
    history = chat_sessions.get(session_id, [])
    return jsonify({'history': history})

@app.route('/api/chat/clear/<session_id>', methods=['POST'])
def clear_chat_history(session_id):
    """Clear chat history for a session"""
    if session_id in chat_sessions:
        chat_sessions[session_id] = []
    return jsonify({'message': 'Chat history cleared'})

@app.route('/api/chat/save/<session_id>', methods=['POST'])
def save_chat_history(session_id):
    """Save chat history to file"""
    try:
        if session_id in chat_sessions:
            # Create data directory if it doesn't exist
            os.makedirs('data', exist_ok=True)
            
            # Save to file
            filename = f'data/chat_{session_id}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
            with open(filename, 'w') as f:
                json.dump({
                    'session_id': session_id,
                    'history': chat_sessions[session_id],
                    'timestamp': datetime.now().isoformat()
                }, f, indent=2)
            
            return jsonify({'message': 'Chat history saved successfully', 'filename': filename})
        else:
            return jsonify({'error': 'No chat history found'}), 404
            
    except Exception as e:
        logger.error(f"Error saving chat history: {str(e)}")
        return jsonify({'error': 'Failed to save chat history'}), 500

def update_user_stats(session_id):
    """Update user statistics"""
    if session_id not in user_profiles:
        user_profiles[session_id] = {
            'name': 'Student',
            'level': 'intermediate',
            'favorite_subjects': [],
            'study_sessions': 0,
            'questions_asked': 0,
            'topics_explored': 0,
            'hours_studied': 0.0,
            'understanding_rate': 85
        }
    
    # Increment questions asked
    user_profiles[session_id]['questions_asked'] += 1
    
    # Simulate time spent (0.1 hours per question)
    user_profiles[session_id]['hours_studied'] += 0.1
    
    # Increment study sessions if this is a new session
    if session_id not in chat_sessions or len(chat_sessions[session_id]) == 1:
        user_profiles[session_id]['study_sessions'] += 1

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Create data directory
    os.makedirs('data', exist_ok=True)
    
    # Run the application
    app.run(debug=True, host='0.0.0.0', port=5000)
