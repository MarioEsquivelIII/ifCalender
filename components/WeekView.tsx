'use client';

import React, { useState, useRef, useMemo } from 'react';
import {
    format,
    addDays,
    subDays,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameDay,
    setHours,
    setMinutes,
    addMinutes,
    isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarEvent, EventCategory } from '@/types/calendar';
import EventModal from './EventModal';
import AlternativeModal from './AlternativeModal';
import { getCategoryColor } from '@/utils/calendar';

const HOUR_HEIGHT = 48; // Corresponds to h-12 in Tailwind
const MINUTE_HEIGHT = HOUR_HEIGHT / 60;

const TimeGutter = () => (
    <div className="col-start-1 col-end-2 row-start-1 pr-2 text-right">
        {/* All-day spacer */}
        <div className="h-10 border-b border-transparent" />
        {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="relative h-12 -mt-2.5">
                <span className="text-xs text-gray-500">
                    {format(new Date(2022, 0, 1, i), 'h a')}
                </span>
            </div>
        ))}
    </div>
);

const EventCard = ({ event, onClick }: { event: CalendarEvent; onClick: (event: CalendarEvent) => void }) => {
    const startHour = event.startTime.getHours();
    const startMinute = event.startTime.getMinutes();
    const endHour = event.endTime.getHours();
    const endMinute = event.endTime.getMinutes();

    const top = startHour * HOUR_HEIGHT + startMinute * MINUTE_HEIGHT;
    const height = (endHour * 60 + endMinute) * MINUTE_HEIGHT - top;

    const eventColor = event.color || '#e57373';

    return (
        <div
            className="absolute w-[calc(100%-8px)] left-1 p-2 pr-3 rounded-lg text-white cursor-pointer shadow-md hover:shadow-lg transition-shadow flex"
            style={{
                top: `${top}px`,
                height: `${height}px`,
                backgroundColor: eventColor,
            }}
            onClick={() => onClick(event)}
        >
            {/* Left color bar */}
            <div className="w-1 h-full rounded-l-lg mr-2" style={{ background: '#2196f3' }} />
            <div className="flex-1">
                <p className="font-bold text-sm leading-tight">{event.title}</p>
                <p className="text-xs opacity-90 leading-tight">
                    {format(event.startTime, 'h:mm a')} – {format(event.endTime, 'h:mm a')}
                </p>
            </div>
        </div>
    );
};

export default function WeekView({
    events,
    onEventUpdate,
    onEventDelete,
    onEventAdd,
    onNewEvent
}: {
    events: CalendarEvent[];
    onEventUpdate: (event: CalendarEvent) => void;
    onEventDelete: (eventId: string) => void;
    onEventAdd: (event: CalendarEvent) => void;
    onNewEvent: (date: Date) => void;
}) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
        null
    );
    const [isEventModalOpen, setEventModalOpen] = useState(false);
    const [isAlternativeModalOpen, setAlternativeModalOpen] = useState(false);

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }); // Sunday start
    const weekDays = useMemo(() => eachDayOfInterval({
        start: weekStart,
        end: addDays(weekStart, 6),
    }), [weekStart]);

    const gridRef = useRef<HTMLDivElement>(null);

    const handleGridClick = (e: React.MouseEvent<HTMLDivElement>, day: Date) => {
        if (!gridRef.current) return;

        const rect = gridRef.current.getBoundingClientRect();
        const clickY = e.clientY - rect.top;

        const totalMinutes = Math.floor(clickY / MINUTE_HEIGHT);
        const hour = Math.floor(totalMinutes / 60);
        const minute = totalMinutes % 60;

        // Snap to nearest 15 minutes
        const snappedMinute = Math.round(minute / 15) * 15;

        const clickedDate = setMinutes(setHours(day, hour), snappedMinute);
        onNewEvent(clickedDate);
    };

    const handleEventClick = (event: CalendarEvent) => {
        setSelectedEvent(event);
        setEventModalOpen(true);
    };

    const closeEventModal = () => {
        setSelectedEvent(null);
        setEventModalOpen(false);
    };

    return (
        <div className="flex flex-1 overflow-hidden">
            <TimeGutter />
            <div className="flex-1 grid grid-cols-7">
                {/* Header */}
                <div className="col-start-1 col-span-7 grid grid-cols-7 sticky top-0 bg-white z-[5]">
                    {weekDays.map((day) => (
                        <div key={day.toISOString()} className="text-center py-2 border-b border-l border-gray-200">
                            <p className={`text-xs text-gray-500 ${isToday(day) ? 'font-bold text-blue-700' : ''}`}>{format(day, 'E')}</p>
                            <p
                                className={`text-2xl font-medium mt-1 rounded-full w-10 h-10 mx-auto flex items-center justify-center
                                    ${isSameDay(day, new Date()) ? 'border-2 border-blue-600' : ''}
                                    ${isSameDay(day, currentDate) ? 'bg-blue-600 text-white' : 'text-gray-700'}`}
                            >
                                {format(day, 'd')}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Grid columns */}
                {weekDays.map((day) => (
                    <div key={day.toISOString()} className="relative border-l border-gray-200" ref={gridRef} onClick={(e) => handleGridClick(e, day)}>
                        {/* Horizontal lines */}
                        {Array.from({ length: 24 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-12 border-b border-gray-200"
                            ></div>
                        ))}
                        {/* Events for this day */}
                        {events
                            .filter((e) => isSameDay(e.startTime, day))
                            .map((event) => (
                                <EventCard key={event.id} event={event} onClick={handleEventClick} />
                            ))}
                    </div>
                ))}
            </div>
            {isEventModalOpen && (
                <EventModal
                    event={selectedEvent}
                    onClose={closeEventModal}
                    onSave={(event) => {
                        if (selectedEvent) onEventUpdate(event);
                        else onEventAdd(event);
                        closeEventModal();
                    }}
                    onDelete={(eventId) => {
                        onEventDelete(eventId);
                        closeEventModal();
                    }}
                />
            )}
            {isAlternativeModalOpen && selectedEvent && (
                <AlternativeModal
                    originalEvent={selectedEvent}
                    onClose={() => setAlternativeModalOpen(false)}
                    onSelectAlternative={(altEvent) => {
                        onEventUpdate({ ...selectedEvent, status: 'cancelled' });
                        onEventAdd(altEvent);
                        setAlternativeModalOpen(false);
                    }}
                />
            )}
        </div>
    );
} 