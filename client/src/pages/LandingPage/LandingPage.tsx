import React from 'react';
import { Link } from 'wouter';


const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-4 sm:p-6 md:p-8 text-center bg-neutral-900 text-neutral-200">
      <h1 className="text-5xl font-bold mb-4 text-white max-w-3xl lg:text-6xl">Orbit: Your Personal Momentum Engine for a Neurodivergent World.</h1>
      <p className="text-xl mb-8 sm:mb-10 max-w-2xl leading-relaxed text-neutral-400 lg:text-2xl lg:max-w-3xl">
        An emotionally intelligent productivity system designed to adapt to <em>your</em> flow, 
        not the other way around. Harness your nonlinear thinking, manage energy, 
        and achieve your goals with intuitive, AI-powered support.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-4">
        <Link 
          href="/signup" 
          className="py-3 px-8 text-lg font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200 ease-in-out no-underline"
        >
          Get Started (Sign Up)
        </Link>
        <Link 
          href="/login" 
          className="py-3 px-8 text-lg font-semibold rounded-lg border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white hover:shadow-md transform hover:scale-105 transition-all duration-200 ease-in-out no-underline"
        >
          Log In
        </Link>
      </div>
      {/* Placeholder for future sections like features, testimonials, etc. */}
      {/* <div style={{ marginTop: '4rem', color: '#555' }}>
        [Feature Highlights / Image Carousel Placeholder]
      </div> */}

      {/* Feature Highlight Section */}
      <section className="w-full max-w-5xl mt-12 sm:mt-16 lg:mt-20 py-10 sm:py-12 lg:py-16">
        <h2 className="text-3xl lg:text-4xl font-bold text-center text-white mb-8 sm:mb-10 lg:mb-12">Why Orbit Works With You, Not Against You</h2>
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 text-left">
          {/* Feature 1 */}
          <div className="bg-neutral-800 p-4 sm:p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-4 text-purple-400">[Cycle Icon]</div> {/* Icon Placeholder */}
            <h3 className="text-xl font-semibold text-white mb-3">Adaptive Workflows</h3>
            <p className="text-neutral-400 leading-relaxed">
              Orbit learns your unique rhythms and energy patterns, suggesting tasks and flows that align with your current state.
            </p>
          </div>
          {/* Feature 2 */}
          <div className="bg-neutral-800 p-4 sm:p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-4 text-teal-400">[Heart/Brain Icon]</div> {/* Icon Placeholder */}
            <h3 className="text-xl font-semibold text-white mb-3">Emotional Intelligence</h3>
            <p className="text-neutral-400 leading-relaxed">
              Gentle nudges, empathetic feedback, and mood tracking help you navigate your day with self-awareness and compassion.
            </p>
          </div>
          {/* Feature 3 */}
          <div className="bg-neutral-800 p-4 sm:p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-4 text-blue-400">[Focus Icon]</div> {/* Icon Placeholder */}
            <h3 className="text-xl font-semibold text-white mb-3">Unlock Your Focus</h3>
            <p className="text-neutral-400 leading-relaxed">
              Minimize distractions and cultivate deep work sessions with tools designed to protect your flow and creative energy.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
