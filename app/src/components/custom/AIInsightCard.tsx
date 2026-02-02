import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Brain, Sparkles, TrendingUp, AlertTriangle, CheckCircle, Lightbulb, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AIInsight } from '@/types';

interface AIInsightCardProps {
  insight: AIInsight;
  onDismiss?: () => void;
  delay?: number;
}

export default function AIInsightCard({ insight, onDismiss, delay = 0 }: AIInsightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!cardRef.current) return;

    gsap.fromTo(cardRef.current,
      { opacity: 0, x: -30, scale: 0.95 },
      { 
        opacity: 1, 
        x: 0, 
        scale: 1,
        duration: 0.6, 
        delay: delay,
        ease: 'expo.out'
      }
    );
  }, [delay]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-orange-600 bg-orange-50';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Review Needed';
  };

  const getInsightIcon = () => {
    if (insight.confidence >= 0.9) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (insight.confidence >= 0.7) return <TrendingUp className="w-5 h-5 text-blue-600" />;
    if (insight.summary.toLowerCase().includes('risk')) return <AlertTriangle className="w-5 h-5 text-orange-600" />;
    return <Lightbulb className="w-5 h-5 text-purple-600" />;
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        'relative p-5 rounded-xl border border-purple-100 bg-white/80 backdrop-blur-sm',
        'transition-all duration-300 hover:shadow-lg',
        'overflow-hidden'
      )}
      style={{ opacity: 0 }}
    >
      {/* AI Glow Effect */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100">
            <Brain className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              AI Insight
              <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
            </h4>
            <p className="text-xs text-gray-500">
              Generated {new Date(insight.generatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            getConfidenceColor(insight.confidence)
          )}>
            {getConfidenceLabel(insight.confidence)}
          </span>
          
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-start gap-3 mb-4">
        {getInsightIcon()}
        <p className="text-gray-700 text-sm leading-relaxed">{insight.summary}</p>
      </div>

      {/* Recommendations */}
      <div className="space-y-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
        >
          <Lightbulb className="w-4 h-4" />
          {isExpanded ? 'Hide Recommendations' : 'Show Recommendations'}
        </button>
        
        {isExpanded && (
          <ul className="space-y-2 mt-3">
            {insight.recommendations.map((rec, index) => (
              <li 
                key={index}
                className="flex items-start gap-2 text-sm text-gray-600"
                style={{ 
                  animation: `slideUp 0.3s ease-out ${index * 0.1}s both` 
                }}
              >
                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Confidence Bar */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>AI Confidence</span>
          <span>{Math.round(insight.confidence * 100)}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={cn(
              'h-full rounded-full transition-all duration-1000',
              insight.confidence >= 0.8 ? 'bg-green-500' :
              insight.confidence >= 0.6 ? 'bg-yellow-500' : 'bg-orange-500'
            )}
            style={{ width: `${insight.confidence * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
