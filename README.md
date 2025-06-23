# ifCalendar - Smart Calendar with AI Alternatives

A modern, AI-powered calendar application that looks like Google Calendar but with intelligent alternative event suggestions when you can't make your original plans.

## 🚀 Features

### Core Calendar Features
- **Google Calendar-like Interface**: Clean, familiar calendar layout
- **Event Management**: Add, edit, and delete events with categories
- **Smart Tracking**: Mark events as completed (✓) or missed (✗)
- **Multiple Categories**: Work, Personal, Health, Social, Education, Entertainment, Shopping, Travel

### AI-Powered Alternative Suggestions
- **Smart Alternatives**: When you can't make an event, get AI-generated alternatives
- **Contextual Suggestions**: Alternatives are based on the original event category and your preferences
- **Confidence Scoring**: Each alternative comes with a confidence score
- **Reasoning**: AI explains why each alternative was suggested

### User Experience
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Stats**: Track your event completion rates
- **Visual Feedback**: Color-coded events and status indicators
- **Intuitive Interface**: Easy-to-use buttons and interactions

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **AI Service**: Mock AI service (easily replaceable with real AI API)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ML_Project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 How to Use

### Adding Events
1. Click the "Add Event" button or click on any date
2. Fill in the event details (title, time, location, category)
3. Click "Create" to save the event

### Managing Events
- **Click on any event** to edit its details
- **Use the check button (✓)** to mark an event as completed
- **Use the X button (✗)** to mark an event as missed
- **Click "Alt"** to get AI-powered alternative suggestions

### Getting Alternative Suggestions
1. Find an event you can't attend
2. Click the "Alt" button next to the event
3. Review the AI-generated alternatives
4. Click the check mark on your preferred alternative
5. The original event will be marked as cancelled and the alternative will be added

## 🧠 AI Features

The application includes a mock AI service that generates contextual alternatives:

- **Category-based suggestions**: Alternatives match the original event's category
- **Confidence scoring**: Each suggestion includes a confidence level
- **Reasoning**: AI explains why each alternative was chosen
- **Fallback handling**: Graceful degradation if AI service is unavailable

### Example AI Suggestions
- **Work Event** → Remote work session, Focus time, Professional development
- **Health Event** → Home workout, Meditation session, Healthy meal prep
- **Social Event** → Video call with friends, Social media catch-up, Plan future meetup

## 🎨 Customization

### Adding Real AI Integration
Replace the mock AI service in `services/aiService.ts` with your preferred AI provider:

```typescript
// Example: OpenAI integration
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class AIService {
  static async generateAlternatives(event: CalendarEvent): Promise<AIResponse> {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that suggests alternative activities."
        },
        {
          role: "user",
          content: `Suggest alternatives for: ${event.title} (${event.category})`
        }
      ],
    });
    
    // Process the response and return alternatives
  }
}
```

### Styling Customization
Modify `tailwind.config.js` to customize colors and themes:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          // Your custom primary colors
        },
        calendar: {
          // Your custom calendar colors
        }
      },
    },
  },
}
```

## 📱 Responsive Design

The application is fully responsive and works on:
- **Desktop**: Full calendar view with all features
- **Tablet**: Optimized layout for medium screens
- **Mobile**: Touch-friendly interface with simplified interactions

## 🔧 Development

### Project Structure
```
ML_Project/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── Calendar.tsx       # Main calendar component
│   ├── CalendarDay.tsx    # Individual day component
│   ├── EventModal.tsx     # Event creation/editing modal
│   └── AlternativeModal.tsx # AI alternatives modal
├── services/              # Business logic
│   └── aiService.ts       # AI service (mock)
├── types/                 # TypeScript types
│   └── calendar.ts        # Calendar-related types
├── utils/                 # Utility functions
│   └── calendar.ts        # Calendar utilities
└── README.md             # This file
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Other Platforms
The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- DigitalOcean App Platform
- Self-hosted servers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

## 🔮 Future Enhancements

- **Real AI Integration**: Connect to OpenAI, Claude, or other AI services
- **Calendar Sync**: Integrate with Google Calendar, Outlook, etc.
- **Notifications**: Push notifications for upcoming events
- **Analytics**: Detailed insights and productivity tracking
- **Mobile App**: Native mobile applications
- **Team Features**: Shared calendars and collaboration
- **Weather Integration**: Weather-aware alternative suggestions
- **Location Services**: Location-based alternative recommendations

---

**ifCalendar** - Making your schedule smarter, one alternative at a time! 🗓️✨ 