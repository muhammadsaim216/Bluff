import React, { useState } from "react";
import { useAuth } from "../AuthContext";

interface AuthGateProps {
  onClose?: () => void;
}

export const AuthGate: React.FC<AuthGateProps> = ({ onClose }) => {
  const { signIn, signInWithEmail, signUpWithEmail, isLoggingIn } = useAuth();
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    if (!email || !password || (isSignUp && !name)) {
      setErrorMsg("All fields are strictly required for underworld clearance.");
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, name);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      console.error("Authentication action failed:", err);
      let descriptiveError = err.message || "An unexpected error occurred.";
      
      // Look for operation-not-allowed to guide the developer/user
      if (err.code === "auth/operation-not-allowed") {
        descriptiveError = "Email/Password authentication provider is currently disabled in search settings. Click 'Sign In with Google' below for instant access, or enable Email/Password under your Firebase Console Build > Authentication tab.";
      } else if (err.code === "auth/email-already-in-use") {
        descriptiveError = "This email is already registered in the Shadow list. Please choose Log In instead.";
      } else if (err.code === "auth/weak-password") {
        descriptiveError = "Your clearance password must be at least 6 characters long.";
      } else if (err.code === "auth/invalid-email") {
        descriptiveError = "The provided email format is invalid.";
      } else if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        descriptiveError = "Invalid clearance credentials. Double check your email and password.";
      }
      
      setErrorMsg(descriptiveError);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    try {
      await signIn();
    } catch (err: any) {
      setErrorMsg(err.message || "Google Authentication failed.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050c0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,_#122a22,_#050c0a)] text-[#d7e6df] p-4 overflow-y-auto font-sans">
      
      {/* Decorative floating grids and background indicators */}
      <div className="absolute top-8 left-8 text-left opacity-15 hidden md:block">
        <p className="font-mono text-[9px] uppercase tracking-widest text-secondary font-black">IDENTITY CONTROL TERMINAL</p>
        <p className="font-mono text-[8px] text-zinc-500 mt-1">STATUS: LOCKED_WAITING_AUTH</p>
      </div>

      <div className="absolute bottom-8 right-8 text-right opacity-15 hidden md:block">
        <p className="font-mono text-[9px] uppercase tracking-widest text-[#8b928f]">CLEARANCE REQUIRED</p>
        <p className="font-mono text-[8px] text-zinc-500 mt-1">PORT: 3000 // INGRESS_SECURE</p>
      </div>

      <div className="w-full max-w-md bg-[#0a1411] border border-secondary/15 rounded-2xl shadow-3xl overflow-hidden relative p-8 sm:p-10 my-8">
        
        {onClose && (
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-[#8b928f] hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/5 cursor-pointer z-50 text-xs flex items-center justify-center border border-zinc-800"
            title="Cancel and continue as guest"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        )}

        {/* Soft gold backdrop blur glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-secondary/5 blur-[50px] pointer-events-none" />

        {/* Shadow Underground Icon */}
        <div className="flex flex-col items-center text-center mb-8 relative z-10">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-[#af8d11] flex items-center justify-center font-headline font-black text-[#241a00] text-2xl tracking-tighter shadow-[0_0_20px_rgba(233,195,73,0.25)] mb-3">
            B
          </div>
          <h2 className="font-headline font-black text-2xl text-white tracking-widest leading-none uppercase">
            BLUFF UNDERGROUND
          </h2>
          <span className="text-[10px] uppercase tracking-[0.25em] text-secondary font-black flex items-center gap-1.5 mt-2 select-none">
            <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse"></span> Identity Clearance Gate
          </span>
        </div>

        {/* Dynamic header message */}
        <p className="text-zinc-400 text-xs text-center leading-relaxed mb-6 max-w-xs mx-auto">
          {isSignUp 
            ? "Create your unique code-name identity to claim your welcome stashes and enter the high-stakes tables."
            : "Sign in with your registered clearance to sync your chip bank, unlocked card decks, and reputation XP."
          }
        </p>

        {errorMsg && (
          <div className="bg-red-950/45 border border-red-800/40 text-red-300 rounded-lg p-3.5 mb-6 text-xs leading-relaxed font-medium animate-fade-in text-left">
            <div className="flex gap-2 items-start">
              <span className="material-symbols-outlined text-sm shrink-0 text-red-400 mt-0.5">warning</span>
              <div>
                <p className="font-bold uppercase text-[9px] tracking-wider mb-0.5 text-red-200">Clearance Declined</p>
                <p className="text-[#fca5a5]">{errorMsg}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1.5">
              <label htmlFor="agent_name" className="block text-[10px] font-bold text-[#8b928f] uppercase tracking-wider">
                Agent Pseudonym / Full Name
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-lg">person</span>
                <input
                  id="agent_name"
                  type="text"
                  placeholder="Anonymous Deceiver"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#111f1a] border border-zinc-800 text-white rounded-lg pl-11 pr-4 py-3 text-xs placeholder:text-zinc-600 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20 transition-all font-medium"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="agent_email" className="block text-[10px] font-bold text-[#8b928f] uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-lg">mail</span>
              <input
                id="agent_email"
                type="email"
                placeholder="agent@underground.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#111f1a] border border-zinc-800 text-white rounded-lg pl-11 pr-4 py-3 text-xs placeholder:text-zinc-600 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="agent_password" className="block text-[10px] font-bold text-[#8b928f] uppercase tracking-wider">
              Clearance Password
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-lg">lock</span>
              <input
                id="agent_password"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#111f1a] border border-zinc-800 text-white rounded-lg pl-11 pr-4 py-3 text-xs placeholder:text-zinc-600 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20 transition-all font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || isLoggingIn}
            className="w-full bg-gradient-to-r from-secondary to-[#af8d11] text-[#241a00] font-headline font-black py-3.5 px-4 rounded-xl text-xs uppercase tracking-widest shadow-lg hover:brightness-115 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            {loading || isLoggingIn ? (
              <>
                <span className="w-4 h-4 border-2 border-[#241a00] border-t-transparent rounded-full animate-spin"></span>
                <span>Issuing Token...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm font-black">shield_person</span>
                <span>{isSignUp ? "Create Sign Up" : "Authorize Login"}</span>
              </>
            )}
          </button>
        </form>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-zinc-800/60"></div>
          <span className="flex-shrink mx-4 text-[9px] text-zinc-500 font-bold uppercase tracking-widest leading-none">OR SECURE INSTANT SIGN IN</span>
          <div className="flex-grow border-t border-zinc-800/60"></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading || isLoggingIn}
          className="w-full bg-[#12221d]/40 hover:bg-[#12221d] border border-secondary/20 text-white font-semibold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-3 active:scale-[0.98] duration-150 cursor-pointer"
        >
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="Google Shield logo" 
            className="w-4 h-4"
          />
          <span>Sign In with Google</span>
        </button>

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg(null);
            }}
            className="text-xs text-[#8b928f] hover:text-secondary font-bold transition-colors cursor-pointer"
          >
            {isSignUp 
              ? "Already initiated? Choose clearance Log In" 
              : "New recruit? Claim welcome bonus by Signing Up"
            }
          </button>
        </div>

      </div>
    </div>
  );
};
