import { CalendarEvent, AlternativeEvent, EventCategory, AIResponse } from '@/types/calendar';
import { generateEventId } from '@/utils/calendar';

// Mock AI service - in a real app, this would connect to an AI API
export class AIService {
    private static alternativeTemplates = {
        work: [
            { title: 'Remote work session', category: 'work' as EventCategory, reason: 'Flexible work arrangement' },
            { title: 'Focus time - deep work', category: 'work' as EventCategory, reason: 'Productive alternative' },
            { title: 'Professional development', category: 'education' as EventCategory, reason: 'Skill building opportunity' }
        ],
        personal: [
            { title: 'Self-care time', category: 'health' as EventCategory, reason: 'Wellness alternative' },
            { title: 'Hobby time', category: 'entertainment' as EventCategory, reason: 'Personal fulfillment' },
            { title: 'Home organization', category: 'personal' as EventCategory, reason: 'Productive personal time' }
        ],
        health: [
            { title: 'Home workout', category: 'health' as EventCategory, reason: 'Flexible fitness option' },
            { title: 'Meditation session', category: 'health' as EventCategory, reason: 'Mental wellness' },
            { title: 'Healthy meal prep', category: 'health' as EventCategory, reason: 'Nutrition focus' }
        ],
        social: [
            { title: 'Video call with friends', category: 'social' as EventCategory, reason: 'Virtual social connection' },
            { title: 'Social media catch-up', category: 'social' as EventCategory, reason: 'Digital socializing' },
            { title: 'Plan future meetup', category: 'social' as EventCategory, reason: 'Social planning' }
        ],
        education: [
            { title: 'Online course session', category: 'education' as EventCategory, reason: 'Digital learning' },
            { title: 'Reading time', category: 'education' as EventCategory, reason: 'Self-directed learning' },
            { title: 'Research project', category: 'education' as EventCategory, reason: 'Knowledge building' }
        ],
        entertainment: [
            { title: 'Movie night at home', category: 'entertainment' as EventCategory, reason: 'Home entertainment' },
            { title: 'Gaming session', category: 'entertainment' as EventCategory, reason: 'Digital entertainment' },
            { title: 'Creative project', category: 'entertainment' as EventCategory, reason: 'Creative expression' }
        ],
        shopping: [
            { title: 'Online shopping', category: 'shopping' as EventCategory, reason: 'Digital shopping' },
            { title: 'Budget planning', category: 'personal' as EventCategory, reason: 'Financial management' },
            { title: 'Wishlist organization', category: 'shopping' as EventCategory, reason: 'Shopping planning' }
        ],
        travel: [
            { title: 'Virtual travel experience', category: 'entertainment' as EventCategory, reason: 'Digital exploration' },
            { title: 'Travel planning', category: 'travel' as EventCategory, reason: 'Future trip preparation' },
            { title: 'Local exploration', category: 'travel' as EventCategory, reason: 'Local adventure' }
        ],
        other: [
            { title: 'Personal project time', category: 'personal' as EventCategory, reason: 'Personal development' },
            { title: 'Relaxation time', category: 'health' as EventCategory, reason: 'Stress relief' },
            { title: 'Creative exploration', category: 'entertainment' as EventCategory, reason: 'Creative outlet' }
        ]
    };

    static async generateAlternatives(event: CalendarEvent): Promise<AIResponse> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const templates = this.alternativeTemplates[event.category] || this.alternativeTemplates.other;
        const alternatives: AlternativeEvent[] = [];

        // Generate 3 alternative events
        for (let i = 0; i < 3; i++) {
            const template = templates[i % templates.length];
            const startTime = new Date(event.startTime);
            const endTime = new Date(event.endTime);

            alternatives.push({
                id: generateEventId(),
                title: template.title,
                description: `Alternative to: ${event.title}`,
                startTime,
                endTime,
                category: template.category,
                confidence: 0.7 + (Math.random() * 0.3), // 0.7-1.0
                reason: template.reason
            });
        }

        return {
            alternatives,
            reasoning: `Based on your ${event.category} event "${event.title}", I've suggested some alternatives that align with your interests and schedule.`,
            confidence: 0.85
        };
    }

    static async suggestSmartAlternatives(
        originalEvent: CalendarEvent,
        userPreferences: string[],
        availableTime: { start: Date; end: Date }
    ): Promise<AIResponse> {
        // Enhanced AI suggestions based on user preferences
        await new Promise(resolve => setTimeout(resolve, 1500));

        const alternatives: AlternativeEvent[] = [];
        const duration = availableTime.end.getTime() - availableTime.start.getTime();
        const hours = duration / (1000 * 60 * 60);

        // Generate personalized alternatives
        const personalizedTemplates = this.getPersonalizedTemplates(userPreferences);

        for (const template of personalizedTemplates.slice(0, 3)) {
            alternatives.push({
                id: generateEventId(),
                title: template.title,
                description: template.description,
                startTime: new Date(availableTime.start),
                endTime: new Date(availableTime.end),
                category: template.category,
                confidence: template.confidence,
                reason: template.reason
            });
        }

        return {
            alternatives,
            reasoning: `I've analyzed your preferences and the available time slot to suggest activities that match your interests and schedule.`,
            confidence: 0.92
        };
    }

    private static getPersonalizedTemplates(preferences: string[]): Array<{
        title: string;
        description: string;
        category: EventCategory;
        confidence: number;
        reason: string;
    }> {
        const allTemplates = [
            { title: 'Fitness workout', description: 'Stay active with a home workout', category: 'health' as EventCategory, confidence: 0.9, reason: 'Matches your fitness goals' },
            { title: 'Learning session', description: 'Dive into a new skill or topic', category: 'education' as EventCategory, confidence: 0.85, reason: 'Aligns with your learning interests' },
            { title: 'Creative project', description: 'Express yourself through art or writing', category: 'entertainment' as EventCategory, confidence: 0.8, reason: 'Fits your creative side' },
            { title: 'Social connection', description: 'Reach out to friends or family', category: 'social' as EventCategory, confidence: 0.75, reason: 'Maintains social connections' },
            { title: 'Productivity boost', description: 'Tackle important tasks efficiently', category: 'work' as EventCategory, confidence: 0.88, reason: 'Maximizes your productivity' }
        ];

        // Filter based on preferences (simplified logic)
        return allTemplates.sort((a, b) => b.confidence - a.confidence);
    }
} 