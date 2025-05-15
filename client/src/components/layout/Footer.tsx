import React from 'react';
import { Link } from 'wouter';

const Footer: React.FC = () => {
  return (
    <footer className="bg-card text-muted-foreground py-8 px-6 md:px-8 mt-auto border-t border-primary">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
        
        {/* Why Orbit Blurb */}
        <div className="md:col-span-1 lg:col-span-2">
          <h3 className="text-lg font-semibold text-card-foreground mb-3">Why Orbit?</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Orbit is more than a productivity app; it's your partner in navigating the complexities of neurodivergent thinking. 
            We help you harness your unique strengths and find your flow, every day.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-base font-semibold text-card-foreground mb-3">Quick Links</h4>
          <ul className="space-y-2">
            <li><Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">Home</Link></li>
            <li><span className="text-sm text-muted-foreground opacity-60 cursor-not-allowed">Features (soon)</span></li>
            <li><span className="text-sm text-muted-foreground opacity-60 cursor-not-allowed">Pricing (soon)</span></li>
            <li><Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">Log In</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="text-base font-semibold text-card-foreground mb-3">Legal</h4>
          <ul className="space-y-2">
            <li><span className="text-sm text-muted-foreground opacity-60 cursor-not-allowed">Privacy Policy (soon)</span></li>
            <li><span className="text-sm text-muted-foreground opacity-60 cursor-not-allowed">Terms of Service (soon)</span></li>
          </ul>
        </div>

      </div>
      <div className="mt-10 pt-8 border-t border-border text-center">
        <p className="text-xs text-muted-foreground opacity-80">&copy; {new Date().getFullYear()} Orbit AI. All rights reserved. Built for minds that move differently.</p>
      </div>
    </footer>
  );
};

export default Footer;
