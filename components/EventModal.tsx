'use client';

import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { X, Save, Trash2, Clock, MapPin, Tag, Sparkles } from 'lucide-react';
import { CalendarEvent, EventCategory } from '@/types/calendar';
import { generateEventId, formatDateTime } from '@/utils/calendar';
import AlternativeModal from './AlternativeModal';
import { AIService } from '@/services/aiService';
import { useRouter } from 'next/navigation';

interface EventModalProps {
    event?: CalendarEvent | null;
    selectedDate?: Date | null;
    onClose: () => void;
    onSave: (event: CalendarEvent) => void;
    onDelete: (eventId: string) => void;
}

const categories: EventCategory[] = [
    'work', 'personal', 'health', 'social', 'education',
    'entertainment', 'shopping', 'travel', 'other'
];

const colorOptions = [
    '#e57373', // red
    '#64b5f6', // blue
    '#81c784', // green
    '#ffd54f', // yellow
    '#ba68c8', // purple
    '#4dd0e1', // teal
    '#ffb74d', // orange
    '#a1887f', // brown
    '#90a4ae', // gray
];

export default function EventModal({ event, selectedDate, onClose, onSave, onDelete }: EventModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        location: '',
        category: 'personal' as EventCategory,
        color: colorOptions[0],
    });

    const isEditing = !!event;
    const [showAlternatives, setShowAlternatives] = useState(false);
    const [pendingEvent, setPendingEvent] = useState<CalendarEvent | null>(null);
    const [manualAlternatives, setManualAlternatives] = useState<AlternativeEvent[]>([]);
    const [altTitle, setAltTitle] = useState('');
    const [altStart, setAltStart] = useState('');
    const [altEnd, setAltEnd] = useState('');
    const router = useRouter();
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (event) {
            setFormData({
                title: event.title,
                description: event.description || '',
                startTime: format(event.startTime, 'yyyy-MM-dd\'T\'HH:mm'),
                endTime: format(event.endTime, 'yyyy-MM-dd\'T\'HH:mm'),
                location: event.location || '',
                category: event.category,
                color: event.color || colorOptions[0],
            });
        } else if (selectedDate) {
            const startTime = new Date(selectedDate);
            startTime.setHours(9, 0, 0, 0);
            const endTime = new Date(selectedDate);
            endTime.setHours(10, 0, 0, 0);

            setFormData({
                title: '',
                description: '',
                startTime: format(startTime, 'yyyy-MM-dd\'T\'HH:mm'),
                endTime: format(endTime, 'yyyy-MM-dd\'T\'HH:mm'),
                location: '',
                category: 'personal',
                color: colorOptions[0],
            });
        }
    }, [event, selectedDate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Check if user is logged in
        const firstName = localStorage.getItem('firstName');
        if (!firstName) {
            router.push('/login');
            return;
        }
        const newEvent: CalendarEvent = {
            id: event?.id || generateEventId(),
            title: formData.title,
            description: formData.description || undefined,
            startTime: new Date(formData.startTime),
            endTime: new Date(formData.endTime),
            location: formData.location || undefined,
            category: formData.category,
            color: formData.color,
            status: event?.status || 'scheduled',
            alternatives: manualAlternatives.length > 0 ? manualAlternatives : undefined,
        };
        onSave(newEvent);
    };

    const handleDelete = () => {
        if (event) {
            onDelete(event.id);
        }
    };

    const handleSetAlternatives = (e?: React.MouseEvent) => {
        if (e) e.preventDefault();
        // Prepare a CalendarEvent object from formData
        const newEvent: CalendarEvent = {
            id: event?.id || generateEventId(),
            title: formData.title,
            description: formData.description || undefined,
            startTime: new Date(formData.startTime),
            endTime: new Date(formData.endTime),
            location: formData.location || undefined,
            category: formData.category,
            color: formData.color,
            status: event?.status || 'scheduled',
        };
        setPendingEvent(newEvent);
        setShowAlternatives(true);
    };

    const handleSelectAlternative = (altEvent: CalendarEvent) => {
        setShowAlternatives(false);
        onSave(altEvent);
    };

    const handleAddAlternative = () => {
        if (!altTitle || !altStart || !altEnd) return;
        setManualAlternatives(prev => [
            ...prev,
            {
                id: generateEventId(),
                title: altTitle,
                startTime: new Date(altStart),
                endTime: new Date(altEnd),
                category: formData.category,
                confidence: 1,
                reason: 'User added',
            }
        ]);
        setAltTitle('');
        setAltStart('');
        setAltEnd('');
    };

    const handleRemoveAlternative = (id: string) => {
        setManualAlternatives(prev => prev.filter(a => a.id !== id));
    };

    const handleStartListening = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert('Speech recognition is not supported in this browser.');
            return;
        }
        const SpeechRecognition = (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setFormData((prev) => ({
                ...prev,
                title: prev.title || transcript,
                description: prev.description ? prev.description + ' ' + transcript : transcript,
            }));
            setIsListening(false);
        };
        recognition.onerror = () => {
            setIsListening(false);
        };
        recognition.onend = () => {
            setIsListening(false);
        };
        recognitionRef.current = recognition;
        setIsListening(true);
        recognition.start();
    };

    const handleStopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {isEditing ? 'Edit Event' : 'Add Event'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Event Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Enter event title"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Enter event description"
                            rows={3}
                        />
                    </div>

                    {/* Date and Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Time *
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Time *
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                required
                            />
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Location
                        </label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Enter location"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value as EventCategory })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Color Picker */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Color
                        </label>
                        <div className="flex space-x-2">
                            {colorOptions.map((color) => (
                                <button
                                    type="button"
                                    key={color}
                                    className={`w-6 h-6 rounded-full border-2 ${formData.color === color ? 'border-black' : 'border-gray-300'}`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => setFormData({ ...formData, color })}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Manual Alternatives Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Manual Alternatives</label>
                        <div className="flex flex-col space-y-2 mb-2">
                            {manualAlternatives.map((alt) => (
                                <div key={alt.id} className="flex items-center space-x-2">
                                    <span className="flex-1 text-xs">{alt.title} ({format(new Date(alt.startTime), 'MMM d, h:mm a')} - {format(new Date(alt.endTime), 'h:mm a')})</span>
                                    <button type="button" className="text-red-500 text-xs" onClick={() => handleRemoveAlternative(alt.id)}>Remove</button>
                                </div>
                            ))}
                        </div>
                        <div className="flex space-x-2 mb-2">
                            <input
                                type="text"
                                placeholder="Title"
                                value={altTitle}
                                onChange={e => setAltTitle(e.target.value)}
                                className="px-2 py-1 border rounded text-xs w-1/3"
                            />
                            <input
                                type="datetime-local"
                                value={altStart}
                                onChange={e => setAltStart(e.target.value)}
                                className="px-2 py-1 border rounded text-xs w-1/3"
                            />
                            <input
                                type="datetime-local"
                                value={altEnd}
                                onChange={e => setAltEnd(e.target.value)}
                                className="px-2 py-1 border rounded text-xs w-1/3"
                            />
                            <button type="button" onClick={handleAddAlternative} className="bg-blue-500 text-white px-2 py-1 rounded text-xs">Add</button>
                        </div>
                    </div>

                    {/* AI Listening Section */}
                    <div className="flex items-center space-x-2 mb-2">
                        <button
                            type="button"
                            onClick={isListening ? handleStopListening : handleStartListening}
                            className={`px-3 py-1 rounded ${isListening ? 'bg-red-500 text-white' : 'bg-green-500 text-white'} text-xs font-medium`}
                        >
                            {isListening ? 'Stop Listening' : 'Speak Event (AI)'}
                        </button>
                        {isListening && <span className="text-xs text-gray-500">Listening...</span>}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4">
                        <div className="flex space-x-3">
                            <button
                                type="submit"
                                className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                            >
                                <Save className="w-4 h-4" />
                                <span>{isEditing ? 'Update' : 'Create'}</span>
                            </button>
                            <button
                                type="button"
                                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                onClick={handleSetAlternatives}
                            >
                                <Sparkles className="w-4 h-4" />
                                <span>Set Alternatives</span>
                            </button>
                        </div>
                        {isEditing && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="flex items-center space-x-2 text-red-600 hover:text-red-800"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete</span>
                            </button>
                        )}
                    </div>
                </form>
                {showAlternatives && pendingEvent && (
                    <AlternativeModal
                        originalEvent={pendingEvent}
                        onClose={() => setShowAlternatives(false)}
                        onSelectAlternative={handleSelectAlternative}
                    />
                )}
            </div>
        </div>
    );
} 