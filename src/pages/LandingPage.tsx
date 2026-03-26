import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import {
  ArrowRight,
  BarChart3,
  PiggyBank,
  Shield,
  TrendingUp,
  Wallet,
  Zap,
  Target,
  Bell,
  Lock,
  Smartphone,
  Globe,
  LayoutDashboard,
  Table as TableIcon,
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isMyanmar = i18n.language === 'my';

  const features = [
    {
      icon: <Wallet className="h-8 w-8" />,
      title: t('landing.features.smartTracking.title'),
      description: t('landing.features.smartTracking.description'),
      gradient: "from-sky-500 to-cyan-500",
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: t('landing.features.budgetPlanning.title'),
      description: t('landing.features.budgetPlanning.description'),
      gradient: "from-cyan-500 to-teal-500",
    },
    {
      icon: <PiggyBank className="h-8 w-8" />,
      title: t('landing.features.insights.title'),
      description: t('landing.features.insights.description'),
      gradient: "from-teal-500 to-emerald-500",
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: t('landing.features.multiCurrency.title'),
      description: t('landing.features.multiCurrency.description'),
      gradient: "from-blue-500 to-sky-500",
    },
    {
      icon: <Bell className="h-8 w-8" />,
      title: t('landing.features.cloudSync.title'),
      description: t('landing.features.cloudSync.description'),
      gradient: "from-sky-400 to-cyan-400",
    },
    {
      icon: <Lock className="h-8 w-8" />,
      title: t('landing.features.secure.title'),
      description: t('landing.features.secure.description'),
      gradient: "from-indigo-500 to-blue-500",
    },
  ];

  const stats = [
    { value: "10K+", label: t('landing.stats.users') },
    { value: "$50M+", label: t('landing.stats.tracked') },
    { value: "99.9%", label: t('landing.stats.saved') },
    { value: "4.9★", label: t('landing.stats.rating') },
  ];

  const benefits = [
    { icon: <Zap className="h-5 w-5" />, text: t('landing.benefits.easy.title') },
    { icon: <Smartphone className="h-5 w-5" />, text: t('landing.benefits.powerful.title') },
    { icon: <Globe className="h-5 w-5" />, text: t('landing.benefits.secure.title') },
    { icon: <Target className="h-5 w-5" />, text: t('landing.benefits.support.title') },
    { icon: <Shield className="h-5 w-5" />, text: t('landing.benefits.updates.title') },
  ];

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 -left-40 w-80 h-80 bg-sky-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-40 w-80 h-80 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-20 w-80 h-80 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        
        {/* Additional floating orbs - more variety */}
        <div className="absolute top-1/2 left-1/4 w-60 h-60 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-12 animate-float"></div>
        <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-12 animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/3 right-1/4 w-56 h-56 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
        <div className="absolute bottom-1/2 left-1/3 w-64 h-64 bg-sky-300 rounded-full mix-blend-multiply filter blur-3xl opacity-11 animate-float" style={{animationDelay: '0.5s', animationDuration: '6s'}}></div>
        
        {/* Sparkle spots throughout */}
        <div className="absolute top-1/5 left-1/6 w-1.5 h-1.5 bg-sky-400/40 rounded-full animate-pulse shadow-md shadow-sky-200"></div>
        <div className="absolute top-2/5 right-1/5 w-2 h-2 bg-cyan-400/35 rounded-full animate-pulse shadow-md shadow-cyan-200" style={{animationDelay: '0.8s'}}></div>
        <div className="absolute bottom-1/5 left-2/5 w-1 h-1 bg-teal-400/40 rounded-full animate-pulse shadow-sm shadow-teal-200" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute top-3/5 right-2/5 w-1.5 h-1.5 bg-sky-400/38 rounded-full animate-pulse shadow-md shadow-sky-200" style={{animationDelay: '0.3s'}}></div>
        <div className="absolute bottom-2/5 left-3/5 w-1 h-1 bg-cyan-400/42 rounded-full animate-pulse shadow-sm shadow-cyan-200" style={{animationDelay: '1.2s'}}></div>
        <div className="absolute top-4/5 right-1/6 w-1.5 h-1.5 bg-teal-400/40 rounded-full animate-pulse shadow-md shadow-teal-200" style={{animationDelay: '0.6s'}}></div>
        
        {/* Decorative floating circles */}
        <div className="absolute top-1/6 right-1/5 w-20 h-20 border border-sky-300/25 rounded-full animate-float" style={{animationDuration: '6s', animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-1/6 left-1/5 w-24 h-24 border-2 border-cyan-300/22 rounded-full animate-float" style={{animationDuration: '7s', animationDelay: '1s'}}></div>
        <div className="absolute top-2/5 left-1/8 w-16 h-16 border border-teal-300/28 rounded-full animate-float" style={{animationDuration: '5.5s', animationDelay: '0.3s'}}></div>
        <div className="absolute bottom-3/5 right-1/8 w-22 h-22 border border-sky-300/24 rounded-full animate-float" style={{animationDuration: '6.5s', animationDelay: '1.5s'}}></div>
      </div>

      {/* Navigation */}
      <nav className="border-b border-sky-100/50 bg-white/70 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3 group animate-in fade-in slide-in-from-left duration-700">
              <div className="relative animate-bounce-subtle">
                <div className="absolute inset-0 bg-linear-to-br from-sky-400 to-cyan-500 rounded-xl blur-md opacity-60 group-hover:opacity-100 transition-opacity animate-pulse-glow"></div>
                <div className="relative h-10 w-10 rounded-xl bg-linear-to-br from-sky-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-sky-500/40 group-hover:shadow-sky-500/60 transition-all group-hover:scale-110 group-hover:rotate-12">
                  <Wallet className="h-5 w-5 text-white animate-float" />
                </div>
              </div>
              <span className="text-xl font-bold bg-linear-to-r from-sky-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                ExpenseTracker
              </span>
            </div>
            <div className="flex gap-3 animate-in fade-in slide-in-from-right duration-700">
              <LanguageSwitcher />
              <Button 
                variant="ghost" 
                onClick={() => navigate("/login")} 
                className="hover:text-sky-600 hover:bg-sky-50 transition-all"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate("/signup")} 
                className="relative overflow-hidden bg-linear-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40 transition-all hover:scale-110 group animate-pulse-glow"
              >
                <span className="relative z-10 font-semibold">Get Started</span>
                <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute top-0 left-0 w-full h-full bg-white/10 animate-shimmer"></div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-b from-sky-50/30 via-white to-white">
        {/* Premium Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated gradient mesh */}
          <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-sky-100/40 via-cyan-50/30 to-teal-100/40 animate-gradient-shift"></div>
          
          {/* Floating orbs */}
          <div className="absolute top-20 left-10 w-64 h-64 bg-linear-to-br from-sky-400/30 to-cyan-500/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-40 right-20 w-80 h-80 bg-linear-to-br from-cyan-400/20 to-teal-500/20 rounded-full blur-3xl animate-float" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
          <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-linear-to-br from-teal-400/25 to-sky-500/25 rounded-full blur-3xl animate-float" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
          
          {/* Sparkle effects - more scattered throughout */}
          <div className="absolute top-1/4 left-1/4 w-1.5 h-1.5 bg-sky-400/50 rounded-full animate-pulse shadow-lg shadow-sky-300"></div>
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-cyan-400/45 rounded-full animate-pulse shadow-lg shadow-cyan-300" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute bottom-1/3 left-1/2 w-1 h-1 bg-teal-400/50 rounded-full animate-pulse shadow-md shadow-teal-300" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-sky-400/45 rounded-full animate-pulse shadow-lg shadow-sky-300" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute top-10 right-1/3 w-1 h-1 bg-cyan-400/50 rounded-full animate-pulse shadow-md shadow-cyan-200" style={{animationDelay: '0.3s'}}></div>
          <div className="absolute bottom-20 left-1/5 w-1.5 h-1.5 bg-teal-400/45 rounded-full animate-pulse shadow-lg shadow-teal-300" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-2/3 right-1/5 w-2 h-2 bg-sky-300/45 rounded-full animate-pulse shadow-lg shadow-sky-200" style={{animationDelay: '0.8s'}}></div>
          <div className="absolute bottom-1/2 right-2/3 w-1 h-1 bg-cyan-300/50 rounded-full animate-pulse shadow-sm shadow-cyan-200" style={{animationDelay: '1.2s'}}></div>
          <div className="absolute top-1/5 left-2/3 w-1.5 h-1.5 bg-teal-300/45 rounded-full animate-pulse shadow-lg shadow-teal-200" style={{animationDelay: '1.8s'}}></div>
          <div className="absolute bottom-2/3 left-1/6 w-1 h-1 bg-sky-300/50 rounded-full animate-pulse shadow-sm shadow-sky-200" style={{animationDelay: '0.6s'}}></div>
          <div className="absolute top-3/4 left-1/2 w-1.5 h-1.5 bg-cyan-300/47 rounded-full animate-pulse shadow-lg shadow-cyan-200" style={{animationDelay: '1.4s'}}></div>
          <div className="absolute bottom-1/4 right-1/2 w-1 h-1 bg-teal-300/50 rounded-full animate-pulse shadow-sm shadow-teal-200" style={{animationDelay: '0.9s'}}></div>
          <div className="absolute top-1/6 right-2/5 w-2 h-2 bg-sky-300/42 rounded-full animate-pulse shadow-lg shadow-sky-200" style={{animationDelay: '1.7s'}}></div>
          <div className="absolute bottom-1/5 left-2/5 w-1.5 h-1.5 bg-cyan-300/45 rounded-full animate-pulse shadow-lg shadow-cyan-200" style={{animationDelay: '0.4s'}}></div>
          <div className="absolute top-1/8 left-1/5 w-1 h-1 bg-teal-400/47 rounded-full animate-pulse shadow-sm shadow-teal-300" style={{animationDelay: '2.2s'}}></div>
          <div className="absolute bottom-3/4 right-1/6 w-1.5 h-1.5 bg-sky-400/47 rounded-full animate-pulse shadow-lg shadow-sky-300" style={{animationDelay: '1.1s'}}></div>
          <div className="absolute top-3/5 left-3/4 w-2 h-2 bg-cyan-400/43 rounded-full animate-pulse shadow-lg shadow-cyan-300" style={{animationDelay: '0.7s'}}></div>
          <div className="absolute bottom-2/5 right-3/5 w-1 h-1 bg-teal-400/45 rounded-full animate-pulse shadow-sm shadow-teal-300" style={{animationDelay: '1.9s'}}></div>
          <div className="absolute top-4/5 right-1/5 w-1.5 h-1.5 bg-sky-400/49 rounded-full animate-pulse shadow-lg shadow-sky-300" style={{animationDelay: '0.2s'}}></div>
          <div className="absolute top-2/5 left-1/10 w-1 h-1 bg-cyan-400/48 rounded-full animate-pulse shadow-sm shadow-cyan-200" style={{animationDelay: '1.3s'}}></div>
          <div className="absolute bottom-1/6 right-1/8 w-1.5 h-1.5 bg-teal-400/46 rounded-full animate-pulse shadow-lg shadow-teal-300" style={{animationDelay: '0.75s'}}></div>
          <div className="absolute top-1/7 left-3/5 w-2 h-2 bg-sky-400/44 rounded-full animate-pulse shadow-lg shadow-sky-300" style={{animationDelay: '1.6s'}}></div>
          <div className="absolute bottom-3/5 right-2/4 w-1 h-1 bg-cyan-400/50 rounded-full animate-pulse shadow-sm shadow-cyan-200" style={{animationDelay: '0.85s'}}></div>
          <div className="absolute top-2/7 right-3/4 w-1.5 h-1.5 bg-teal-400/45 rounded-full animate-pulse shadow-lg shadow-teal-300" style={{animationDelay: '1.25s'}}></div>
        </div>
        
        {/* Decorative grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[40px_40px]"></div>
        
        {/* Multiple Radial gradients for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(14,165,233,0.08),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.07),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.06),transparent_60%)]"></div>
        
        {/* Floating decorative circles - various sizes */}
        <div className="absolute top-1/4 right-20 w-24 h-24 border-2 border-sky-300/35 rounded-full animate-float" style={{animationDuration: '6s'}}></div>
        <div className="absolute bottom-1/4 left-20 w-32 h-32 border-2 border-cyan-300/31 rounded-full animate-float" style={{animationDuration: '7.5s', animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 right-1/3 w-20 h-20 border border-teal-300/27 rounded-full animate-float" style={{animationDuration: '5.5s', animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-1/3 left-1/2 w-28 h-28 border-2 border-sky-300/23 rounded-full animate-float" style={{animationDuration: '8s', animationDelay: '1.5s'}}></div>
        <div className="absolute top-1/6 left-1/3 w-16 h-16 border border-cyan-300/31 rounded-full animate-float" style={{animationDuration: '6.5s', animationDelay: '0.8s'}}></div>
        <div className="absolute bottom-1/6 right-1/4 w-36 h-36 border-2 border-teal-300/20 rounded-full animate-float" style={{animationDuration: '7s', animationDelay: '2s'}}></div>
        <div className="absolute top-2/3 left-1/5 w-22 h-22 border border-sky-300/25 rounded-full animate-float" style={{animationDuration: '5.8s', animationDelay: '0.3s'}}></div>
        <div className="absolute bottom-2/3 right-1/5 w-18 h-18 border border-cyan-300/29 rounded-full animate-float" style={{animationDuration: '6.2s', animationDelay: '1.2s'}}></div>
        <div className="absolute top-1/3 left-2/3 w-26 h-26 border-2 border-teal-300/27 rounded-full animate-float" style={{animationDuration: '7.2s', animationDelay: '0.6s'}}></div>
        <div className="absolute top-1/8 right-1/6 w-20 h-20 border border-sky-300/29 rounded-full animate-float" style={{animationDuration: '6.3s', animationDelay: '1.8s'}}></div>
        <div className="absolute bottom-3/5 left-1/4 w-24 h-24 border-2 border-cyan-300/25 rounded-full animate-float" style={{animationDuration: '6.8s', animationDelay: '0.9s'}}></div>
        <div className="absolute top-4/5 right-2/5 w-30 h-30 border-2 border-teal-300/23 rounded-full animate-float" style={{animationDuration: '7.8s', animationDelay: '1.3s'}}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-28 sm:pt-32 sm:pb-36">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-linear-to-r from-sky-500/10 to-cyan-500/10 border border-sky-200/50 backdrop-blur-sm mb-8 animate-in fade-in zoom-in duration-700 delay-100 hover:scale-110 transition-all cursor-default group animate-float shadow-lg hover:shadow-sky-500/30">
              <div className="relative">
                <Zap className="h-4 w-4 text-sky-600 group-hover:rotate-12 transition-transform" />
                <div className="absolute inset-0 animate-ping">
                  <Zap className="h-4 w-4 text-sky-400 opacity-75" />
                </div>
              </div>
              <span className="text-sm font-semibold bg-linear-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">
                {t('landing.badge')}
              </span>
            </div>
            
            {/* Main Heading */}
            <h1 className={`text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight mb-6 ${isMyanmar ? 'leading-relaxed' : 'leading-tight'}`}>
              <span className="block text-gray-900 animate-in fade-in slide-in-from-bottom duration-700 delay-200">
                {t('landing.hero.title1')}
              </span>
              <span className={`block relative animate-in fade-in slide-in-from-bottom duration-700 delay-300 ${isMyanmar ? 'mt-4' : ''}`}>
                <span className="relative inline-block group cursor-default">
                  <span className="absolute inset-0 bg-linear-to-r from-sky-600 via-cyan-600 to-teal-600 blur-2xl opacity-30 group-hover:opacity-50 transition-opacity animate-pulse"></span>
                  <span className={`relative bg-linear-to-r from-sky-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent animate-gradient bg-size-[200%_200%] ${isMyanmar ? 'inline-block py-1' : ''}`} style={{backgroundSize: '200% 200%'}}>
                    {t('landing.hero.title2')}
                  </span>
                </span>
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom duration-700 delay-400">
              {t('landing.hero.subtitle')} 
              <span className="font-semibold text-sky-600">{t('landing.hero.subtitleBold')}</span>. {' '}
              {t('landing.hero.subtitleEnd')}
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-in fade-in slide-in-from-bottom duration-700 delay-500">
              <Button 
                size="lg" 
                onClick={() => navigate("/signup")}
                className="relative overflow-hidden bg-linear-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-lg px-10 h-14 shadow-2xl shadow-sky-500/40 hover:shadow-sky-500/60 hover:scale-110 transition-all text-white font-semibold group animate-pulse-glow"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {t('landing.hero.ctaStart')}
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform animate-bounce-subtle" />
                </span>
                <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/25 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute inset-0 bg-white/10 animate-shimmer"></div>
                </div>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/login")}
                className="text-lg px-10 h-14 border-2 border-sky-200 hover:border-sky-400 hover:bg-linear-to-r hover:from-sky-50 hover:to-cyan-50 hover:scale-110 transition-all font-semibold group shadow-lg hover:shadow-xl relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {t('landing.hero.ctaDemo')}
                  <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse group-hover:scale-150 transition-transform"></div>
                </span>
                <div className="absolute inset-0 bg-linear-to-r from-sky-100/0 via-sky-100/50 to-sky-100/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto pt-8 border-t border-sky-100">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="text-center group cursor-default animate-in fade-in zoom-in duration-700"
                  style={{ animationDelay: `${700 + index * 100}ms` }}
                >
                  <div className="relative inline-block mb-2">
                    <div className="absolute inset-0 bg-linear-to-r from-sky-600 to-cyan-600 blur-xl opacity-0 group-hover:opacity-40 transition-opacity animate-pulse"></div>
                    <div className="relative text-4xl sm:text-5xl font-black bg-linear-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent group-hover:scale-125 transition-all duration-300 animate-float">
                      {stat.value}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-600 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 sm:py-32 bg-white relative">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.05),transparent_70%)]"></div>
        
        {/* Floating decorative circles */}
        <div className="absolute top-10 right-10 w-20 h-20 border-4 border-sky-200 rounded-full animate-float opacity-50" style={{animationDuration: '6s'}}></div>
        <div className="absolute bottom-20 left-10 w-32 h-32 border-4 border-cyan-200 rounded-full animate-float opacity-30" style={{animationDuration: '7.5s', animationDelay: '1s'}}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-block mb-4 animate-fade-in-up-soft">
              <span className="text-sm font-bold uppercase tracking-wider text-sky-600 bg-sky-100 px-4 py-2 rounded-full">
                {t('landing.features.title')}
              </span>
            </div>
            <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-black mb-6 animate-smooth-reveal animation-delay-100 ${isMyanmar ? 'leading-relaxed' : ''}`}>
              <span className="block text-gray-900">{t('landing.features.subtitle1')}</span>
              <span className={`relative inline-block ${isMyanmar ? 'mt-4' : 'mt-2'}`}>
                <span className="absolute inset-0 bg-linear-to-r from-sky-600 to-cyan-600 blur-2xl opacity-20"></span>
                <span className={`relative bg-linear-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent ${isMyanmar ? 'inline-block py-1' : ''}`}>
                  {t('landing.features.subtitle2')}
                </span>
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-up-soft animation-delay-200">
              {t('landing.features.description')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group relative overflow-hidden border-2 border-sky-100 hover:border-sky-300 bg-white hover:shadow-2xl hover:shadow-sky-500/10 transition-all duration-500 hover:-translate-y-3 animate-in fade-in slide-in-from-bottom"
                style={{ animationDelay: `${index * 100}ms`, animationDuration: '700ms' }}
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-linear-to-br from-sky-50/0 via-cyan-50/0 to-teal-50/0 group-hover:from-sky-50/50 group-hover:via-cyan-50/30 group-hover:to-teal-50/50 transition-all duration-500"></div>
                
                <CardContent className="relative p-8">
                  {/* Icon */}
                  <div className="mb-6 relative inline-block">
                    <div className="absolute inset-0 bg-linear-to-br from-sky-400 to-cyan-500 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 animate-pulse"></div>
                    <div className={`relative inline-flex p-4 rounded-2xl bg-linear-to-br ${feature.gradient} text-white shadow-lg group-hover:shadow-2xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 animate-float`}>
                      <div className="animate-bounce-subtle">
                        {feature.icon}
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-sky-600 transition-all duration-300 group-hover:translate-x-1">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors">
                    {feature.description}
                  </p>
                  
                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-linear-to-br from-sky-100/0 to-cyan-100/50 rounded-bl-[100%] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 sm:py-32 relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-linear-to-br from-sky-600 via-cyan-600 to-teal-600"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-size-[40px_40px] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)]"></div>
        </div>
        
        {/* Floating stars/sparkles */}
        <div className="absolute top-10 left-10 w-1 h-1 bg-white rounded-full animate-pulse opacity-80"></div>
        <div className="absolute top-20 right-20 w-1 h-1 bg-white rounded-full animate-pulse opacity-60" style={{animationDelay: '0.3s'}}></div>
        <div className="absolute bottom-20 left-20 w-1 h-1 bg-white rounded-full animate-pulse opacity-70" style={{animationDelay: '0.6s'}}></div>
        <div className="absolute bottom-40 right-40 w-1 h-1 bg-white rounded-full animate-pulse opacity-50" style={{animationDelay: '0.9s'}}></div>
        <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-white rounded-full animate-pulse opacity-90" style={{animationDelay: '1.2s'}}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom duration-700">
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
              {t('landing.benefits.title')}
            </h2>
            <p className="text-xl text-sky-100 max-w-2xl mx-auto">
              {t('landing.benefits.subtitle')}
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className="group relative overflow-hidden animate-float"
                style={{animationDelay: `${index * 0.2}s`}}
              >
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 group-hover:bg-white/20 group-hover:border-white/40 transition-all duration-300 animate-pulse-glow"></div>
                <div 
                  className="relative flex items-center gap-4 p-6 rounded-2xl group-hover:scale-105 transition-all duration-300 animate-in fade-in slide-in-from-bottom"
                  style={{ animationDelay: `${index * 100}ms`, animationDuration: '500ms' }}
                >
                  <div className="shrink-0 bg-white/20 backdrop-blur-md p-3 rounded-xl group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shadow-lg animate-bounce-subtle">
                    <div className="text-white">
                      {benefit.icon}
                    </div>
                  </div>
                  <span className="font-semibold text-white text-lg group-hover:scale-105 transition-transform duration-300">{benefit.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/40 to-transparent"></div>
      </section>

      {/* Screenshots Section */}
      <section className="py-24 sm:py-32 bg-linear-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Decorative elements - Enhanced with more spots and bubbles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/3 w-56 h-56 bg-sky-300 rounded-full mix-blend-multiply filter blur-3xl opacity-18 animate-float" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute bottom-1/3 right-1/5 w-60 h-60 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-16 animate-float" style={{animationDelay: '0.8s'}}></div>
        
        {/* Sparkle spots scattered throughout */}
        <div className="absolute top-1/5 left-1/6 w-1.5 h-1.5 bg-sky-400/45 rounded-full animate-pulse shadow-lg shadow-sky-300"></div>
        <div className="absolute top-1/4 right-1/5 w-2 h-2 bg-cyan-400/40 rounded-full animate-pulse shadow-lg shadow-cyan-300" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-1/3 left-1/3 w-1 h-1 bg-teal-400/50 rounded-full animate-pulse shadow-md shadow-teal-300" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-2/5 right-2/5 w-1.5 h-1.5 bg-sky-400/42 rounded-full animate-pulse shadow-lg shadow-sky-300" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute bottom-1/5 left-1/4 w-1 h-1 bg-cyan-400/48 rounded-full animate-pulse shadow-md shadow-cyan-300" style={{animationDelay: '0.3s'}}></div>
        <div className="absolute bottom-1/4 right-1/6 w-1.5 h-1.5 bg-teal-400/45 rounded-full animate-pulse shadow-lg shadow-teal-300" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-3/5 left-2/5 w-2 h-2 bg-sky-300/40 rounded-full animate-pulse shadow-lg shadow-sky-200" style={{animationDelay: '0.8s'}}></div>
        <div className="absolute bottom-2/5 right-1/3 w-1 h-1 bg-cyan-300/50 rounded-full animate-pulse shadow-sm shadow-cyan-200" style={{animationDelay: '1.2s'}}></div>
        <div className="absolute top-1/6 right-1/4 w-1.5 h-1.5 bg-teal-300/45 rounded-full animate-pulse shadow-lg shadow-teal-200" style={{animationDelay: '1.8s'}}></div>
        <div className="absolute bottom-1/6 left-1/5 w-1 h-1 bg-sky-300/50 rounded-full animate-pulse shadow-sm shadow-sky-200" style={{animationDelay: '0.6s'}}></div>
        <div className="absolute top-4/5 left-1/2 w-1.5 h-1.5 bg-cyan-300/47 rounded-full animate-pulse shadow-lg shadow-cyan-200" style={{animationDelay: '1.4s'}}></div>
        <div className="absolute bottom-1/3 left-2/3 w-1 h-1 bg-teal-300/50 rounded-full animate-pulse shadow-sm shadow-teal-200" style={{animationDelay: '0.9s'}}></div>
        <div className="absolute top-2/3 right-2/5 w-2 h-2 bg-sky-300/42 rounded-full animate-pulse shadow-lg shadow-sky-200" style={{animationDelay: '1.7s'}}></div>
        <div className="absolute bottom-2/3 left-3/5 w-1.5 h-1.5 bg-cyan-300/45 rounded-full animate-pulse shadow-lg shadow-cyan-200" style={{animationDelay: '0.4s'}}></div>
        <div className="absolute top-1/7 left-1/8 w-1 h-1 bg-teal-400/47 rounded-full animate-pulse shadow-sm shadow-teal-300" style={{animationDelay: '2.2s'}}></div>
        <div className="absolute bottom-3/4 right-1/8 w-1.5 h-1.5 bg-sky-400/47 rounded-full animate-pulse shadow-lg shadow-sky-300" style={{animationDelay: '1.1s'}}></div>
        <div className="absolute top-3/4 left-3/4 w-2 h-2 bg-cyan-400/43 rounded-full animate-pulse shadow-lg shadow-cyan-300" style={{animationDelay: '0.7s'}}></div>
        <div className="absolute bottom-3/5 right-3/5 w-1 h-1 bg-teal-400/45 rounded-full animate-pulse shadow-sm shadow-teal-300" style={{animationDelay: '1.9s'}}></div>
        
        {/* Floating decorative circles */}
        <div className="absolute top-1/4 left-1/4 w-16 h-16 border-2 border-sky-300/40 rounded-full animate-float" style={{animationDuration: '6s'}}></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 border-2 border-cyan-300/35 rounded-full animate-float" style={{animationDelay: '1s', animationDuration: '7s'}}></div>
        <div className="absolute top-1/3 right-1/5 w-20 h-20 border border-teal-300/32 rounded-full animate-float" style={{animationDelay: '0.5s', animationDuration: '5.5s'}}></div>
        <div className="absolute bottom-1/3 left-1/5 w-18 h-18 border border-sky-300/38 rounded-full animate-float" style={{animationDelay: '1.5s', animationDuration: '6.5s'}}></div>
        <div className="absolute top-1/2 left-1/6 w-22 h-22 border-2 border-cyan-300/30 rounded-full animate-float" style={{animationDelay: '0.8s', animationDuration: '5s'}}></div>
        <div className="absolute bottom-1/2 right-1/6 w-26 h-26 border-2 border-teal-300/28 rounded-full animate-float" style={{animationDelay: '2s', animationDuration: '7.5s'}}></div>
        <div className="absolute top-2/5 right-3/5 w-16 h-16 border border-sky-300/35 rounded-full animate-float" style={{animationDelay: '0.3s', animationDuration: '6s'}}></div>
        <div className="absolute bottom-2/5 left-3/5 w-20 h-20 border border-cyan-300/33 rounded-full animate-float" style={{animationDelay: '1.2s', animationDuration: '6.8s'}}></div>
        <div className="absolute top-3/5 left-1/7 w-24 h-24 border-2 border-teal-300/30 rounded-full animate-float" style={{animationDelay: '0.6s', animationDuration: '5.3s'}}></div>
        <div className="absolute bottom-3/5 right-1/7 w-18 h-18 border border-sky-300/36 rounded-full animate-float" style={{animationDelay: '1.8s', animationDuration: '6.2s'}}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 animate-smooth-reveal">
            <div className="inline-block mb-4 animate-fade-in-up-soft">
              <span className="text-sm font-bold uppercase tracking-wider text-sky-600 bg-sky-100 px-4 py-2 rounded-full">
                {t('landing.screenshots.badge')}
              </span>
            </div>
            <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-black mb-6 animate-smooth-reveal animation-delay-100 ${isMyanmar ? 'leading-relaxed' : ''}`}>
              <span className="block text-gray-900">{t('landing.screenshots.title1')}</span>
              <span className={`relative inline-block ${isMyanmar ? 'mt-4' : 'mt-2'}`}>
                <span className="absolute inset-0 bg-linear-to-r from-sky-600 to-cyan-600 blur-2xl opacity-20"></span>
                <span className={`relative bg-linear-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent ${isMyanmar ? 'inline-block py-1' : ''}`}>
                  {t('landing.screenshots.title2')}
                </span>
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('landing.screenshots.description')}
            </p>
          </div>

          {/* Rotating Carousel */}
          <div className="relative max-w-5xl mx-auto">
            <div className="relative h-125 sm:h-150 flex items-center justify-center">
              
              {/* Dashboard View */}
              <div className="absolute inset-0 flex items-center justify-center animate-carousel-1 transition-all duration-700">
                <div className="relative group max-w-4xl w-full">
                  <div className="absolute -inset-1 bg-linear-to-r from-sky-600 via-cyan-600 to-teal-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-50 transition-all duration-700"></div>
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-sky-900/20 border-8 border-gray-100 bg-white group-hover:shadow-sky-900/50 transition-all duration-700 group-hover:scale-[1.02]">
                    <div className="aspect-16/10 bg-linear-to-br from-sky-50 via-cyan-50 to-teal-50 p-8">
                      {/* Mock Dashboard UI */}
                      <div className="h-full flex flex-col gap-4">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-sky-500 to-cyan-500 flex items-center justify-center">
                              <LayoutDashboard className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <div className="h-3 w-24 bg-gray-800 rounded"></div>
                              <div className="h-2 w-16 bg-gray-400 rounded mt-1"></div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <div className="h-8 w-20 bg-sky-200 rounded-lg"></div>
                            <div className="h-8 w-20 bg-cyan-200 rounded-lg"></div>
                          </div>
                        </div>
                        
                        {/* Stats Cards */}
                        <div className="grid grid-cols-4 gap-3">
                          <div className="bg-white rounded-xl p-3 shadow-md border border-sky-100">
                            <div className="h-2 w-12 bg-gray-300 rounded mb-2"></div>
                            <div className="h-4 w-16 bg-sky-600 rounded"></div>
                          </div>
                          <div className="bg-white rounded-xl p-3 shadow-md border border-cyan-100">
                            <div className="h-2 w-12 bg-gray-300 rounded mb-2"></div>
                            <div className="h-4 w-16 bg-cyan-600 rounded"></div>
                          </div>
                          <div className="bg-white rounded-xl p-3 shadow-md border border-teal-100">
                            <div className="h-2 w-12 bg-gray-300 rounded mb-2"></div>
                            <div className="h-4 w-16 bg-teal-600 rounded"></div>
                          </div>
                          <div className="bg-white rounded-xl p-3 shadow-md border border-emerald-100">
                            <div className="h-2 w-12 bg-gray-300 rounded mb-2"></div>
                            <div className="h-4 w-16 bg-emerald-600 rounded"></div>
                          </div>
                        </div>
                        
                        {/* Chart Area */}
                        <div className="flex-1 bg-white rounded-xl p-4 shadow-md border border-sky-100">
                          <div className="h-3 w-32 bg-gray-700 rounded mb-3"></div>
                          <div className="h-full flex items-end justify-around gap-2">
                            <div className="w-full bg-linear-to-t from-sky-500 to-sky-300 rounded-t" style={{height: '60%'}}></div>
                            <div className="w-full bg-linear-to-t from-cyan-500 to-cyan-300 rounded-t" style={{height: '80%'}}></div>
                            <div className="w-full bg-linear-to-t from-teal-500 to-teal-300 rounded-t" style={{height: '45%'}}></div>
                            <div className="w-full bg-linear-to-t from-emerald-500 to-emerald-300 rounded-t" style={{height: '70%'}}></div>
                            <div className="w-full bg-linear-to-t from-sky-500 to-sky-300 rounded-t" style={{height: '55%'}}></div>
                            <div className="w-full bg-linear-to-t from-cyan-500 to-cyan-300 rounded-t" style={{height: '90%'}}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table View */}
              <div className="absolute inset-0 flex items-center justify-center animate-carousel-2 transition-all duration-700">
                <div className="relative group max-w-4xl w-full">
                  <div className="absolute -inset-1 bg-linear-to-r from-cyan-600 via-teal-600 to-emerald-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-50 transition-all duration-700"></div>
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-cyan-900/20 border-8 border-gray-100 bg-white group-hover:shadow-cyan-900/50 transition-all duration-700 group-hover:scale-[1.02]">
                    <div className="aspect-16/10 bg-linear-to-br from-cyan-50 via-teal-50 to-emerald-50 p-8">
                      {/* Mock Table UI */}
                      <div className="h-full flex flex-col gap-4">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                              <TableIcon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <div className="h-3 w-32 bg-gray-800 rounded"></div>
                              <div className="h-2 w-20 bg-gray-400 rounded mt-1"></div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <div className="h-8 w-16 bg-cyan-200 rounded-lg"></div>
                            <div className="h-8 w-16 bg-teal-200 rounded-lg"></div>
                          </div>
                        </div>
                        
                        {/* Table */}
                        <div className="flex-1 bg-white rounded-xl shadow-md border border-cyan-100 overflow-hidden">
                          {/* Table Header */}
                          <div className="grid grid-cols-5 gap-3 bg-linear-to-r from-cyan-100 to-teal-100 p-3 border-b border-cyan-200">
                            <div className="h-2.5 w-12 bg-cyan-700 rounded"></div>
                            <div className="h-2.5 w-16 bg-cyan-700 rounded"></div>
                            <div className="h-2.5 w-14 bg-cyan-700 rounded"></div>
                            <div className="h-2.5 w-12 bg-cyan-700 rounded"></div>
                            <div className="h-2.5 w-10 bg-cyan-700 rounded"></div>
                          </div>
                          
                          {/* Table Rows */}
                          {[1, 2, 3, 4, 5, 6].map((_, i) => (
                            <div key={i} className="grid grid-cols-5 gap-3 p-3 border-b border-gray-100 hover:bg-cyan-50/30 transition-colors">
                              <div className="h-2 w-16 bg-gray-600 rounded"></div>
                              <div className="h-2 w-20 bg-gray-400 rounded"></div>
                              <div className="h-2 w-12 bg-gray-400 rounded"></div>
                              <div className={`h-2 w-14 rounded ${i % 2 === 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                              <div className="h-2 w-8 bg-gray-300 rounded"></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile View */}
              <div className="absolute inset-0 flex items-center justify-center animate-carousel-3 transition-all duration-700">
                <div className="relative group max-w-sm w-full">
                  <div className="absolute -inset-1 bg-linear-to-r from-teal-600 via-emerald-600 to-sky-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-50 transition-all duration-700"></div>
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-teal-900/20 border-8 border-gray-100 bg-white group-hover:shadow-teal-900/50 transition-all duration-700 group-hover:scale-[1.02]">
                    <div className="aspect-9/16 bg-linear-to-br from-teal-50 via-emerald-50 to-cyan-50 p-6">
                      {/* Mock Mobile UI */}
                      <div className="h-full flex flex-col gap-3">
                        {/* Mobile Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                              <Smartphone className="h-4 w-4 text-white" />
                            </div>
                            <div className="h-3 w-20 bg-gray-800 rounded"></div>
                          </div>
                          <div className="h-6 w-6 rounded-full bg-teal-200"></div>
                        </div>
                        
                        {/* Balance Card */}
                        <div className="bg-linear-to-br from-teal-500 to-emerald-500 rounded-2xl p-4 text-white shadow-lg">
                          <div className="h-2 w-16 bg-white/60 rounded mb-2"></div>
                          <div className="h-5 w-28 bg-white rounded mb-3"></div>
                          <div className="flex gap-2">
                            <div className="h-6 w-16 bg-white/30 rounded-lg"></div>
                            <div className="h-6 w-16 bg-white/30 rounded-lg"></div>
                          </div>
                        </div>
                        
                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white rounded-xl p-3 shadow border border-teal-100">
                            <div className="h-2 w-10 bg-gray-300 rounded mb-2"></div>
                            <div className="h-3 w-14 bg-emerald-600 rounded"></div>
                          </div>
                          <div className="bg-white rounded-xl p-3 shadow border border-emerald-100">
                            <div className="h-2 w-10 bg-gray-300 rounded mb-2"></div>
                            <div className="h-3 w-14 bg-teal-600 rounded"></div>
                          </div>
                        </div>
                        
                        {/* Recent Transactions */}
                        <div className="flex-1 bg-white rounded-xl p-3 shadow border border-teal-100">
                          <div className="h-2.5 w-24 bg-gray-700 rounded mb-3"></div>
                          <div className="space-y-2">
                            {[1, 2, 3, 4].map((_, i) => (
                              <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <div className={`w-8 h-8 rounded-full ${i % 2 === 0 ? 'bg-teal-100' : 'bg-emerald-100'}`}></div>
                                  <div>
                                    <div className="h-2 w-16 bg-gray-600 rounded mb-1"></div>
                                    <div className="h-1.5 w-12 bg-gray-300 rounded"></div>
                                  </div>
                                </div>
                                <div className={`h-2.5 w-12 rounded ${i % 2 === 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Bottom Navigation */}
                        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-gray-200">
                          {[1, 2, 3, 4].map((_, i) => (
                            <div key={i} className={`h-8 rounded-lg ${i === 0 ? 'bg-teal-500' : 'bg-gray-200'}`}></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Carousel Indicators */}
            <div className="flex justify-center gap-3 mt-12 animate-in fade-in duration-1000 delay-300">
              <Button
                variant="outline"
                className="flex items-center gap-2 px-4 py-2 h-auto rounded-full bg-sky-100 border border-sky-200 hover:bg-sky-200 hover:scale-110 transition-all duration-300 text-sky-700 hover:text-sky-800"
              >
                <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></div>
                <span className="text-sm font-semibold">{t('landing.screenshots.dashboard')}</span>
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2 px-4 py-2 h-auto rounded-full bg-cyan-100 border border-cyan-200 hover:bg-cyan-200 hover:scale-110 transition-all duration-300 text-cyan-700 hover:text-cyan-800"
              >
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" style={{animationDelay: '0.3s'}}></div>
                <span className="text-sm font-semibold">{t('landing.screenshots.tablet')}</span>
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2 px-4 py-2 h-auto rounded-full bg-teal-100 border border-teal-200 hover:bg-teal-200 hover:scale-110 transition-all duration-300 text-teal-700 hover:text-teal-800"
              >
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" style={{animationDelay: '0.6s'}}></div>
                <span className="text-sm font-semibold">{t('landing.screenshots.mobile')}</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32 relative overflow-hidden bg-white">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-linear-to-r from-sky-300 via-cyan-300 to-teal-300 rounded-full blur-3xl opacity-10 animate-pulse"></div>
        </div>
        
        {/* Particle effects - small floating dots */}
        <div className="absolute top-20 left-1/4 w-2 h-2 bg-sky-400 rounded-full animate-float opacity-60"></div>
        <div className="absolute top-40 right-1/4 w-3 h-3 bg-cyan-400 rounded-full animate-float opacity-40" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-40 left-1/3 w-2 h-2 bg-teal-400 rounded-full animate-float opacity-50" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 right-1/3 w-3 h-3 bg-sky-500 rounded-full animate-float opacity-30" style={{animationDelay: '1.5s'}}></div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-6 animate-fade-in-up-soft">
            <span className="text-sm font-bold uppercase tracking-wider text-sky-600 bg-sky-100 px-4 py-2 rounded-full">
              {t('landing.cta.badge')}
            </span>
          </div>
          
          <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-black mb-8 animate-smooth-reveal animation-delay-100 ${isMyanmar ? 'leading-relaxed' : ''}`}>
            <span className={`block text-gray-900 ${isMyanmar ? 'mb-4' : 'mb-2'}`}>{t('landing.cta.title1')}</span>
            <span className="relative inline-block">
              <span className="absolute inset-0 bg-linear-to-r from-sky-600 to-cyan-600 blur-3xl opacity-30"></span>
              <span className={`relative bg-linear-to-r from-sky-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent ${isMyanmar ? 'inline-block py-1' : ''}`}>
                {t('landing.cta.title2')}
              </span>
            </span>
          </h2>
          
          <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up-soft animation-delay-200">
            {t('landing.cta.description')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-smooth-reveal animation-delay-300">
            <Button 
              size="lg"
              onClick={() => navigate("/signup")}
              className="relative overflow-hidden bg-linear-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-xl px-12 h-16 shadow-2xl shadow-sky-500/40 hover:shadow-sky-500/60 hover:scale-110 transition-all text-white font-bold group"
            >
              <span className="relative z-10 flex items-center gap-3">
                {t('landing.cta.button')}
                <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/30 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </Button>
          </div>
          
          <p className="mt-8 text-sm text-gray-500 animate-fade-in-up-soft animation-delay-500">
            {t('landing.cta.terms')}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-linear-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1 animate-in fade-in slide-in-from-bottom duration-500">
              <div className="flex items-center gap-3 mb-4 group">
                <div className="relative animate-bounce-subtle">
                  <div className="absolute inset-0 bg-linear-to-br from-sky-400 to-cyan-500 rounded-xl blur-md opacity-60 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                  <div className="relative h-10 w-10 rounded-xl bg-linear-to-br from-sky-500 to-cyan-500 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all">
                    <Wallet className="h-5 w-5 text-white animate-float" />
                  </div>
                </div>
                <span className="text-xl font-bold bg-linear-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform">ExpenseTracker</span>
              </div>
              <p className="text-gray-600 leading-relaxed mb-6">
                {t('landing.footer.tagline')}
              </p>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-sky-100 hover:bg-sky-200 flex items-center justify-center cursor-pointer transition-all hover:scale-110">
                  <Globe className="h-5 w-5 text-sky-600" />
                </div>
              </div>
            </div>
            
            <div className="animate-in fade-in slide-in-from-bottom duration-500 delay-100">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">{t('landing.footer.product')}</h3>
              <ul className="space-y-3">
                <li className="text-gray-600 hover:text-sky-600 cursor-pointer transition-all hover:translate-x-1 hover:scale-105 duration-200">{t('landing.footer.features')}</li>
                <li className="text-gray-600 hover:text-sky-600 cursor-pointer transition-all hover:translate-x-1 hover:scale-105 duration-200">{t('landing.footer.pricing')}</li>
                <li className="text-gray-600 hover:text-sky-600 cursor-pointer transition-all hover:translate-x-1 hover:scale-105 duration-200">{t('landing.footer.security')}</li>
                <li className="text-gray-600 hover:text-sky-600 cursor-pointer transition-all hover:translate-x-1 hover:scale-105 duration-200">{t('landing.footer.updates')}</li>
              </ul>
            </div>
            
            <div className="animate-in fade-in slide-in-from-bottom duration-500 delay-200">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">{t('landing.footer.company')}</h3>
              <ul className="space-y-3">
                <li className="text-gray-600 hover:text-sky-600 cursor-pointer transition-all hover:translate-x-1 hover:scale-105 duration-200">{t('landing.footer.about')}</li>
                <li className="text-gray-600 hover:text-sky-600 cursor-pointer transition-all hover:translate-x-1 hover:scale-105 duration-200">{t('landing.footer.blog')}</li>
                <li className="text-gray-600 hover:text-sky-600 cursor-pointer transition-all hover:translate-x-1 hover:scale-105 duration-200">{t('landing.footer.careers')}</li>
                <li className="text-gray-600 hover:text-sky-600 cursor-pointer transition-all hover:translate-x-1 hover:scale-105 duration-200">{t('landing.footer.contact')}</li>
              </ul>
            </div>
            
            <div className="animate-in fade-in slide-in-from-bottom duration-500 delay-300">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">{t('landing.footer.legal')}</h3>
              <ul className="space-y-3">
                <li className="text-gray-600 hover:text-sky-600 cursor-pointer transition-all hover:translate-x-1 hover:scale-105 duration-200">{t('landing.footer.privacy')}</li>
                <li className="text-gray-600 hover:text-sky-600 cursor-pointer transition-all hover:translate-x-1 hover:scale-105 duration-200">{t('landing.footer.terms')}</li>
                <li className="text-gray-600 hover:text-sky-600 cursor-pointer transition-all hover:translate-x-1 hover:scale-105 duration-200">{t('landing.footer.cookiePolicy')}</li>
                <li className="text-gray-600 hover:text-sky-600 cursor-pointer transition-all hover:translate-x-1 hover:scale-105 duration-200">{t('landing.footer.licenses')}</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-8 animate-in fade-in duration-700 delay-400">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-600 text-sm">
                {t('landing.footer.copyright')}
              </p>
              <p className="text-gray-600 text-sm">
                {t('landing.footer.madeWith')}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
