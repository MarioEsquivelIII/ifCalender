'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
    Calendar,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    Plus,
} from 'lucide-react';
import { format, addWeeks, subWeeks } from 'date-fns';
import { CalendarEvent } from '@/types/calendar';
import WeekView from '@/components/WeekView';
import EventModal from '@/components/EventModal';
import MiniCalendar from '@/components/MiniCalendar';

// Sample data for demonstration (optional, can start with empty array)
const sampleEvents: CalendarEvent[] = [];

export default function HomePage() {
    const [events, setEvents] = useState<CalendarEvent[]>(sampleEvents);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setModalOpen] = useState(false);
    const [modalStartDate, setModalStartDate] = useState<Date | null>(null);
    const [firstName, setFirstName] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const recognitionRef = useRef<any>(null);
    const [isListening, setIsListening] = useState(false);

    useEffect(() => {
        const fullName = localStorage.getItem('fullName');
        if (fullName) {
            setIsLoggedIn(true);
            setFirstName(fullName.split(' ')[0]);
        } else {
            setIsLoggedIn(false);
            setFirstName(null);
        }
    }, []);

    const handleEventAdd = (event: CalendarEvent) => {
        setEvents((prev) => [...prev, event]);
    };

    const handleEventUpdate = (updatedEvent: CalendarEvent) => {
        setEvents((prev) => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
    };

    const handleEventDelete = (eventId: string) => {
        setEvents((prev) => prev.filter(e => e.id !== eventId));
    };

    const openEventModal = (date?: Date) => {
        setModalStartDate(date || new Date());
        setModalOpen(true);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setFirstName(null);
        setShowLogoutModal(false);
        localStorage.removeItem('token');
        localStorage.removeItem('firstName');
        localStorage.removeItem('fullName');
    };

    const handleSpeakEvent = () => {
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
            // Simple parsing: look for "on <date> at <time>" or "for <date> <time>"
            // Example: "Meeting with Bob on June 25 at 3pm"
            const nameMatch = transcript.match(/^(.*?) (on|for) /i);
            const dateMatch = transcript.match(/on ([A-Za-z]+ \d{1,2})/i);
            const timeMatch = transcript.match(/at (\d{1,2}(?::\d{2})? ?(am|pm)?)/i);
            let title = transcript;
            let startTime = new Date();
            let endTime = new Date();
            if (nameMatch) title = nameMatch[1];
            if (dateMatch) {
                const dateStr = dateMatch[1] + ' ' + new Date().getFullYear();
                startTime = new Date(dateStr);
                endTime = new Date(dateStr);
            }
            if (timeMatch) {
                const [time, ampm] = timeMatch[1].split(' ');
                const [hour, minute] = time.includes(':') ? time.split(':') : [time, '0'];
                startTime.setHours(parseInt(hour) + (ampm && ampm.toLowerCase() === 'pm' && parseInt(hour) < 12 ? 12 : 0), parseInt(minute));
                endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour event
            }
            // Only create if we have a title and a valid date
            if (title && !isNaN(startTime.getTime())) {
                const newEvent = {
                    id: Math.random().toString(36).substr(2, 9),
                    title,
                    startTime,
                    endTime,
                    category: 'personal' as const,
                    status: 'scheduled' as const,
                };
                setEvents((prev) => [...prev, newEvent]);
            } else {
                alert('Could not recognize event details. Please try again.');
            }
            setIsListening(false);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
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
        <div className="flex flex-row h-screen bg-white font-sans">
            {/* Sidebar with MiniCalendar */}
            <aside className="w-72 border-r border-gray-200 bg-gray-50 flex flex-col items-center justify-start pt-8">
                <div className="bg-white rounded-xl shadow p-6 w-full flex flex-col items-center">
                    <MiniCalendar selectedDate={currentDate} onSelectDate={setCurrentDate} />
                    <button
                        onClick={() => {
                            setModalStartDate(currentDate);
                            setModalOpen(true);
                        }}
                        className="mt-6 w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg text-base font-medium hover:bg-blue-700 transition-colors"
                    >
                        <span className="text-xl">+</span>
                        <span>Create Event</span>
                    </button>
                    <button
                        type="button"
                        onClick={isListening ? handleStopListening : handleSpeakEvent}
                        className={`mt-3 w-full font-semibold flex items-center justify-center bg-green-500 text-white px-4 py-2 rounded-lg text-base hover:bg-green-600 transition-colors`}
                    >
                        Speak Event (AI)
                    </button>
                    {isListening && <span className="text-xs text-gray-500 mt-1">Listening...</span>}
                </div>
            </aside>
            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4 z-10">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                            <Calendar className="w-7 h-7 text-blue-600" />
                            <h1 className="text-xl font-bold text-gray-800">ifCalendar</h1>
                            {isLoggedIn && firstName && (
                                <span className="ml-4 text-lg font-semibold text-green-700">Welcome, {firstName}!</span>
                            )}
                        </div>
                        <button
                            onClick={() => setCurrentDate(new Date())}
                            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Today
                        </button>
                        <div className="flex items-center space-x-1">
                            <button
                                onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <button
                                onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <ChevronRight className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                        <h2 className="text-xl font-medium text-gray-600">
                            {format(currentDate, 'MMMM yyyy')}
                        </h2>
                    </div>
                    <div className="flex items-center space-x-4">
                        {isLoggedIn ? (
                            <button
                                onClick={() => setShowLogoutModal(true)}
                                className="flex items-center space-x-2 bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-900 transition-colors"
                            >
                                Logout
                            </button>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="text-sm font-medium text-gray-600 hover:text-gray-900"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="text-sm font-medium text-white bg-gray-800 px-4 py-2 rounded-md hover:bg-gray-900"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </header>
                {/* Logout Modal */}
                {showLogoutModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                        <div className="bg-white rounded-lg shadow-lg p-6 w-80">
                            <h2 className="text-lg font-semibold mb-4">Are you sure you want to logout?</h2>
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={() => setShowLogoutModal(false)}
                                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                                >
                                    No
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                                >
                                    Yes
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Main Content */}
                <main className="flex-1 overflow-auto">
                    <WeekView
                        events={events}
                        onEventUpdate={handleEventUpdate}
                        onEventDelete={handleEventDelete}
                        onEventAdd={handleEventAdd}
                        onNewEvent={(date) => openEventModal(date)}
                    />
                </main>
                {isModalOpen && (
                    <EventModal
                        selectedDate={modalStartDate}
                        onClose={() => setModalOpen(false)}
                        onSave={(event) => {
                            handleEventAdd(event);
                            setModalOpen(false);
                        }}
                        onDelete={() => { }}
                    />
                )}
            </div>
        </div>
    );
} 