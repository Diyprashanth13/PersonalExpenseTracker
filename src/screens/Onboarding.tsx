
import React, { useState } from 'react';
import { ArrowRight, CloudOff, PieChart, ShieldCheck } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    title: "Track Smarter",
    description: "Easily log your income and expenses with just a few taps. Minimal and intuitive.",
    icon: <ShieldCheck className="w-20 h-20 text-emerald-500" />,
    color: "bg-emerald-50"
  },
  {
    title: "Deep Insights",
    description: "Visualize where your money goes with beautiful charts and monthly comparisons.",
    icon: <PieChart className="w-20 h-20 text-blue-500" />,
    color: "bg-blue-50"
  },
  {
    title: "Fully Offline",
    description: "Your data stays on your device. Works without internet, no syncing, total privacy.",
    icon: <CloudOff className="w-20 h-20 text-amber-500" />,
    color: "bg-amber-50"
  }
];

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const next = () => {
    if (currentSlide === slides.length - 1) {
      onComplete();
    } else {
      setCurrentSlide(s => s + 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center p-8 transition-colors duration-500">
      <div className={`w-32 h-32 rounded-3xl ${slides[currentSlide].color} flex items-center justify-center mb-12 transition-colors duration-500`}>
        {slides[currentSlide].icon}
      </div>
      
      <div className="text-center max-w-xs mb-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">{slides[currentSlide].title}</h1>
        <p className="text-slate-500 leading-relaxed">{slides[currentSlide].description}</p>
      </div>

      <div className="flex space-x-2 mb-12">
        {slides.map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === currentSlide ? 'w-8 bg-emerald-600' : 'w-2 bg-slate-200'
            }`}
          />
        ))}
      </div>

      <button 
        onClick={next}
        className="w-full max-w-xs bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-100 flex items-center justify-center space-x-2 hover:bg-emerald-700 active:scale-95 transition-all"
      >
        <span>{currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}</span>
        <ArrowRight size={20} />
      </button>
    </div>
  );
};
