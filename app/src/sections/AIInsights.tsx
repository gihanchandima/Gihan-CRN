import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Lightbulb,
  Target,
  Zap,
  RefreshCw,
  Filter,
  Download,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import AIInsightCard from '@/components/custom/AIInsightCard';
import { useCRM } from '@/contexts/CRMContext';

interface AIMetric {
  label: string;
  value: number;
  change: number;
  target: number;
}

export default function AIInsights() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { aiInsights, leads, deals } = useCRM();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'lead' | 'deal' | 'contact'>('all');
  const [expandedMetrics, setExpandedMetrics] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;
    gsap.fromTo(sectionRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: 'power2.out' }
    );
  }, []);

  const filteredInsights = selectedCategory === 'all' 
    ? aiInsights 
    : aiInsights.filter(i => i.entityType === selectedCategory);

  const aiMetrics: AIMetric[] = [
    { label: 'Lead Conversion Accuracy', value: 87, change: 5, target: 90 },
    { label: 'Deal Prediction Accuracy', value: 82, change: 3, target: 85 },
    { label: 'Revenue Forecast Accuracy', value: 94, change: 2, target: 95 },
    { label: 'Task Priority Accuracy', value: 91, change: -1, target: 90 },
  ];

  const recommendations = [
    {
      title: 'Focus on High-Value Leads',
      description: 'AI has identified 12 leads with 80%+ conversion probability. Prioritize these for maximum ROI.',
      impact: '+$45K potential revenue',
      priority: 'high',
    },
    {
      title: 'Re-engage Cold Deals',
      description: '5 deals in negotiation stage have been inactive for 7+ days. Send follow-up emails.',
      impact: '+$120K at risk',
      priority: 'high',
    },
    {
      title: 'Optimize Call Timing',
      description: 'Data shows 23% higher answer rates between 2-4 PM. Schedule calls during this window.',
      impact: '+23% connection rate',
      priority: 'medium',
    },
    {
      title: 'Expand Enterprise Focus',
      description: 'Enterprise deals have 3.2x higher LTV. Consider increasing enterprise lead generation.',
      impact: '+$200K quarterly',
      priority: 'medium',
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-700';
    }
  };

  return (
    <div ref={sectionRef} className="p-6 space-y-6" style={{ opacity: 0 }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100">
            <Brain className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Insights</h1>
            <p className="text-gray-500 mt-1">AI-powered recommendations and predictions</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* AI Performance Metrics */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-100 p-6">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpandedMetrics(!expandedMetrics)}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">AI Performance Metrics</h2>
          </div>
          <Button variant="ghost" size="sm">
            {expandedMetrics ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {aiMetrics.map((metric, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl p-4 border border-purple-100"
            >
              <p className="text-sm text-gray-500">{metric.label}</p>
              <div className="flex items-end gap-2 mt-2">
                <span className="text-2xl font-bold text-gray-900">{metric.value}%</span>
                <span className={cn(
                  'text-sm font-medium',
                  metric.change >= 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {metric.change >= 0 ? '+' : ''}{metric.change}%
                </span>
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Target: {metric.target}%</span>
                  <span>{Math.round((metric.value / metric.target) * 100)}%</span>
                </div>
                <Progress 
                  value={(metric.value / metric.target) * 100} 
                  className="h-2"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Insights List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filter Tabs */}
          <div className="flex items-center gap-2">
            {(['all', 'lead', 'deal', 'contact'] as const).map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
            <Button variant="outline" size="sm" className="ml-auto gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>

          {/* Insights */}
          <div className="space-y-4">
            {filteredInsights.map((insight, index) => (
              <AIInsightCard 
                key={insight.insightId} 
                insight={insight}
                delay={index * 0.1}
              />
            ))}
            
            {filteredInsights.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <Brain className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No insights available</h3>
                <p className="text-gray-500">Check back later for AI-generated insights</p>
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
            </div>
            
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div 
                  key={index}
                  className={cn(
                    'p-4 rounded-xl border transition-all hover:shadow-md cursor-pointer',
                    getPriorityColor(rec.priority)
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{rec.title}</h4>
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-medium uppercase',
                          rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                          rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        )}>
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-sm mt-1 opacity-90">{rec.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold">{rec.impact}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Stats & Summary */}
        <div className="space-y-6">
          {/* Lead Scoring Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Lead Scoring</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Hot Leads (80-100)</span>
                <span className="font-semibold text-green-600">
                  {leads.filter(l => l.score >= 80).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Warm Leads (60-79)</span>
                <span className="font-semibold text-blue-600">
                  {leads.filter(l => l.score >= 60 && l.score < 80).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cool Leads (40-59)</span>
                <span className="font-semibold text-yellow-600">
                  {leads.filter(l => l.score >= 40 && l.score < 60).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cold Leads (0-39)</span>
                <span className="font-semibold text-red-600">
                  {leads.filter(l => l.score < 40).length}
                </span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Average Score</span>
                <span className="font-semibold">
                  {Math.round(leads.reduce((acc, l) => acc + l.score, 0) / leads.length)}
                </span>
              </div>
            </div>
          </div>

          {/* Deal Predictions */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Deal Predictions</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Likely to Close</span>
                </div>
                <p className="text-2xl font-bold text-green-700 mt-1">
                  {deals.filter(d => d.probability >= 70).length}
                </p>
                <p className="text-sm text-green-600">
                  ${deals.filter(d => d.probability >= 70).reduce((acc, d) => acc + d.value, 0).toLocaleString()}
                </p>
              </div>
              
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                <div className="flex items-center gap-2 text-yellow-700">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-medium">At Risk</span>
                </div>
                <p className="text-2xl font-bold text-yellow-700 mt-1">
                  {deals.filter(d => d.probability < 40).length}
                </p>
                <p className="text-sm text-yellow-600">
                  ${deals.filter(d => d.probability < 40).reduce((acc, d) => acc + d.value, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Quick Actions</h3>
            </div>
            
            <div className="space-y-2">
              <Button 
                variant="secondary" 
                className="w-full justify-start gap-2 bg-white/20 text-white hover:bg-white/30 border-0"
              >
                <Target className="w-4 h-4" />
                Prioritize Hot Leads
              </Button>
              <Button 
                variant="secondary" 
                className="w-full justify-start gap-2 bg-white/20 text-white hover:bg-white/30 border-0"
              >
                <TrendingUp className="w-4 h-4" />
                Generate Forecast
              </Button>
              <Button 
                variant="secondary" 
                className="w-full justify-start gap-2 bg-white/20 text-white hover:bg-white/30 border-0"
              >
                <Brain className="w-4 h-4" />
                Run Full Analysis
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
