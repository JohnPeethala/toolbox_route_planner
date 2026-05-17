"use client";

import { useState, useEffect, ReactNode } from "react";

interface AuthGuardProps {
  children: ReactNode;
}

// Generate the SHA-256 hash
async function sha256(message: string) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    // Check localStorage on mount
    const authExp = localStorage.getItem("toolbox_auth_exp");
    if (authExp && Date.now() < parseInt(authExp, 10)) {
      setIsAuthenticated(true);
    }
    setIsChecking(false);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate today's expected hash
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    const yyyy = today.getFullYear();
    
    const salt = process.env.NEXT_PUBLIC_AUTH_SALT || 'fallbackSalt';
    const baseString = `${dd}${mm}${yyyy}${salt}`;
    const expectedHash = await sha256(baseString);

    if (inputValue.trim().toLowerCase() === expectedHash.toLowerCase()) {
      // Set expiration to 4 hours from now
      const expTime = Date.now() + 4 * 60 * 60 * 1000;
      localStorage.setItem("toolbox_auth_exp", expTime.toString());
      setIsAuthenticated(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 1000);
      setInputValue("");
    }
  };

  if (isChecking) {
    return <div className="h-screen w-screen bg-black flex items-center justify-center"></div>;
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="h-screen w-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 z-[99999] relative">
      {/* Subtle Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.07]" 
        style={{ backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`, backgroundSize: '40px 40px' }}
      />
      
      <div className="max-w-xs w-full relative z-10">
        <div className="flex flex-col items-center mb-8 text-gray-900">
          <div className="relative mb-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center rotate-3 shadow-lg bg-black text-white">
              <div className="rotate-[-3deg] flex flex-col items-center -gap-1">
                <span className="text-[14px] font-black leading-none uppercase">TB</span>
                <div className="w-5 h-[3px] mt-1 bg-white"></div>
              </div>
            </div>
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 bg-blue-500 border-white shadow-sm"></div>
          </div>
          <h1 className="text-xl font-black uppercase tracking-[0.2em] text-gray-900">The Toolbox</h1>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Authentication Required</p>
        </div>

        <form onSubmit={handleAuth} className="flex flex-col gap-4 bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-gray-200 shadow-xl">
          <input
            type="password"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="ENTER AUTHORIZATION HASH"
            className={`w-full bg-white border ${error ? 'border-red-500 ring-2 ring-red-500/20' : 'border-gray-200'} text-gray-900 text-center text-xs font-mono p-4 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-400`}
          />
          <button
            type="submit"
            className="w-full bg-black text-white font-black text-xs uppercase tracking-widest p-4 rounded-xl hover:bg-gray-800 transition-colors shadow-md"
          >
            Authorize Access
          </button>
        </form>
      </div>
    </div>
  );
}
