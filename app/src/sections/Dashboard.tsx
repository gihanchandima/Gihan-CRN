import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Target,
  CheckSquare,
  AlertCircle,
  ArrowUpRight,
  Sparkles,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatCard from '@/components/custom/StatCard';
import AIInsightCard from '@/components/custom/AIInsightCard';
import PipelineChart from '@/components/custom/PipelineChart';
import RevenueChart from '@/components/custom/RevenueChart';
import ActivityChart from '@/components/custom/ActivityChart';
import { useCRM } from '@/contexts/CRMContext';

export default function Dashboard() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { dashboardMetrics, aiInsights, deals, tasks, activities } = useCRM();

  useEffect(() => {
    if (!sectionRef.current) return;

    // Animate section entrance
    gsap.fromTo(sectionRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: 'power2.out' }
    );
  }, []);

  const recentDeals = deals.slice(0, 5);
  const pendingTasks = tasks.filter(t => t.status !== 'completed').slice(0, 5);
  const recentActivities = activities.slice(0, 5);

  return (
    <div ref={sectionRef} className="p-6 space-y-6" style={{ opacity: 0 }}>
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Calendar className="w-4 h-4" />
            Today
          </Button>
          <Button className="bg-gradient-to-r from-blue-500 to-purple-600 gap-2">
            <Sparkles className="w-4 h-4" />
            AI Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Leads"
          value={dashboardMetrics.totalLeads}
          change={12}
          icon={<Users className="w-5 h-5" />}
          color="blue"
          delay={0}
        />
        <StatCard
          title="Revenue This Month"
          value={`$${(dashboardMetrics.revenueThisMonth / 1000).toFixed(0)}k`}
          change={8}
          icon={<DollarSign className="w-5 h-5" />}
          color="green"
          delay={0.1}
        />
        <StatCard
          title="Conversion Rate"
          value={`${dashboardMetrics.conversionRate}%`}
          change={-2}
          icon={<Target className="w-5 h-5" />}
          color="purple"
          delay={0.2}
        />
        <StatCard
          title="Pending Tasks"
          value={dashboardMetrics.tasksPending}
          change={-5}
          icon={<CheckSquare className="w-5 h-5" />}
          color="orange"
          delay={0.3}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pipeline Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Sales Pipeline</h3>
                <p className="text-sm text-gray-500">Deal distribution by stage</p>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
            <PipelineChart data={[
              { stage: 'prospecting', count: 15, value: 180000 },
              { stage: 'qualification', count: 12, value: 240000 },
              { stage: 'proposal', count: 8, value: 320000 },
              { stage: 'negotiation', count: 5, value: 275000 },
              { stage: 'closed-won', count: 8, value: 185000 },
              { stage: 'closed-lost', count: 4, value: 95000 },
            ]} />
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
                <p className="text-sm text-gray-500">Monthly revenue vs target</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-gray-600">Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-gray-600">Target</span>
                </div>
              </div>
            </div>
            <RevenueChart data={[
              { month: 'Jul', revenue: 145000, target: 150000 },
              { month: 'Aug', revenue: 162000, target: 155000 },
              { month: 'Sep', revenue: 158000, target: 160000 },
              { month: 'Oct', revenue: 175000, target: 165000 },
              { month: 'Nov', revenue: 185000, target: 170000 },
              { month: 'Dec', revenue: 95000, target: 180000 },
            ]} />
          </div>

          {/* Activity Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Activity Overview</h3>
                <p className="text-sm text-gray-500">Weekly activity breakdown</p>
              </div>
            </div>
            <ActivityChart data={[
              { date: 'Mon', calls: 8, emails: 15, meetings: 3 },
              { date: 'Tue', calls: 12, emails: 22, meetings: 4 },
              { date: 'Wed', calls: 10, emails: 18, meetings: 2 },
              { date: 'Thu', calls: 14, emails: 25, meetings: 5 },
              { date: 'Fri', calls: 9, emails: 20, meetings: 3 },
              { date: 'Sat', calls: 2, emails: 5, meetings: 0 },
              { date: 'Sun', calls: 1, emails: 3, meetings: 0 },
            ]} />
          </div>
        </div>

        {/* Right Column - AI Insights & Activity */}
        <div className="space-y-6">
          {/* AI Insights */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
            </div>
            <div className="space-y-4">
              {aiInsights.slice(0, 2).map((insight, index) => (
                <AIInsightCard
                  key={insight.insightId}
                  insight={insight}
                  delay={index * 0.1}
                />
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4 border-purple-200 hover:bg-purple-100"
            >
              View All Insights
            </Button>
          </div>

          {/* Recent Deals */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Deals</h3>
            <div className="space-y-3">
              {recentDeals.map((deal) => (
                <div
                  key={deal.dealId}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{deal.title}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(deal.expectedCloseDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 text-sm">
                      ${deal.value.toLocaleString()}
                    </p>
                    <span className={
                      deal.probability >= 70 ? 'text-green-600 text-xs' :
                      deal.probability >= 40 ? 'text-yellow-600 text-xs' : 'text-red-600 text-xs'
                    }>
                      {deal.probability}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Pending Tasks</h3>
              {dashboardMetrics.tasksOverdue > 0 && (
                <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                  <AlertCircle className="w-3 h-3" />
                  {dashboardMetrics.tasksOverdue} overdue
                </span>
              )}
            </div>
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <div
                  key={task.taskId}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className={
                    task.status === 'completed' 
                      ? 'w-4 h-4 rounded border-2 mt-0.5 flex-shrink-0 bg-blue-500 border-blue-500' 
                      : 'w-4 h-4 rounded border-2 mt-0.5 flex-shrink-0 border-gray-300'
                  } />
                  <div className="flex-1 min-w-0">
                    <p className={task.status === 'completed' ? 'text-sm font-medium text-gray-500 line-through' : 'text-sm font-medium text-gray-900'}>
                      {task.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Due {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={
                    task.priority === 'high' ? 'text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex-shrink-0' :
                    task.priority === 'medium' ? 'text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 flex-shrink-0' :
                    'text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 flex-shrink-0'
                  }>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div
                  key={activity.activityId}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={
                    activity.type === 'call' ? 'w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0' :
                    activity.type === 'email' ? 'w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0' :
                    activity.type === 'meeting' ? 'w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0' :
                    'w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center flex-shrink-0'
                  }>
                    {activity.type === 'call' && <TrendingUp className="w-4 h-4" />}
                    {activity.type === 'email' && <ArrowUpRight className="w-4 h-4" />}
                    {activity.type === 'meeting' && <Users className="w-4 h-4" />}
                    {activity.type === 'note' && <CheckSquare className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.subject}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
