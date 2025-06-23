export interface CalendarEvent {
    id: string;
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    location?: string;
    category: EventCategory;
    status: EventStatus;
    alternatives?: AlternativeEvent[];
    isAlternative?: boolean;
    originalEventId?: string;
    color?: string;
}

export interface AlternativeEvent {
    id: string;
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    location?: string;
    category: EventCategory;
    confidence: number; // AI confidence score (0-1)
    reason: string; // Why this alternative was suggested
}

export type EventCategory =
    | 'work'
    | 'personal'
    | 'health'
    | 'social'
    | 'education'
    | 'entertainment'
    | 'shopping'
    | 'travel'
    | 'other';

export type EventStatus =
    | 'scheduled'
    | 'completed'
    | 'missed'
    | 'cancelled'
    | 'alternative';

export interface CalendarView {
    type: 'month' | 'week' | 'day';
    currentDate: Date;
}

export interface AIResponse {
    alternatives: AlternativeEvent[];
    reasoning: string;
    confidence: number;
} 