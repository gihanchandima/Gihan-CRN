import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { PipelineData } from '@/types';

interface PipelineChartProps {
  data: PipelineData[];
}

const stageColors: Record<string, string> = {
  prospecting: '#94a3b8',
  qualification: '#3b82f6',
  proposal: '#8b5cf6',
  negotiation: '#f59e0b',
  'closed-won': '#10b981',
  'closed-lost': '#ef4444',
};

const stageLabels: Record<string, string> = {
  prospecting: 'Prospecting',
  qualification: 'Qualification',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  'closed-won': 'Closed Won',
  'closed-lost': 'Closed Lost',
};

export default function PipelineChart({ data }: PipelineChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    gsap.fromTo(chartRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', delay: 0.3 }
    );
  }, []);

  const formattedData = data.map(item => ({
    ...item,
    label: stageLabels[item.stage],
    color: stageColors[item.stage],
  }));

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
          <p className="font-semibold text-gray-900">{item.label}</p>
          <p className="text-sm text-gray-600 mt-1">
            Deals: <span className="font-medium">{item.count}</span>
          </p>
          <p className="text-sm text-gray-600">
            Value: <span className="font-medium">${item.value.toLocaleString()}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div ref={chartRef} className="w-full h-[300px]" style={{ opacity: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis 
            dataKey="label" 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value / 1000}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
