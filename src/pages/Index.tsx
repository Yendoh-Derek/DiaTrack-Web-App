
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const tips = [
  {
    title: 'Balanced Plate Method',
    text: 'Fill half your plate with non‑starchy vegetables, a quarter with lean protein, and a quarter with whole grains.',
  },
  {
    title: 'Consistent Carbs',
    text: 'Spread carbohydrate intake across meals and snacks to reduce glucose spikes.',
  },
  {
    title: 'Move Every Day',
    text: 'Aim for 150+ minutes of moderate activity weekly; add resistance training 2–3 times/week.',
  },
  {
    title: 'Hydrate Smart',
    text: 'Prefer water or unsweetened beverages. Limit sugary drinks and fruit juices.',
  },
  {
    title: 'Sleep & Stress',
    text: '7–9 hours sleep and stress management help insulin sensitivity and appetite control.',
  },
  {
    title: 'Monitor & Record',
    text: 'Track blood glucose, HbA1c, activity, and meals to spot patterns and adjust early.',
  },
];

const Index = () => {
  const { currentUser, clinician, loading } = useAuth();

  return (
    <div className="min-h-screen bg-diabetesSense-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-diabetesSense-accent flex items-center justify-center">
                <span className="text-2xl font-bold text-white">DT</span>
              </div>
              <h1 className="text-2xl font-bold text-white">DiaTrack</h1>
            </div>
            <div className="flex items-center space-x-4">
              {currentUser ? (
                <div className="flex items-center space-x-4">
                  <span className="text-white">Welcome, {clinician?.display_name || currentUser.email}</span>
                  <Link to="/dashboard">
                    <Button className="bg-diabetesSense-accent hover:bg-diabetesSense-accent/90">
                      Go to Dashboard
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/login">
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button className="bg-diabetesSense-accent hover:bg-diabetesSense-accent/90">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Evidence‑based diabetes management, powered by AI
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            Assess risk, track patients, and coach smarter with actionable insights.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to={currentUser ? '/assessment' : '/login'}>
              <Button size="lg" className="bg-diabetesSense-accent hover:bg-diabetesSense-accent/90 px-8 py-6">
                Start an Assessment
              </Button>
            </Link>
            <Link to={currentUser ? '/patients' : '/login'}>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 py-6">
                View Patients
              </Button>
            </Link>
          </div>
        </div>

        {/* Floating cards */}
        <div className="pointer-events-none absolute inset-0 -z-0">
          <div className="absolute inset-0 animate-pulse-slow opacity-30 bg-[radial-gradient(circle_at_center,_rgba(47,128,237,0.15),_transparent_50%)]"></div>
        </div>
      </section>

      {/* Tips grid with floating animation */}
      <section className="relative pb-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tips.map((tip, idx) => (
              <div
                key={tip.title}
                className={`relative group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 overflow-hidden transition-transform duration-500 will-change-transform hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.25)] ${
                  idx % 3 === 0 ? 'animate-float-a' : idx % 3 === 1 ? 'animate-float-b' : 'animate-float-c'
                }`}
                style={{ animationDelay: `${(idx % 3) * 0.4}s` }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-diabetesSense-accent/10 to-transparent" />
                <h3 className="text-xl font-semibold text-white mb-2">{tip.title}</h3>
                <p className="text-gray-300 leading-relaxed">{tip.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Keyframes */}
      <style>{`
        @keyframes floatA { 0% { transform: translateY(0px) } 50% { transform: translateY(-6px) } 100% { transform: translateY(0px) } }
        @keyframes floatB { 0% { transform: translateY(0px) } 50% { transform: translateY(-10px) } 100% { transform: translateY(0px) } }
        @keyframes floatC { 0% { transform: translateY(0px) } 50% { transform: translateY(-8px) } 100% { transform: translateY(0px) } }
        .animate-float-a { animation: floatA 6s ease-in-out infinite; }
        .animate-float-b { animation: floatB 7s ease-in-out infinite; }
        .animate-float-c { animation: floatC 8s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse 8s ease-in-out infinite; }
        @keyframes pulse { 0%, 100% { opacity: .2 } 50% { opacity: .45 } }
      `}</style>
    </div>
  );
};

export default Index;
