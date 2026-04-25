# FitTrack CUET - Gymnasium Management System

A comprehensive web-based gymnasium management and fitness assistance system for Chittagong University of Engineering and Technology (CUET).

## 📋 Project Overview

FitTrack CUET is a responsive frontend application designed to enhance the CUET gymnasium experience by providing:
- User authentication and profile management
- Equipment catalog and availability tracking
- Workout history logging and tracking
- AI-powered fitness guidance
- Personalized diet plans
- Medical profile management
- Safety rules and guidelines
- Admin dashboard for gym management

## 🚀 Features

### User Features
1. **Authentication System**
   - Student login with ID and password
   - New user registration
   - Password visibility toggle
   - Session management

2. **Dashboard**
   - Welcome section with quick actions
   - Gym status and operational hours
   - Personal workout statistics
   - Equipment catalog with filtering
   - Recent activity overview

3. **Equipment Catalog** 🆕
   - Comprehensive list of all gym equipment (14 equipment types)
   - Search and filter by category (cardio, strength, free weights, functional)
   - Grid and list view options
   - Detailed equipment information including:
     - Complete descriptions
     - Step-by-step usage guidelines
     - Targeted muscle groups
     - Difficulty level and capacity
     - Health benefits
     - Safety precautions
     - Do's and Don'ts
   - Pro tips for effective use
   - Equipment availability status
   - Session booking functionality

4. **Workout History**
   - Log daily workouts
   - Track exercises, sets, reps, and weights
   - Filter by date range and workout type
   - View detailed workout information

5. **AI Gym Instructor**
   - Interactive chat interface
   - Personalized workout plans
   - Exercise form guidance
   - Equipment usage instructions
   - Injury prevention tips
   - Quick prompt buttons

5. **Medical Profile**
   - Basic health information (age, height, weight, BMI)
   - Medical history and chronic conditions
   - Past injuries tracking
   - Allergy information
   - Emergency contact details
   - Fitness goals and limitations

7. **Diet Plan**
   - Personalized nutrition goals
   - Meal plan suggestions (3-6 meals per day)
   - Macro tracking (protein, carbs, fats)
   - Dietary preferences and restrictions
   - 7-day meal plan overview
   - Nutrition tips

8. **Rules & Safety**
   - General gym rules
   - Safety guidelines
   - Injury prevention tips
   - Equipment usage guidelines
   - Prohibited activities
   - Rules acknowledgment system

### Admin Features
1. **Admin Dashboard**
   - Key metrics and statistics
   - Gym status control
   - User activity monitoring
   - Equipment management
   - Announcement system
   - Data export functionality

## 🛠️ Technologies Used

- **HTML5** - Structure and semantic markup
- **CSS3** - Styling and responsive design
  - CSS Variables for theming
  - Flexbox and Grid layouts
  - Animations and transitions
  - Media queries for responsiveness
- **JavaScript (ES6+)** - Interactivity and functionality
  - DOM manipulation
  - Event handling
  - LocalStorage for data persistence
  - Form validation
  - Dynamic content rendering

## 📁 Project Structure

```
IP_Project/
│
├── index.html              # Login page
├── register.html           # Registration page
├── dashboard.html          # Main user dashboard
├── workout-history.html    # Workout tracking
├── ai-instructor.html      # AI chat interface
├── equipment.html          # Equipment catalog with details 🆕
├── medical-profile.html    # Health information
├── diet-plan.html          # Nutrition planning
├── rules-safety.html       # Gym rules and safety
├── admin-dashboard.html    # Admin control panel
│
├── css/
│   ├── style.css          # Main styles and authentication
│   ├── pages.css          # Workout and AI styles
│   └── additional.css     # Medical, diet, rules, admin, equipment styles
│
└── js/
    ├── auth.js            # Authentication logic
    ├── main.js            # Common functions and navigation
    ├── dashboard.js       # Dashboard functionality
    ├── workout.js         # Workout history management
    ├── ai-instructor.js   # AI chat functionality
    ├── equipment.js       # Equipment catalog and details 🆕
    ├── medical-profile.js # Medical profile handling
    ├── diet-plan.js       # Diet planning features
    ├── rules.js           # Rules acknowledgment
    └── admin.js           # Admin dashboard controls
```

## 🎨 Design Features

- **Color Scheme**
  - Primary: Indigo (#4f46e5)
  - Success: Green (#059669)
  - Danger: Red (#dc2626)
  - Warning: Amber (#f59e0b)
  - Info: Sky (#0ea5e9)

- **Responsive Design**
  - Mobile-first approach
  - Breakpoints: 480px, 768px, 1024px
  - Adaptive navigation
  - Flexible grid layouts

- **UI/UX Elements**
  - Smooth animations and transitions
  - Interactive hover effects
  - Toast notifications
  - Modal dialogs
  - Loading indicators
  - Icon integration (Font Awesome)

## 🚦 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No server or backend required (runs entirely in browser)

### Installation

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd IP_Project
   ```

2. **Open in browser**
   - Simply open `index.html` in your web browser
   - Or use a local server:
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js
     npx serve
     ```

3. **Access the application**
   - Navigate to `http://localhost:8000` (if using local server)
   - Or directly open `index.html` file

## 👤 Test Credentials

Since this is a frontend-only application, any credentials will work:

**User Login:**
- Student ID: Any alphanumeric value (e.g., 1801001)
- Password: Any password (minimum 8 characters for registration)

**Admin Access:**
- Navigate directly to `admin-dashboard.html`

## 📱 Pages Overview

1. **index.html** - Login page with animated branding
2. **register.html** - Registration with comprehensive form
3. **dashboard.html** - Main hub with statistics and equipment
4. **workout-history.html** - Workout logging and tracking
5. **ai-instructor.html** - AI chat for fitness guidance
6. **medical-profile.html** - Health and medical information
7. **diet-plan.html** - Personalized nutrition planning
8. **rules-safety.html** - Comprehensive gym rules
9. **admin-dashboard.html** - Admin control and monitoring

## 💾 Data Storage

- Uses browser's LocalStorage for data persistence
- Stored data includes:
  - User authentication state
  - User profile information
  - Workout history
  - Medical profile
  - Diet preferences
  - Rules acknowledgment

## 🔒 Security Note

This is a **frontend-only demonstration**. In a production environment:
- Implement backend API for data management
- Add proper authentication with JWT or sessions
- Encrypt sensitive data
- Implement input sanitization
- Add HTTPS/SSL encryption
- Implement rate limiting and CSRF protection

## 🌐 Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Opera 76+

## 📝 Future Enhancements

- Backend integration with Node.js/Express or Python/Django
- Database implementation (MongoDB/PostgreSQL)
- Real AI integration (OpenAI API, Gemini)
- Progress tracking with charts and graphs
- Social features (workout sharing, challenges)
- Push notifications
- Wearable device integration
- Video tutorials for exercises
- Live chat with trainers
- Payment integration for premium features

## 🤝 Contributing

This is an academic project for Internet Programming course. Contributions and suggestions are welcome!

## 📄 License

This project is created for educational purposes as part of the CUET Internet Programming course curriculum.

## 👥 Authors

- CUET Student(s)
- Course: Internet Programming
- Institution: Chittagong University of Engineering and Technology

## 📞 Support

For issues or questions about the project:
- Check the code comments for detailed explanations
- Review the HTML/CSS/JS files for implementation details
- Test all features using browser developer tools

## 🎯 Project Objectives Achieved

✅ Secure web-based platform with authentication  
✅ Organized equipment catalog  
✅ Daily workout history tracking  
✅ AI-based gym instructor integration  
✅ Medical profile management  
✅ Diet plan recommendations  
✅ Comprehensive safety guidelines  
✅ Admin dashboard for management  
✅ Fully responsive design  
✅ Modern UI/UX with smooth animations

---

**Note:** This is a frontend-only implementation. For production deployment, integrate with a backend server and database system.
