import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Heart, Shield, AlertTriangle } from "lucide-react";

interface DashboardIntroProps {
  displayName?: string;
  email?: string;
  role?: string;
  subtitle: string;
  sosAlertsToday?: number;
  totalSosAlerts?: number;
  onSOSAlertClick?: () => void;
  features?: Array<{ icon: any; title: string; description: string }>;
}

const FEATURE_COLORS = [
  { bg: "bg-[#EDEEF9]", icon: "text-[#6B46C1]" },
  { bg: "bg-slate-100", icon: "text-slate-600" },
  { bg: "bg-amber-50", icon: "text-amber-600" },
];

export function DashboardIntro({
  displayName,
  email,
  role,
  subtitle,
  sosAlertsToday,
  totalSosAlerts,
  onSOSAlertClick,
  features,
}: DashboardIntroProps) {
  const defaultFeatures = [
    {
      icon: MapPin,
      title: "Easy Management",
      description: "Streamlined dashboard for all your operations",
    },
    {
      icon: Heart,
      title: "Real-time Updates",
      description: "Stay informed with live notifications and alerts",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security for your data",
    },
  ];

  const displayFeatures = features || defaultFeatures;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-900 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] p-8 md:p-12 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-slate-500/20 rounded-full blur-2xl -ml-24 -mb-24" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:48px_48px]" />

        <div className="relative z-10 space-y-6">
          <div className="space-y-2">
            <p className="text-sm md:text-base font-medium tracking-widest uppercase text-indigo-200">
              Mabuhay ug Madayaw
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              Welcome to City of Mati
            </h1>
          </div>

          <p className="text-base md:text-lg text-slate-300 max-w-xl">{subtitle}</p>

          {email && (
            <div className="space-y-1 pt-6 border-t border-white/20">
              <p className="text-base md:text-lg font-medium">
                Hello, <span className="font-bold text-white">{displayName || email.split("@")[0]}</span>!
              </p>
              <p className="text-sm md:text-base text-slate-400">
                You're all set to continue your work
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            {displayFeatures.slice(0, 3).map((feature, index) => {
              const IconComponent = feature.icon;
              const colors = FEATURE_COLORS[index % FEATURE_COLORS.length];
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-3"
                >
                  <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center shrink-0`}>
                    <IconComponent className={`w-5 h-5 ${colors.icon}`} />
                  </div>
                  <span className="text-sm font-medium text-slate-200">{feature.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {displayFeatures.map((feature, index) => {
          const IconComponent = feature.icon;
          const colors = FEATURE_COLORS[index % FEATURE_COLORS.length];
          return (
            <Card
              key={index}
              className="border border-slate-100 bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-shadow"
            >
              <CardContent className="p-6 space-y-4">
                <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center`}>
                  <IconComponent className={`w-6 h-6 ${colors.icon}`} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* User Info + optional SOS */}
      {email && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border border-slate-100 bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Your Account</h2>
              <div className="grid gap-4 text-sm">
                <div className="bg-[#F8F8FA] rounded-xl p-4 border border-slate-100">
                  <p className="text-slate-500 text-xs uppercase font-semibold tracking-wider">Email</p>
                  <p className="text-slate-900 font-medium mt-1">{email}</p>
                </div>
                <div className="bg-[#F8F8FA] rounded-xl p-4 border border-slate-100">
                  <p className="text-slate-500 text-xs uppercase font-semibold tracking-wider">Account Type</p>
                  <p className="text-slate-900 font-medium mt-1 capitalize">{role || "User"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {sosAlertsToday !== undefined && totalSosAlerts !== undefined && (
            <button
              onClick={onSOSAlertClick}
              className="w-full cursor-pointer text-left rounded-2xl overflow-hidden transition-shadow hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
            >
              <Card className="border border-red-100 bg-red-50/80 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900">SOS Alerts Today</h2>
                    <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-slate-600 text-xs uppercase font-semibold tracking-wider">Total Count</p>
                      <p className="text-red-600 text-4xl font-bold mt-2">{sosAlertsToday}/{totalSosAlerts}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
