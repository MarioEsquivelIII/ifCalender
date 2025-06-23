import React, { useRef, useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { generateEventId } from '@/utils/calendar';
import { CalendarEvent } from '@/types/calendar';

interface MiniCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onCreateEvent?: () => void;
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({ selectedDate, onSelectDate, onCreateEvent }) => {
  const [viewDate, setViewDate] = React.useState(selectedDate);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  React.useEffect(() => { setViewDate(selectedDate); }, [selectedDate]);

  const handleDayClick = (date: Date) => {
    setViewDate(date);
    onSelectDate(date);
  };

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const rows = [];
  let days = [];
  let day = startDate;
  let formattedDate = '';

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, 'd');
      const cloneDay = day;
      days.push(
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full cursor-pointer select-none
            ${isSameDay(day, selectedDate) ? 'bg-blue-600 text-white' : ''}
            ${!isSameMonth(day, monthStart) ? 'text-gray-400' : 'text-gray-900'}`}
          key={day.toString()}
          onClick={() => handleDayClick(cloneDay)}
        >
          {formattedDate}
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="flex justify-between" key={day.toString()}>
        {days}
      </div>
    );
    days = [];
  }

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
        const newEvent: CalendarEvent = {
          id: generateEventId(),
          title,
          startTime,
          endTime,
          category: 'personal',
          status: 'scheduled',
        };
        if (typeof window !== 'undefined') {
          const events = JSON.parse(localStorage.getItem('events') || '[]');
          events.push(newEvent);
          localStorage.setItem('events', JSON.stringify(events));
          window.location.reload();
        }
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
    <div className="flex flex-col items-center justify-center h-full">
      <div className="p-4 bg-white rounded-xl shadow border w-72 flex flex-col items-center">
        <div className="flex items-center justify-between w-full mb-2">
          <button onClick={() => setViewDate(addDays(monthStart, -1))} className="p-1"><ChevronLeft className="w-5 h-5" /></button>
          <div className="text-center font-semibold text-lg">{format(monthStart, 'MMMM yyyy')}</div>
          <button onClick={() => setViewDate(addDays(monthEnd, 1))} className="p-1"><ChevronRight className="w-5 h-5" /></button>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mb-1 w-full">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div className="w-8 text-center" key={d}>{d}</div>
          ))}
        </div>
        {rows}
      </div>
      {onCreateEvent && (
        <>
          <button
            onClick={onCreateEvent}
            className="mt-6 w-72 flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg text-base font-medium hover:bg-blue-700 transition-colors"
          >
            <span className="text-xl">+</span>
            <span>Create Event</span>
          </button>
          <button
            type="button"
            onClick={isListening ? handleStopListening : handleSpeakEvent}
            className={`mt-3 w-72 font-semibold flex items-center justify-center bg-green-500 text-white px-4 py-2 rounded-lg text-base hover:bg-green-600 transition-colors`}
          >
            Speak Event (AI)
          </button>
        </>
      )}
    </div>
  );
};

export default MiniCalendar; 