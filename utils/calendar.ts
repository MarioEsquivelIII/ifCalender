import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { CalendarEvent, EventCategory } from '@/types/calendar';

export const formatTime = (date: Date): string => {
    return format(date, 'h:mm a');
};

export const formatDate = (date: Date): string => {
    return format(date, 'MMM d, yyyy');
};

export const formatDateTime = (date: Date): string => {
    return format(date, 'MMM d, yyyy h:mm a');
};

export const getMonthDays = (date: Date): Date[] => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const startWeek = startOfWeek(start);
    const endWeek = endOfWeek(end);

    return eachDayOfInterval({ start: startWeek, end: endWeek });
};

export const getEventsForDate = (events: CalendarEvent[], date: Date): CalendarEvent[] => {
    return events.filter(event => isSameDay(event.startTime, date));
};

export const getCategoryColor = (category: EventCategory): string => {
    const colors = {
        work: 'bg-blue-500',
        personal: 'bg-green-500',
        health: 'bg-red-500',
        social: 'bg-purple-500',
        education: 'bg-yellow-500',
        entertainment: 'bg-pink-500',
        shopping: 'bg-orange-500',
        travel: 'bg-indigo-500',
        other: 'bg-gray-500'
    };
    return colors[category];
};

export const getCategoryName = (category: EventCategory): string => {
    return category.charAt(0).toUpperCase() + category.slice(1);
};

export const generateEventId = (): string => {
    return Math.random().toString(36).substr(2, 9);
};

export const isToday = (date: Date): boolean => {
    return isSameDay(date, new Date());
};

export const isCurrentMonth = (date: Date): boolean => {
    return isSameMonth(date, new Date());
}; 