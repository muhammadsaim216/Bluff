import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface BuyChipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (amount: number) => void;
}

type CheckoutStep = 
  | "package-selection" 
  | "gateway-selection" 
  | "credential-entry" 
  | "processing-simulation" 
  | "success-receipt"
  | "error-refund";

interface ChipPkg {
  name: string;
  chips: number;
  pricePKR: number;
  desc: string;
  isPopular?: boolean;
}

export const BuyChipsModal: React.FC<BuyChipsModalProps> = ({ isOpen, onClose, onPurchase }) => {
  const [step, setStep] = useState<CheckoutStep>("package-selection");
  const [selectedPkg, setSelectedPkg] = useState<ChipPkg | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"jazzcash" | "easypaisa">("jazzcash");
  
  // Wallet Entry Fields
  const [phoneNumber, setPhoneNumber] = useState<string>("03");
  const [cnicDigits, setCnicDigits] = useState<string>("");
  const [emailAddress, setEmailAddress] = useState<string>("");
  const [errorText, setErrorText] = useState<string>("");

  // Sandbox & Simulation Settings
  const [sandboxResponseMode, setSandboxResponseMode] = useState<"SUCCESS" | "INSUFFICIENT_FUNDS" | "TIMEOUT" | "BLOCKED_SIM">("SUCCESS");
  const [countdown, setCountdown] = useState<number>(45);
  const [currentProcessPhase, setCurrentProcessPhase] = useState<number>(0);
  const [mpinInput, setMpinInput] = useState<string>("");
  const [receiptTxnId, setReceiptTxnId] = useState<string>("");

  // Clean state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep("package-selection");
      setSelectedPkg(null);
      setPhoneNumber("03");
      setCnicDigits("");
      setEmailAddress("");
      setErrorText("");
      setMpinInput("");
    }
  }, [isOpen]);

  // Handle countdown Timer on confirmation screen
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "processing-simulation" && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((p) => p - 1);
        
        // Dynamically increment processing phase text
        if (countdown === 40) setCurrentProcessPhase(1); // Routing to Gateway
        if (countdown === 35) setCurrentProcessPhase(2); // Validating active account
        if (countdown === 31) setCurrentProcessPhase(3); // Pushing Pin Challenge
        if (countdown === 22) setCurrentProcessPhase(4); // Awaiting User PIN Entry
      }, 1000);
    } else if (step === "processing-simulation" && countdown === 0) {
      handleFinalizeSimulation();
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  const packages: ChipPkg[] = [
    { name: "Bronze Stash", chips: 15000, pricePKR: 1200, desc: "Starter underground bankroll" },
    { name: "Gold Vault Case", chips: 75000, pricePKR: 4500, desc: "Recommended Velvet shadow stack", isPopular: true },
    { name: "Legendary Briefcase", chips: 250000, pricePKR: 12000, desc: "Max roll for high stakes table dominance" }
  ];

  const handleSelectPackage = (pkg: ChipPkg) => {
    setSelectedPkg(pkg);
    setStep("gateway-selection");
  };

  const handleSelectGateway = (method: "jazzcash" | "easypaisa") => {
    setPaymentMethod(method);
    setStep("credential-entry");
  };

  // Basic Pakistani Phone Number & CNIC validations
  const handleProceedVerification = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText("");

    const phoneRegex = /^03\d{9}$/;
    if (!phoneRegex.test(phoneNumber.trim())) {
      setErrorText("Provide a valid 11-digit Pakistani phone number (e.g., 03001234567)");
      return;
    }

    if (cnicDigits.trim().length !== 6 || isNaN(Number(cnicDigits))) {
      setErrorText("Provide exactly the last 6 digits of your CNIC for secure ledger logging.");
      return;
    }

    // Trigger simulation screen countdown and process status
    setCountdown(45);
    setCurrentProcessPhase(0);
    setStep("processing-simulation");
  };

  const handleFinalizeSimulation = () => {
    if (sandboxResponseMode === "SUCCESS") {
      // Generate authentic Pakistan post-payment Ref reference number
      const prefix = paymentMethod === "jazzcash" ? "JC" : "EP";
      const randomId = Math.floor(100000 + Math.random() * 900000);
      const timestamp = Date.now().toString().slice(-6);
      setReceiptTxnId(`${prefix}-${randomId}-${timestamp}`);
      setStep("success-receipt");
    } else {
      setStep("error-refund");
    }
  };

  const handleCompletePaymentAndRefill = () => {
    if (selectedPkg) {
      onPurchase(selectedPkg.chips);
    }
    onClose();
  };

  const processingPhases = [
    { label: "Dispatching handshake parameters...", sub: "Authenticating merchant credentials" },
    { label: "Interrogating Gateway Protocol Layer...", sub: `Establishing tunnel securely to ${paymentMethod === "jazzcash" ? "JazzCash" : "Easypaisa"}` },
    { label: "Validating Mobile Wallet Account...", sub: "Confirming limits & active subscriber registration status" },
    { label: "Pushing PIN prompt request to phone...", sub: `Merchant invoice of PKR ${(selectedPkg?.pricePKR ?? 0).toLocaleString()} issued` },
    { label: "Awaiting response from subscriber...", sub: "Please check your device for the instant pay pop-up" }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 leading-normal">
      <div 
        className="bg-surface-container border border-secondary/15 w-full max-w-lg rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Block with custom branding design */}
        <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>toll</span>
            <div>
              <h3 className="font-headline text-lg font-black text-white uppercase tracking-wider leading-none">Underground Ledger</h3>
              <p className="text-[9px] font-mono font-bold text-[#8b928f] uppercase tracking-widest mt-1">Cashier Gate v2.40 - PKR Wallets</p>
            </div>
          </div>
          {step !== "processing-simulation" && (
            <button 
              className="text-[#8b928f] hover:text-white transition-colors cursor-pointer w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center border border-white/[0.04]"
              onClick={onClose}
              aria-label="Close cashier panel"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          )}
        </div>

        {/* Dynamic Sandbox Indicator Panel */}
        {step !== "success-receipt" && (
          <div className="bg-[#1f1908] px-6 py-1.5 border-b border-[#e9c349]/15 flex items-center justify-between text-[10px] font-mono font-bold text-secondary">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping" />
              <span>DEVELOPER SANDBOX MODE ENABLED</span>
            </div>
            
            {step === "credential-entry" && (
              <div className="flex items-center gap-2">
                <span className="text-zinc-500">Test Outcome:</span>
                <select 
                  value={sandboxResponseMode}
                  onChange={(e) => setSandboxResponseMode(e.target.value as any)}
                  className="bg-black/40 text-secondary border border-secondary/20 rounded px-1 text-[9px] focus:outline-none cursor-pointer py-0.5"
                >
                  <option value="SUCCESS">Simulate Success</option>
                  <option value="INSUFFICIENT_FUNDS">Fail: Insufficient Stash</option>
                  <option value="TIMEOUT">Fail: Gateway Timeout</option>
                  <option value="BLOCKED_SIM">Fail: Blocked Wallet Account</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* Primary Scrollable Workspace Container */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Package Selection Screen */}
            {step === "package-selection" && (
              <motion.div
                key="step-selection"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="text-left mb-5">
                  <h4 className="text-white font-headline text-base font-black uppercase tracking-wider">Select Refill Grade</h4>
                  <p className="text-xs text-[#8b928f]">Acquire chips securely via instant Mobile Wallet transfers inside Pakistan.</p>
                </div>

                <div className="space-y-3.5">
                  {packages.map((pkg, i) => (
                    <button
                      key={pkg.name}
                      onClick={() => handleSelectPackage(pkg)}
                      className={`w-full flex items-center justify-between p-4 bg-surface-container-high rounded-xl border text-left transition-all duration-300 group hover:scale-[1.01] hover:brightness-[1.03] cursor-pointer ${
                        pkg.isPopular 
                          ? "border-secondary/40 shadow-[0_4px_16px_rgba(233,195,73,0.06)] relative overflow-hidden" 
                          : "border-white/[0.05] hover:border-[#e9c349]/30"
                      }`}
                    >
                      {pkg.isPopular && (
                        <div className="absolute top-0 right-0 bg-secondary text-black text-[7px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-bl font-mono">
                          RECOMMENDED
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-lg flex items-center justify-center bg-black/40 border ${pkg.isPopular ? "border-secondary/30" : "border-white/[0.05]"}`}>
                          <span className={`material-symbols-outlined text-xl ${pkg.isPopular ? "text-secondary" : "text-zinc-400"} group-hover:scale-110 duration-200`} style={{ fontVariationSettings: "'FILL' 1" }}>
                            toll
                          </span>
                        </div>
                        <div>
                          <p className="font-headline font-black text-xs uppercase text-white tracking-widest">{pkg.name}</p>
                          <p className="text-[#e9c349] font-headline font-black text-lg mt-0.5">+{pkg.chips.toLocaleString()} Chips</p>
                          <p className="text-[10px] text-zinc-500 font-medium">{pkg.desc}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-headline font-bold text-white text-sm block px-3 py-1.5 bg-black/30 rounded-lg group-hover:text-secondary group-hover:border-secondary border border-transparent duration-200">
                          PKR {pkg.pricePKR.toLocaleString()}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="text-center pt-5">
                  <p className="text-[9px] text-[#8b928f] uppercase tracking-widest flex items-center justify-center gap-1.5 font-mono">
                    <span className="material-symbols-outlined text-xs leading-none">verified_user</span> Verified SSL Encryption Protocol Enabled. No Card Required.
                  </p>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Gateway Selection Screen */}
            {step === "gateway-selection" && selectedPkg && (
              <motion.div
                key="step-gateway"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4 text-left"
              >
                <div>
                  <button 
                    onClick={() => setStep("package-selection")}
                    className="flex items-center text-[10px] text-[#8b928f] hover:text-white uppercase tracking-wider font-bold mb-4 focus:outline-none cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xs mr-1">arrow_back</span> Return to grades
                  </button>
                  <h4 className="text-white font-headline text-base font-black uppercase tracking-wider">Select Payment Channel</h4>
                  <p className="text-xs text-[#8b928f]">Please choose your secure instant transfer checkout provider.</p>
                </div>

                {/* Selected package review card layout */}
                <div className="p-3.5 bg-black/40 border border-white/[0.04] rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[8px] font-mono text-[#8b928f]">SELECTED REFUL GRADE:</span>
                    <p className="font-black text-white uppercase">{selectedPkg.name}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-mono text-secondary block">COVERS</span>
                    <span className="font-black text-secondary font-headline">+{selectedPkg.chips.toLocaleString()} Chips</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  
                  {/* JazzCash Option */}
                  <button
                    onClick={() => handleSelectGateway("jazzcash")}
                    className="flex flex-col items-stretch p-5 bg-surface-container-high hover:bg-[#1a0e0a]/50 border hover:border-orange-500/40 border-white/[0.04] rounded-2xl text-left transition-all group duration-300 hover:scale-[1.02] cursor-pointer"
                  >
                    <div className="flex justify-between items-center mb-4">
                      {/* Interactive Custom Crafted Logo for JazzCash */}
                      <div className="flex items-center gap-1">
                        <span className="text-orange-500 font-black text-xl font-headline tracking-tighter italic">Jazz</span>
                        <span className="px-1.5 py-0.5 bg-red-600 text-white font-black text-[9px] rounded uppercase font-sans">Cash</span>
                      </div>
                      <span className="material-symbols-outlined text-orange-500 group-hover:translate-x-1 duration-200">chevron_right</span>
                    </div>
                    <p className="text-[11px] font-bold text-white uppercase tracking-wider">JazzCash Wallet</p>
                    <p className="text-[9px] text-[#8b928f] mt-1.5 leading-relaxed">Fast USSD Push verification directly inside Pakistan. Instantly debit from your secure wallet balance.</p>
                  </button>

                  {/* Easypaisa Option */}
                  <button
                    onClick={() => handleSelectGateway("easypaisa")}
                    className="flex flex-col items-stretch p-5 bg-surface-container-high hover:bg-[#0c1a14]/50 border hover:border-emerald-500/40 border-white/[0.04] rounded-2xl text-left transition-all group duration-300 hover:scale-[1.02] cursor-pointer"
                  >
                    <div className="flex justify-between items-center mb-4">
                      {/* Custom Crafted logo for Easypaisa */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-400 font-headline font-black tracking-widest text-lg capitalize">easy</span>
                        <span className="font-mono text-zinc-300 font-extrabold text-[10px] uppercase border border-emerald-500/30 px-1 py-0.5 rounded bg-emerald-500/10">paisa</span>
                      </div>
                      <span className="material-symbols-outlined text-emerald-400 group-hover:translate-x-1 duration-200">chevron_right</span>
                    </div>
                    <p className="text-[11px] font-bold text-white uppercase tracking-wider">Easypaisa Mobile Wallet</p>
                    <p className="text-[9px] text-[#8b928f] mt-1.5 leading-relaxed">Pay safely via your Telenor Easypaisa microfinance wallet account. Easy OTP and push-pull MPIN authorization.</p>
                  </button>

                </div>
              </motion.div>
            )}

            {/* STEP 3: Enter Credentials Screen */}
            {step === "credential-entry" && selectedPkg && (
              <motion.div
                key="step-credentials"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4 text-left"
              >
                <div>
                  <button 
                    onClick={() => setStep("gateway-selection")}
                    className="flex items-center text-[10px] text-[#8b928f] hover:text-white uppercase tracking-wider font-bold mb-4 focus:outline-none cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xs mr-1">arrow_back</span> Change Wallet Channel
                  </button>
                  <h4 className="text-white font-headline text-base font-black uppercase tracking-wider flex items-center gap-2">
                    {paymentMethod === "jazzcash" ? (
                      <span className="flex items-center gap-1">
                        <span className="text-orange-500 font-headline italic font-black text-base">JazzCash</span> Checkout
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <span className="text-emerald-400 font-headline font-black text-base">Easypaisa</span> Wallet Account
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-[#8b928f]">Please provide your active Pakistani mobile wallet registration specifics below.</p>
                </div>

                {/* Ledger Invoice Card Detailed breakdown */}
                <div className="bg-[#0b1411]/80 border border-white/[0.04] rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between text-xs border-b border-white/[0.04] pb-2 text-zinc-400">
                    <span>Underground Premium Upgrade Grade</span>
                    <span className="font-bold text-white">{selectedPkg.name}</span>
                  </div>
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Base Subscription Cost</span>
                    <span className="text-white">PKR {(selectedPkg.pricePKR * 0.85).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Govt Microfinance Tax & Services fees (15%)</span>
                    <span className="text-white">PKR {(selectedPkg.pricePKR * 0.15).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-2 border-t border-white/[0.04] leading-none">
                    <span className="text-secondary font-black uppercase text-[10px] tracking-wider">Total Due Wallet Premium</span>
                    <span className="font-headline font-black text-secondary text-lg">PKR {selectedPkg.pricePKR.toLocaleString()}</span>
                  </div>
                </div>

                <form onSubmit={handleProceedVerification} className="space-y-4 pt-1">
                  
                  {/* Phone Input Box */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[#8b928f] block">
                      {paymentMethod === "jazzcash" ? "JazzCash Mobile Number" : "Easypaisa Account Number"}
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined text-xs text-[#8b928f] absolute left-3 top-3.5 leading-none">call</span>
                      <input 
                        type="text" 
                        required
                        value={phoneNumber}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^\d*$/.test(val) && val.length <= 11) {
                            setPhoneNumber(val);
                          }
                        }}
                        placeholder="e.g. 03214567890"
                        className="w-full bg-[#111e1a] border border-white/[0.08] rounded-xl pl-9 pr-4 py-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-secondary leading-none focus:ring-1 focus:ring-secondary/20"
                      />
                    </div>
                    <span className="text-[8px] text-[#8b928f] block leading-relaxed">
                      Must be standard 11 digits starting with "03". Active sim is required on this network terminal.
                    </span>
                  </div>

                  {/* CNIC digits validator */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[#8b928f] block">
                      CNIC Last 6 Digits
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined text-xs text-[#8b928f] absolute left-3 top-3.5 leading-none">fingerprint</span>
                      <input 
                        type="password" 
                        required
                        maxLength={6}
                        value={cnicDigits}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^\d*$/.test(val)) {
                            setCnicDigits(val);
                          }
                        }}
                        placeholder="******"
                        className="w-full bg-[#111e1a] border border-white/[0.08] rounded-xl pl-9 pr-4 py-3 text-xs text-white placeholder:text-zinc-700 tracking-widest focus:outline-none focus:border-secondary leading-none focus:ring-1 focus:ring-secondary/20"
                      />
                    </div>
                    <span className="text-[8px] text-[#8b928f] block leading-relaxed">
                      Required by State Bank rules to process microfinance wallet instant mobile transactions securely.
                    </span>
                  </div>

                  {errorText && (
                    <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-300 text-[10px] rounded-lg text-center font-semibold leading-relaxed">
                      {errorText}
                    </div>
                  )}

                  {/* Submission and triggers */}
                  <button 
                    type="submit" 
                    className="w-full mt-4 py-4 bg-gradient-to-r from-secondary to-[#c9a334] text-black font-headline font-black uppercase text-[11px] tracking-widest rounded-xl shadow-[0_5px_15px_rgba(233,195,73,0.2)] hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">lock</span>
                    Authorize PKR {selectedPkg.pricePKR.toLocaleString()} Payment
                  </button>
                </form>
              </motion.div>
            )}

            {/* STEP 4: Processing simulation terminal (OTP & MPIN Push feedback) */}
            {step === "processing-simulation" && selectedPkg && (
              <motion.div
                key="step-simulation"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6 text-center"
              >
                <div className="py-6 flex flex-col items-center justify-center relative">
                  
                  {/* Dynamic rotating concentric indicators */}
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#e9c349]/25 flex items-center justify-center relative animate-spin duration-15000">
                    <div className="absolute inset-2 rounded-full border border-dotted border-[#e9c349]/50 animate-reverse-spin" />
                  </div>
                  
                  <span className={`material-symbols-outlined text-4xl absolute text-secondary animate-pulse`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    {paymentMethod === "jazzcash" ? "vibration" : "cell_tower"}
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-white font-headline text-base font-black uppercase tracking-wider">Awaiting Mobile Confirmation</h4>
                  <p className="text-xs text-[#8b928f] max-w-sm mx-auto leading-relaxed">
                    We pushed an instant checkout ticket to your phone <span className="text-white font-extrabold">{phoneNumber}</span>. 
                    Please unlock your device and verify it immediately.
                  </p>
                </div>

                {/* Progress phase lists */}
                <div className="bg-[#0b1411]/80 border border-white/[0.04] rounded-2xl p-4 text-left max-w-sm mx-auto space-y-3">
                  <div className="flex justify-between items-center text-[9px] text-[#8b928f] uppercase font-bold border-b border-white/[0.03] pb-2">
                    <span>Active Gateway Process Logs</span>
                    <span className="text-secondary font-mono">COUNTDOWN: {countdown}S</span>
                  </div>

                  <div className="space-y-2.5">
                    {processingPhases.map((act, index) => {
                      const isCompleted = index < currentProcessPhase;
                      const isActive = index === currentProcessPhase;
                      
                      return (
                        <div key={index} className={`flex items-start gap-2.5 transition-all duration-300 ${isCompleted ? "opacity-60" : isActive ? "scale-[1.01]" : "opacity-25"}`}>
                          <span className={`material-symbols-outlined text-sm mt-0.5 leading-none ${isCompleted ? "text-green-400" : isActive ? "text-secondary animate-bounce" : "text-zinc-600"}`}>
                            {isCompleted ? "check_circle" : isActive ? "pending" : "radio_button_unchecked"}
                          </span>
                          <div>
                            <p className={`text-[10px] font-black uppercase tracking-wide ${isActive ? "text-white" : "text-zinc-400"}`}>
                              {act.label}
                            </p>
                            <p className="text-[8px] text-zinc-500 font-mono mt-0.5 leading-none">{act.sub}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Interactive Simulator PIN box so they can submit immediately without waiting */}
                <div className="max-w-sm mx-auto p-4 bg-yellow-500/5 hover:bg-yellow-500/10 border border-yellow-500/15 rounded-xl text-left space-y-2">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-xs text-secondary">info</span>
                    <span className="text-[9px] font-bold text-secondary uppercase tracking-widest leading-none">Sandbox PIN Simulator Interceptor</span>
                  </div>
                  <p className="text-[9px] text-zinc-400 leading-normal">
                    Ordinarily, the user inputs their secure 4-digit MPIN code on their phone screen. You may simulate instant subscriber feedback below:
                  </p>
                  
                  <div className="flex gap-2 pt-1.5">
                    <input 
                      type="password"
                      maxLength={4}
                      placeholder="Enter 4-Digit Test MPIN"
                      value={mpinInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^\d*$/.test(val)) {
                          setMpinInput(val);
                        }
                      }}
                      className="bg-black/50 border border-white/10 text-center rounded text-xs py-1.5 flex-1 focus:outline-none focus:border-secondary tracking-[0.25em] text-white"
                    />
                    <button 
                      onClick={handleFinalizeSimulation}
                      disabled={mpinInput.length < 4}
                      className="px-4 py-1.5 bg-secondary hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:grayscale disabled:filter text-black rounded text-[9px] font-black uppercase tracking-wider transition-all duration-150 cursor-pointer"
                    >
                      Verify MPIN
                    </button>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <p className="text-[9px] text-zinc-500">
                    If you did not receive standard device system push notification, we will fallback automatically once timer lapses.
                  </p>
                </div>
              </motion.div>
            )}

            {/* STEP 5: Success Receipt Screen */}
            {step === "success-receipt" && selectedPkg && (
              <motion.div
                key="step-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                {/* Visual celebratory success icon design */}
                <div className="py-4 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 border-2 border-green-500/20 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-green-400 text-3xl leading-none animate-bounce" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle_outline</span>
                  </div>
                  <h4 className="text-green-400 font-headline text-lg font-black uppercase tracking-wider">Payment Cleared Successfully</h4>
                  <p className="text-[10px] uppercase font-mono font-bold text-zinc-500 tracking-widest mt-1">TRANSACTION CLEARING SUCCESSFUL</p>
                </div>

                {/* Printable physical checkout ticket design */}
                <div className="bg-[#0b1411]/90 border border-green-500/15 rounded-2xl p-5 text-left relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/[0.01] rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="space-y-3.5 relative z-10">
                    <div className="flex justify-between items-center pb-2.5 border-b border-white/[0.04]">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold">Checkout Issuer</span>
                      <span className="text-xs font-black text-white uppercase flex items-center gap-1 font-mono">
                        {paymentMethod === "jazzcash" ? "JAZZCASH_PK" : "EASYPAISA_PK"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[8px] font-mono text-zinc-500 block uppercase">Transaction ID</span>
                        <span className="text-xs font-mono font-bold text-white tracking-tight">{receiptTxnId}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-mono text-zinc-500 block uppercase">Billing Date</span>
                        <span className="text-[11px] font-bold text-white">07-Jun-2026 12:00</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-mono text-zinc-500 block uppercase">Registered Account</span>
                        <span className="text-[11px] font-mono font-bold text-white">{phoneNumber}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-mono text-zinc-500 block uppercase">Tax Paid</span>
                        <span className="text-[11px] font-bold text-white">PKR {(selectedPkg.pricePKR * 0.15).toFixed(0)}</span>
                      </div>
                    </div>

                    <div className="border-t border-dashed border-white/10 pt-3 flex justify-between items-center">
                      <div>
                        <p className="text-[8px] font-mono text-[#8b928f] uppercase leading-none">Purchased Ledger Value</p>
                        <p className="text-secondary font-headline font-black text-xs uppercase tracking-widest mt-1">
                          {selectedPkg.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-zinc-400">Total Charged</p>
                        <p className="text-white font-headline font-black text-base">PKR {selectedPkg.pricePKR.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="pt-3.5 border-t border-white/[0.04] flex items-center justify-between">
                      <span className="text-[9px] font-mono font-extrabold text-emerald-400 flex items-center gap-1.5 uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                        Assets Credited
                      </span>

                      <span className="font-headline font-black text-[#e9c349] text-base">
                        +{selectedPkg.chips.toLocaleString()} COINS
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button 
                    onClick={handleCompletePaymentAndRefill}
                    className="w-full py-4 bg-green-500 hover:bg-green-400 text-black font-headline font-black uppercase text-[11px] tracking-widest rounded-xl shadow-[0_5px_15px_rgba(74,222,128,0.2)] transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-base">sports_esports</span>
                    Claim Coins & return to arena
                  </button>
                  <p className="text-[9px] text-[#8b928f]">
                    *Receipt logs successfully synced with your secure offline database.
                  </p>
                </div>
              </motion.div>
            )}

            {/* STEP 6: Error / Fail Panel */}
            {step === "error-refund" && selectedPkg && (
              <motion.div
                key="step-error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6 text-center"
              >
                <div className="py-4 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500/20 flex items-center justify-center mb-3 text-red-400">
                    <span className="material-symbols-outlined text-3xl animate-bounce" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                  </div>
                  <h4 className="text-red-400 font-headline text-base font-black uppercase tracking-wider">Gateway Authorization Refused</h4>
                  <p className="text-[10px] uppercase font-mono font-bold text-zinc-500 tracking-widest mt-1">TRANSACTION LOG TERMINATED [Err Code 114]</p>
                </div>

                <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-2xl text-left max-w-sm mx-auto space-y-1.5 text-xs">
                  <p className="font-extrabold text-[#ffb4ab] uppercase text-[10px] tracking-widest mb-1 shadow-sm leading-relaxed">
                    Decryption Handshake failed
                  </p>
                  
                  {sandboxResponseMode === "INSUFFICIENT_FUNDS" && (
                    <p className="text-red-300 leading-relaxed text-[11px]">
                      The selected mobile wallet subscriber account does not contain sufficient funds to cover the PKR {selectedPkg.pricePKR.toLocaleString()} charge. Please top up your wallet balance and try again.
                    </p>
                  )}

                  {sandboxResponseMode === "TIMEOUT" && (
                    <p className="text-red-300 leading-relaxed text-[11px]">
                      The payment transaction timeout period of 45s has elapsed without receiving subscriber MPIN confirmation back from the network node.
                    </p>
                  )}

                  {sandboxResponseMode === "BLOCKED_SIM" && (
                    <p className="text-red-300 leading-relaxed text-[11px]">
                      State Bank security filters locked this subscriber's CNIC matching profile list. Verification refused due to standard risk limits.
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2.5 pt-2 max-w-sm mx-auto">
                  <button 
                    onClick={() => setStep("credential-entry")}
                    className="w-full py-3 bg-[#2a1310] hover:bg-[#341713] text-red-300 border border-red-500/20 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">replay</span>
                    Re-attempt checkout logs
                  </button>
                  <button 
                    onClick={() => setStep("package-selection")}
                    className="text-xs text-zinc-400 hover:text-white underline cursor-pointer"
                  >
                    Select different grade
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer info blocks */}
        {step !== "success-receipt" && (
          <div className="px-6 py-4 border-t border-white/[0.04] bg-surface-container-low flex justify-between items-center text-[9px] font-mono font-bold text-zinc-500 tracking-wider">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-green-500 shrink-0">verified</span> Security Code SEC-G39
            </span>
            <span className="uppercase text-[#8b928f]">Licensed Merchant #9420-JC</span>
          </div>
        )}
      </div>
    </div>
  );
};
