import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/UI';

const LandingPage = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-indigo-50 to-white -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center">
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
            Build Better Forms <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">Faster than ever.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-slate-600 mb-10 leading-relaxed">
            Create beautiful, mobile-friendly forms in seconds. Collect responses, analyze data with AI, and export to Excel with one click.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="w-full sm:w-auto h-14 px-10 text-lg">Get Started for Free</Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto h-14 px-10 text-lg">Sign In</Button>
            </Link>
          </div>
        </div>

        <div className="mt-24 grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'Drag-and-Drop Builder',
              desc: 'Intuitively design your forms with a variety of question types and real-time preview.',
              icon: '🏗️'
            },
            {
              title: 'Rich Analytics',
              desc: 'Visual insights into your responses with charts and spreadsheet-style views.',
              icon: '📊'
            },
            {
              title: 'AI Assisted',
              desc: 'Use Gemini AI to generate question sets and form descriptions instantly.',
              icon: '✨'
            }
          ].map((feature, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
