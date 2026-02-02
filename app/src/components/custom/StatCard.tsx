import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color?: 'blue' | 'purple' | 'teal' | 'green' | 'orange' | 'red';
  delay?: number;
}

export default function StatCard({ 
  title, 
  value, 
  change, 
  changeLabel = 'vs last month',
  icon, 
  color = 'blue',
  delay = 0 
}: StatCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);

  const colorClasses = {
    blue: 'from-blue-500/10 to-blue-600/5 border-blue-200',
    purple: 'from-purple-500/10 to-purple-600/5 border-purple-200',
    teal: 'from-teal-500/10 to-teal-600/5 border-teal-200',
    green: 'from-green-500/10 to-green-600/5 border-green-200',
    orange: 'from-orange-500/10 to-orange-600/5 border-orange-200',
    red: 'from-red-500/10 to-red-600/5 border-red-200',
  };

  const iconColors = {
    blue: 'text-blue-600 bg-blue-100',
    purple: 'text-purple-600 bg-purple-100',
    teal: 'text-teal-600 bg-teal-100',
    green: 'text-green-600 bg-green-100',
    orange: 'text-orange-600 bg-orange-100',
    red: 'text-red-600 bg-red-100',
  };

  useEffect(() => {
    if (!cardRef.current) return;

    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 30, rotateX: 15 },
      { 
        opacity: 1, 
        y: 0, 
        rotateX: 0,
        duration: 0.7, 
        delay: delay,
        ease: 'expo.out'
      }
    );

    // Animate value counting
    if (valueRef.current && typeof value === 'number') {
      const obj = { val: 0 };
      gsap.to(obj, {
        val: value,
        duration: 1.5,
        delay: delay + 0.3,
        ease: 'power2.out',
        onUpdate: () => {
          if (valueRef.current) {
            valueRef.current.textContent = Math.round(obj.val).toLocaleString();
          }
        }
      });
    }
  }, [delay, value]);

  const getTrendIcon = () => {
    if (change === undefined) return null;
    if (change > 0) return <TrendingUp className="w-4 h-4" />;
    if (change < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (change === undefined) return 'text-gray-500';
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        'relative p-6 rounded-2xl border bg-gradient-to-br backdrop-blur-sm',
        'transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
        'perspective-1000 preserve-3d',
        colorClasses[color]
      )}
      style={{ opacity: 0 }}
    >
      {/* Shine effect on hover */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      <div className="flex items-start justify-between">
        <div className={cn(
          'p-3 rounded-xl',
          iconColors[color]
        )}>
          {icon}
        </div>
        
        {change !== undefined && (
          <div className={cn(
            'flex items-center gap-1 text-sm font-medium',
            getTrendColor()
          )}>
            {getTrendIcon()}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">
          {typeof value === 'number' ? (
            <span ref={valueRef}>0</span>
          ) : (
            value
          )}
        </p>
        
        {change !== undefined && (
          <p className="text-xs text-gray-400 mt-1">{changeLabel}</p>
        )}
      </div>
    </div>
  );
}
