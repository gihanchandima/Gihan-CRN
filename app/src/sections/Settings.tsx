import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { 
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Mail,
  Key,
  Save,
  CheckCircle,
  Moon,
  Sun,
  Globe,
  CreditCard,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';

type SettingsTab = 'profile' | 'notifications' | 'security' | 'appearance' | 'integrations' | 'billing';

interface TabItem {
  id: SettingsTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function Settings() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;
    gsap.fromTo(sectionRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: 'power2.out' }
    );
  }, []);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs: TabItem[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'integrations', label: 'Integrations', icon: Database },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  return (
    <div ref={sectionRef} className="p-6 space-y-6" style={{ opacity: 0 }}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200">
          <SettingsIcon className="w-6 h-6 text-gray-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your account and preferences</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 space-y-1">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all',
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'hover:bg-gray-50 text-gray-600'
                )}
              >
                <IconComponent className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                <p className="text-sm text-gray-500">Update your personal details</p>
              </div>

              <div className="flex items-center gap-6">
                <img
                  src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                  alt={user?.name}
                  className="w-20 h-20 rounded-full bg-gray-100"
                />
                <div>
                  <Button variant="outline" className="gap-2">
                    <User className="w-4 h-4" />
                    Change Photo
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF. Max 2MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <Input defaultValue={user?.name} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <Input defaultValue={user?.email} type="email" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <Input placeholder="+1 (555) 000-0000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <Input defaultValue={user?.role} disabled className="bg-gray-50" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 min-h-[100px]"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button variant="outline">Cancel</Button>
                <Button 
                  onClick={handleSave}
                  className={cn(
                    'gap-2 transition-all',
                    saved && 'bg-green-600 hover:bg-green-700'
                  )}
                >
                  {saved ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
                <p className="text-sm text-gray-500">Choose how you want to be notified</p>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Email Notifications', description: 'Receive updates via email', default: true },
                  { label: 'Push Notifications', description: 'Receive push notifications in browser', default: true },
                  { label: 'Task Reminders', description: 'Get reminded about upcoming tasks', default: true },
                  { label: 'Deal Updates', description: 'Notify when deals are updated', default: false },
                  { label: 'Lead Assignments', description: 'Notify when leads are assigned to you', default: true },
                  { label: 'Weekly Reports', description: 'Receive weekly summary reports', default: true },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <Switch defaultChecked={item.default} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
                <p className="text-sm text-gray-500">Manage your account security</p>
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Key className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Password</p>
                        <p className="text-sm text-gray-500">Last changed 3 months ago</p>
                      </div>
                    </div>
                    <Button variant="outline">Change Password</Button>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-500">Add an extra layer of security</p>
                      </div>
                    </div>
                    <Switch />
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Active Sessions</p>
                        <p className="text-sm text-gray-500">2 active sessions</p>
                      </div>
                    </div>
                    <Button variant="outline" className="text-red-600 hover:bg-red-50">
                      Sign Out All
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Appearance</h2>
                <p className="text-sm text-gray-500">Customize how NexaCRM looks</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
                  <div className="grid grid-cols-3 gap-4">
                    <button className="p-4 border-2 border-blue-500 rounded-xl bg-white">
                      <Sun className="w-6 h-6 mx-auto mb-2 text-gray-700" />
                      <p className="text-sm font-medium">Light</p>
                    </button>
                    <button className="p-4 border border-gray-200 rounded-xl bg-gray-900">
                      <Moon className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm font-medium text-gray-300">Dark</p>
                    </button>
                    <button className="p-4 border border-gray-200 rounded-xl bg-gradient-to-br from-white to-gray-900">
                      <div className="flex justify-center mb-2">
                        <Sun className="w-4 h-4 text-gray-700" />
                        <Moon className="w-4 h-4 text-gray-300 ml-1" />
                      </div>
                      <p className="text-sm font-medium">Auto</p>
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-gray-900">Compact Mode</p>
                      <p className="text-sm text-gray-500">Reduce padding and spacing</p>
                    </div>
                    <Switch />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-gray-900">Animations</p>
                      <p className="text-sm text-gray-500">Enable UI animations</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Integrations</h2>
                <p className="text-sm text-gray-500">Connect your favorite tools</p>
              </div>

              <div className="space-y-4">
                {[
                  { name: 'Gmail', description: 'Sync emails and calendar', icon: Mail, connected: true },
                  { name: 'Slack', description: 'Get notifications in Slack', icon: Bell, connected: false },
                  { name: 'Google Calendar', description: 'Sync your calendar events', icon: Calendar, connected: true },
                ].map((integration, index) => {
                  const IntIcon = integration.icon;
                  return (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <IntIcon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{integration.name}</p>
                          <p className="text-sm text-gray-500">{integration.description}</p>
                        </div>
                      </div>
                      <Button 
                        variant={integration.connected ? 'outline' : 'default'}
                        className={integration.connected ? 'text-green-600' : ''}
                      >
                        {integration.connected ? 'Connected' : 'Connect'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Billing & Subscription</h2>
                <p className="text-sm text-gray-500">Manage your plan and payments</p>
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
                <p className="text-sm opacity-80">Current Plan</p>
                <p className="text-2xl font-bold">Growth</p>
                <p className="text-sm opacity-80 mt-1">$79/month • Renews Jan 15, 2025</p>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Usage</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Users</span>
                      <span className="text-gray-900">3/20</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div className="h-full w-[15%] bg-blue-500 rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Contacts</span>
                      <span className="text-gray-900">1,234/10,000</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div className="h-full w-[12%] bg-purple-500 rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Storage</span>
                      <span className="text-gray-900">2.4GB/50GB</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div className="h-full w-[5%] bg-green-500 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline">View Invoices</Button>
                <Button>Upgrade Plan</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
