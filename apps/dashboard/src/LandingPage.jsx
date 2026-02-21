import React, { useState, useEffect, useRef } from 'react';
import heroImage from '../assest/ParkBuddy.png';
import otpImage from '../assest/ParkBuddy.png';
import HomeDashboard from './HomeDashboard';

export default function LandingPage() {
  const [step, setStep] = useState('login');
  const [userType, setUserType] = useState('DRIVER');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(15);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpStatus, setOtpStatus] = useState(null); // 'success', 'error', or null
  const [isInitializing, setIsInitializing] = useState(true);
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  // Check for existing session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('http://10.199.124.131:3008/api/user/me', {
          credentials: 'include',
        });
        const data = await response.json().catch(() => ({}));
        if (data.success && data.user) {
          // If valid session exists, skip login entirely
          setStep('home');
        }
      } catch (err) {
        console.error('Session check failed:', err);
      } finally {
        setIsInitializing(false);
      }
    };
    
    checkSession();
  }, []);


  // Auto-hide success message after 2 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 2500);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const Toast = ({ message, type }) => (
    <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[110] animate-toast-in">
      <div className={`px-4 py-2.5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex items-center gap-3 border backdrop-blur-md ${
        type === 'success' ? 'bg-white/90 border-emerald-100 text-emerald-600' : 'bg-white/90 border-rose-100 text-rose-600'
      }`}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${type === 'success' ? 'bg-emerald-50' : 'bg-rose-50'}`}>
          {type === 'success' ? (
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
          )}
        </div>
        <span className="text-[13px] font-bold tracking-tight whitespace-nowrap">{message}</span>
      </div>
    </div>
  );

  // OTP Resend Timer Logic
  useEffect(() => {
    let interval = null;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);



  // Error messages and status now clear only on user input, as requested

  const handleResendOtp = async () => {
    if (resendTimer > 0 || isLoading) return;
    
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch('http://10.199.124.131:3007/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          mobileNumber: `+91${mobileNumber}`,
          role: [userType === 'DRIVER' ? 'DRIVER' : 'OWNER']
        }),
      });
      
      const data = await response.json().catch(() => ({}));
      
      if (response.ok) {
        setSuccessMessage(data.message || 'OTP resent successfully');
        setResendTimer(15);
        // Clear OTP fields and reset focus
        setOtp(['', '', '', '', '', '']);
        setOtpStatus(null);
        setTimeout(() => {
          if (inputRefs[0].current) inputRefs[0].current.focus();
        }, 0);
      } else {
        setError(data.message || 'Failed to resend OTP. Please try again.');
      }
    } catch (err) {
      console.error('Resend error:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!mobileNumber) {
      setError('Please enter a phone number');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch('http://10.199.124.131:3007/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          mobileNumber: `+91${mobileNumber}`,
          role: [userType === 'DRIVER' ? 'DRIVER' : 'OWNER']
        }),
      });
      
      const data = await response.json().catch(() => ({}));
      
      if (response.ok) {
        setSuccessMessage(data.message || 'OTP sent successfully');
        setStep('otp');
      } else {
        setError(data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVerifyOtp = async (otpString) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://10.199.124.131:3007/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          mobileNumber: `+91${mobileNumber}`,
          role: [userType === 'DRIVER' ? 'DRIVER' : 'OWNER'],
          otp: otpString
        }),
      });
      
      const data = await response.json().catch(() => ({}));
      
      if (response.ok) {
        setOtpStatus('success');
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(200);
        }
        setTimeout(() => setStep('success'), 800);
      } else {
        setOtpStatus('error');
        setError(data.message || 'Invalid OTP. Please try again.');
        // Trigger vibration on mobile
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value !== '' && !/^[0-9]$/.test(value.slice(-1))) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (error) setError('');
    if (otpStatus) setOtpStatus(null);

    // Move to next input or finish
    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    } else if (value && index === 5) {
      // All digits filled - trigger verification API
      const finalOtp = newOtp.join('');
      if (finalOtp.length === 6) {
        handleVerifyOtp(finalOtp);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  if (isInitializing) {
    return (
      <div className="h-[100dvh] w-full flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#10B981] font-bold tracking-widest text-sm uppercase">ParkBuddy</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] overflow-hidden bg-slate-50 font-sans text-[#0F172A] antialiased flex flex-col md:flex-row md:items-center">
      
      {/* Top Hero Section (Web: Left Side, Mobile: Top half) */}
      <div className="flex-1 md:h-screen relative overflow-hidden flex flex-col items-center justify-center min-h-[35dvh] md:min-h-0 bg-slate-900">
        <img 
          src={step === 'login' ? heroImage : otpImage} 
          alt="ParkBuddy Background" 
          className="absolute inset-0 w-full h-full object-cover object-[center_35%] md:object-center transition-all duration-500"
        />
        
        {/* Bottom Curve Divider for Mobile */}
        <div className="absolute bottom-0 z-10 w-full h-8 bg-gradient-to-t from-black/5 to-transparent md:hidden"></div>
      </div>

      {/* Bottom Form Section (Web: Right Side) */}
      <div className="flex-[1.2] md:flex-1 bg-white relative flex flex-col items-center justify-start z-20 transition-all duration-300 -mt-6 md:mt-0 md:w-1/2 md:h-screen md:rounded-none rounded-t-3xl pt-8 md:pt-0 px-6 pb-8 md:justify-center shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.1)] md:shadow-[-10px_0_20px_-5px_rgba(0,0,0,0.1)] overflow-y-auto">
        
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-20">
          {/* Red Dotted Curved Line */}
          <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M-50 100 C 150 50, 250 350, 450 300" stroke="#EF4444" strokeWidth="2" strokeDasharray="6 6" fill="none" />
            <path d="M-20 450 C 100 400, 300 550, 420 500" stroke="#EF4444" strokeWidth="2" strokeDasharray="6 6" fill="none" />
          </svg>
          
          {/* Location Icon in Bottom Right */}
          <div className="absolute bottom-8 right-8 text-[#EF4444] transform rotate-12">
            <svg className="w-24 h-24 md:w-32 md:h-32" viewBox="0 0 24 24" fill="currentColor" opacity="0.6">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
        </div>
        
        <div className="w-full max-w-sm md:max-w-md h-full flex flex-col relative z-10">
          {step === 'login' ? (
            <>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 text-center leading-tight mb-6 md:mb-10 shrink-0">
                Your destination deserves a guaranteed spot.
              </h2>

              {/* User Type Selection */}
              <div className="flex w-full bg-slate-100 rounded-xl p-1 mb-6 shrink-0">
                <button 
                  onClick={() => setUserType('DRIVER')}
                  className={`flex-1 py-2 flex justify-center items-center gap-2 text-sm md:text-base font-bold rounded-lg transition-all ${userType === 'DRIVER' ? 'bg-white shadow-sm text-[#10B981]' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
                    <circle cx="7" cy="17" r="2"/>
                    <path d="M9 17h6"/>
                    <circle cx="17" cy="17" r="2"/>
                  </svg>
                  DRIVER
                </button>
                <button 
                  onClick={() => setUserType('OWNER')}
                  className={`flex-1 py-2 flex justify-center items-center gap-2 text-sm md:text-base font-bold rounded-lg transition-all ${userType === 'OWNER' ? 'bg-white shadow-sm text-[#10B981]' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2"/>
                    <path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>
                  </svg>
                  OWNER
                </button>
              </div>

              {/* Divider with text */}
              <div className="flex items-center w-full mb-5 relative shrink-0">
                <div className="flex-1 h-px bg-slate-200"></div>
                <span className="px-4 text-xs md:text-sm font-semibold text-slate-500 absolute left-1/2 -translate-x-1/2 bg-white">Log in or sign up</span>
              </div>

              {/* Phone Input Row */}
              <div className="flex gap-2 md:gap-3 mb-5 shrink-0">
                {/* Country Code Dropdown */}
                <div className="flex items-center gap-1 md:gap-2 px-3 md:px-4 h-[3.25rem] md:h-[3.5rem] border border-slate-300 rounded-xl bg-white shadow-sm cursor-pointer hover:border-slate-400 transition-colors">
                  <div className="flex flex-col w-5 h-3.5 border border-slate-200 shadow-sm overflow-hidden rounded-[1px]">
                    <div className="flex-1 bg-[#FF9933]"></div>
                    <div className="flex-1 bg-white flex items-center justify-center relative">
                      <div className="w-1.5 h-1.5 border-[0.5px] border-[#000080] rounded-full flex items-center justify-center">
                        <div className="w-[1px] h-[1px] bg-[#000080] rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex-1 bg-[#138808]"></div>
                  </div>
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
                
                {/* Phone Number Input */}
                <div className="flex-1 relative h-[3.25rem] md:h-[3.5rem]">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 md:pl-4 pointer-events-none">
                    <span className="font-semibold text-slate-900 text-base">+91</span>
                  </div>
                  <input 
                    type="tel" 
                    value={mobileNumber}
                    onChange={(e) => {
                      setMobileNumber(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Enter Phone Number" 
                    className={`w-full h-full pl-12 md:pl-14 pr-3 border ${error ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300'} rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] transition-all text-slate-900 font-medium placeholder:text-slate-400 placeholder:font-normal text-base`}
                  />
                </div>
              </div>

              {error && (
                <p className="text-rose-500 text-xs font-semibold mb-4 px-1">{error}</p>
              )}

              {/* Continue Button */}
              <button 
                onClick={handleContinue}
                disabled={isLoading}
                className={`w-full ${isLoading ? 'bg-slate-300 cursor-not-allowed' : 'bg-[#10B981] hover:bg-[#059669]'} text-white text-lg md:text-xl font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] mb-6 shrink-0 flex items-center justify-center gap-2`}
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Continue'}
                {!isLoading && (
                  <svg className="w-5 h-5 md:w-6 md:h-6 animate-auto-slide" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                )}
              </button>

              {/* OR Divider */}
              <div className="flex items-center w-full mb-6 relative shrink-0 hidden md:flex">
                <div className="flex-1 h-px bg-slate-200"></div>
                <span className="px-4 text-xs md:text-sm font-semibold text-slate-400 absolute left-1/2 -translate-x-1/2 bg-white">or</span>
              </div>

              {/* Social Logins */}
              <div className="flex justify-center gap-5 md:gap-8 mb-auto shrink-0">
                <button className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </button>
                <button className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
                   <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z"/>
                    </svg>
                </button>
              </div>

              {/* Footer Text */}
              <div className="text-center w-full mt-4 pb-2 shrink-0">
                <p className="text-[10px] md:text-xs font-medium text-slate-500 mb-1.5 md:mb-2">By continuing, you agree to our</p>
                <div className="flex justify-center gap-3 text-[10px] md:text-xs font-semibold text-slate-600">
                  <a href="#" className="border-b border-dashed border-slate-300 pb-0.5 hover:text-[#10B981]">Terms of Service</a>
                  <a href="#" className="border-b border-dashed border-slate-300 pb-0.5 hover:text-[#10B981]">Privacy Policy</a>
                  <a href="#" className="border-b border-dashed border-slate-300 pb-0.5 hover:text-[#10B981]">Content Policy</a>
                </div>
              </div>
            </>
          ) : step === 'otp' ? (
            <div className="w-full h-full flex flex-col pt-2 md:pt-10">
              {/* Header without back button (moved to bottom) */}
              <div className="flex items-center justify-center mb-6 md:mb-10 px-2 shrink-0">
                <h3 className="text-xl md:text-3xl font-bold text-slate-900 leading-none">OTP Verification</h3>
              </div>

              <div className="flex flex-col items-center flex-1 w-full mt-2">
                <p className="text-sm md:text-base text-slate-700 font-medium mb-1">
                  We have sent a verification code to
                </p>
                <p className="text-base md:text-lg font-bold text-slate-900 mb-8 md:mb-10">
                  {mobileNumber || 'XXXXXXXXXX'}
                </p>

                {/* OTP Inputs */}
                <div className="flex justify-between gap-1 sm:gap-2 mb-8 w-full max-w-[280px] sm:max-w-none px-1">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={inputRefs[i]}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      className={`w-8 h-10 sm:w-12 sm:h-14 md:w-14 md:h-16 border border-slate-300 rounded-lg md:rounded-xl text-center text-lg md:text-xl font-bold focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981] outline-none transition-all bg-white shadow-sm ${
                        otpStatus === 'success' ? 'otp-input-success' : 
                        otpStatus === 'error' ? 'otp-input-error' : ''
                      }`}
                    />
                  ))}
                </div>

                <p className="text-xs md:text-sm font-bold text-slate-800">
                  Didn't get the OTP? 
                  {resendTimer > 0 ? (
                    <span className="text-slate-400 font-semibold ml-6">Resend SMS in {resendTimer}s</span>
                  ) : (
                    <button 
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="text-[#10B981] font-bold ml-6 hover:text-[#059669] transition-colors disabled:text-slate-300"
                    >
                      {isLoading ? 'Resending...' : 'Resend SMS'}
                    </button>
                  )}
                </p>

                <div className="mt-auto pt-8 pb-4 md:pb-8 w-full flex flex-col items-center shrink-0">
                  {/* Centered Toasts at bottom */}
                  {successMessage && <Toast message={successMessage} type="success" />}
                  {error && step === 'otp' && <Toast message={error} type="error" />}

                  <button 
                    onClick={() => {
                      setStep('login');
                      setSuccessMessage('');
                      setError('');
                      setResendTimer(15);
                      setOtp(['', '', '', '', '', '']);
                    }} 
                    className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-full transition-colors active:scale-95"
                    title="Go back to login methods"
                  >
                    <svg className="w-6 h-6 animate-auto-slide-left" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ) : step === 'success' ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-center px-4 animate-auto-slide-right">
              {/* Animated Success Checkmark */}
              <div className="w-24 h-24 md:w-32 md:h-32 mb-8 relative">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  {/* Circle background */}
                  <circle 
                    cx="50" cy="50" r="45" 
                    fill="none" 
                    stroke="#10B981" 
                    strokeWidth="8" 
                    className="opacity-20"
                  />
                  {/* Animated Tick */}
                  <path 
                    d="M30 50 L45 65 L70 35" 
                    fill="none" 
                    stroke="#10B981" 
                    strokeWidth="8" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="animate-tick-draw"
                  />
                </svg>
              </div>

              {/* Success Messages */}
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
                Wollah!
              </h2>
              <p className="text-base md:text-lg text-slate-600 font-medium mb-12 max-w-[280px]">
                We’re here so your journey ends as beautifully as it begins.
              </p>

              {/* Action Button - Matched with Continue button style */}
              <button 
                onClick={() => {
                  setStep('home');
                }}
                className="w-full bg-[#10B981] hover:bg-[#059669] text-white text-lg md:text-xl font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                Park Smarter Today
              </button>
            </div>
          ) : step === 'home' ? (
            <HomeDashboard onBack={() => setStep('success')} />
          ) : null}
        </div>
      </div>
      <style jsx>{`
        @keyframes slideInBottomCentered {
          from { transform: translateX(-50%) translateY(1rem); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        .animate-toast-in { animation: slideInBottomCentered 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        .otp-input-success { border-color: #10B981 !important; ring-color: #10B981 !important; }
        .otp-input-error { border-color: #EF4444 !important; ring-color: #EF4444 !important; }
        
        .animate-bounce-subtle {
          animation: bounce-subtle 2s infinite;
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
