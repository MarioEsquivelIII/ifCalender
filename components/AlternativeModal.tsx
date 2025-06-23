'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, Clock, MapPin, Check, Loader } from 'lucide-react';
import { CalendarEvent, AlternativeEvent } from '@/types/calendar';
import { AIService } from '@/services/aiService';
import { getCategoryColor, formatTime, formatDateTime } from '@/utils/calendar';

interface AlternativeModalProps {
    originalEvent: CalendarEvent;
    onClose: () => void;
    onSelectAlternative: (alternativeEvent: CalendarEvent) => void;
}

export default function AlternativeModal({ originalEvent, onClose, onSelectAlternative }: AlternativeModalProps) {
    const [alternatives, setAlternatives] = useState<AlternativeEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [reasoning, setReasoning] = useState('');
    const [confidence, setConfidence] = useState(0);

    useEffect(() => {
        generateAlternatives();
    }, [originalEvent]);

    const generateAlternatives = async () => {
        setLoading(true);
        try {
            const response = await AIService.generateAlternatives(originalEvent);
            setAlternatives(response.alternatives);
            setReasoning(response.reasoning);
            setConfidence(response.confidence);
        } catch (error) {
            console.error('Error generating alternatives:', error);
            // Fallback alternatives
            setAlternatives([
                {
                    id: '1',
                    title: 'Alternative Activity',
                    description: 'A flexible alternative to your original plan',
                    startTime: originalEvent.startTime,
                    endTime: originalEvent.endTime,
                    category: originalEvent.category,
                    confidence: 0.8,
                    reason: 'Similar category activity'
                }
            ]);
            setReasoning('Generated fallback alternatives due to AI service unavailability.');
            setConfidence(0.7);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAlternative = (alternative: AlternativeEvent) => {
        const alternativeEvent: CalendarEvent = {
            ...alternative,
            status: 'scheduled',
            isAlternative: true,
            originalEventId: originalEvent.id
        };
        onSelectAlternative(alternativeEvent);
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 0.8) return 'text-green-600';
        if (confidence >= 0.6) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getConfidenceText = (confidence: number) => {
        if (confidence >= 0.8) return 'High';
        if (confidence >= 0.6) return 'Medium';
        return 'Low';
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center space-x-3">
                        <Sparkles className="w-6 h-6 text-blue-600" />
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                AI Alternative Suggestions
                            </h2>
                            <p className="text-sm text-gray-600">
                                Can't make it to "{originalEvent.title}"?
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Original Event */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h3 className="font-medium text-gray-900 mb-2">Original Event</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <div className={`w-3 h-3 rounded-full ${getCategoryColor(originalEvent.category)}`} />
                            <span className="font-medium">{originalEvent.title}</span>
                            <span>•</span>
                            <Clock className="w-4 h-4" />
                            <span>{formatDateTime(originalEvent.startTime)}</span>
                            {originalEvent.location && (
                                <>
                                    <span>•</span>
                                    <MapPin className="w-4 h-4" />
                                    <span>{originalEvent.location}</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* AI Reasoning */}
                    {reasoning && (
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                            <div className="flex items-start space-x-2">
                                <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-blue-800">{reasoning}</p>
                                    {confidence > 0 && (
                                        <p className="text-xs text-blue-600 mt-1">
                                            Confidence: <span className={getConfidenceColor(confidence)}>{getConfidenceText(confidence)}</span> ({Math.round(confidence * 100)}%)
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <div className="flex items-center space-x-3">
                                <Loader className="w-6 h-6 text-blue-600 animate-spin" />
                                <span className="text-gray-600">Generating alternatives...</span>
                            </div>
                        </div>
                    )}

                    {/* Alternatives */}
                    {!loading && alternatives.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="font-medium text-gray-900">Suggested Alternatives</h3>
                            {alternatives.map((alternative) => (
                                <div
                                    key={alternative.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
                                    onClick={() => handleSelectAlternative(alternative)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <div className={`w-3 h-3 rounded-full ${getCategoryColor(alternative.category)}`} />
                                                <h4 className="font-medium text-gray-900">{alternative.title}</h4>
                                                <span className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(alternative.confidence)} bg-opacity-10`}>
                                                    {Math.round(alternative.confidence * 100)}% match
                                                </span>
                                            </div>

                                            {alternative.description && (
                                                <p className="text-sm text-gray-600 mb-2">{alternative.description}</p>
                                            )}

                                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                <div className="flex items-center space-x-1">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{formatTime(alternative.startTime)} - {formatTime(alternative.endTime)}</span>
                                                </div>
                                                {alternative.location && (
                                                    <div className="flex items-center space-x-1">
                                                        <MapPin className="w-3 h-3" />
                                                        <span>{alternative.location}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-2">
                                                <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                                    💡 {alternative.reason}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSelectAlternative(alternative);
                                            }}
                                            className="ml-4 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                                            title="Select this alternative"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* No Alternatives */}
                    {!loading && alternatives.length === 0 && (
                        <div className="text-center py-8">
                            <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">No alternatives found. Try again later.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={generateAlternatives}
                        disabled={loading}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>Generate More</span>
                    </button>
                </div>
            </div>
        </div>
    );
} 