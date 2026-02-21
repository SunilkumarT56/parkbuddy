import React, { useState, useEffect } from 'react';
import profileBg from '../assest/freezydreamin-dmwi1JL4vKk-unsplash.jpg';
import addSpotBg from '../assest/ParkBuddy2.png';


const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center overflow-hidden">
      {/* Animation Styles */}

      <div className="relative flex flex-col items-center">
        {/* Center Car */}
        <div className="relative animate-car z-10">
          <svg width="60" height="35" viewBox="0 0 60 35" fill="none">
            {/* Car Body */}
            <path d="M5 25C5 25 2 25 2 22C2 19 5 18 5 18L10 10C12 7 15 5 20 5H40C45 5 48 7 50 10L55 18C55 18 58 19 58 22C58 25 55 25 55 25H5" fill="#10B981" />
            <path d="M12 18H48L44 10C44 10 42 8 40 8H20C18 8 16 10 16 10L12 18Z" fill="white" fillOpacity="0.3" />
            {/* Wheels */}
            <circle cx="15" cy="27" r="5" fill="#1e293b" className="animate-wheel" />
            <circle cx="15" cy="27" r="2" fill="white" fillOpacity="0.5" />
            <circle cx="45" cy="27" r="5" fill="#1e293b" className="animate-wheel" />
            <circle cx="45" cy="27" r="2" fill="white" fillOpacity="0.5" />
          </svg>
        </div>
      </div>
    </div>
  );
};

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

const MenuItem = ({ icon, label, onClick, danger, rightElement, subtitle }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between py-2.5 px-6 hover:bg-slate-50 transition-all active:scale-[0.98] group`}
  >
    <div className="flex items-center gap-6">
      <div className={`w-6 h-6 flex items-center justify-center ${danger ? 'text-rose-500' : 'text-slate-800'}`}>
        {icon}
      </div>
      <div className="flex flex-col items-start">
        <span className={`text-[16px] font-medium ${danger ? 'text-rose-500' : 'text-slate-900'} tracking-tight`}>{label}</span>
        {subtitle && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{subtitle}</span>}
      </div>
    </div>
    <div className="flex items-center gap-3">
      {rightElement}
      <svg className={`w-4 h-4 ${danger ? 'text-rose-300' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </button>
);

const SectionHeader = ({ title }) => (
  <div className="px-6 pt-10 pb-2">
    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</h3>
  </div>
);

const LeafletMap = ({ lat, lng, onConfirm, isPicker = false, height = "100%", leafletLoaded }) => {
  const mapRef = React.useRef(null);
  const mapInstance = React.useRef(null);
  const markerRef = React.useRef(null);
  const [mapPick, setMapPick] = React.useState({ lat: lat || 28.6139, lng: lng || 77.2090 });
  const [isLocating, setIsLocating] = React.useState(false);

  // 1. Initialize Map
  React.useEffect(() => {
    if (!leafletLoaded || !mapRef.current || mapInstance.current) return;
    if (typeof L === 'undefined') return;

    const initialLat = parseFloat(lat) || 28.6139;
    const initialLng = parseFloat(lng) || 77.2090;

    mapInstance.current = L.map(mapRef.current, {
      zoomControl: !isPicker,
      attributionControl: false
    }).setView([initialLat, initialLng], isPicker ? 16 : 14);

    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(mapInstance.current);

    if (!isPicker) {
      markerRef.current = L.marker([initialLat, initialLng]).addTo(mapInstance.current);
      mapInstance.current.dragging.disable();
      mapInstance.current.touchZoom.disable();
      mapInstance.current.doubleClickZoom.disable();
      mapInstance.current.scrollWheelZoom.disable();
    } else {
      mapInstance.current.on('move', () => {
        const center = mapInstance.current.getCenter();
        setMapPick({ lat: center.lat.toFixed(6), lng: center.lng.toFixed(6) });
      });
    }

    setTimeout(() => {
      if (mapInstance.current) mapInstance.current.invalidateSize();
    }, 400);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [leafletLoaded, isPicker]);

  // 2. Sync Map view when lat/lng props change (e.g. from Auto-locate)
  React.useEffect(() => {
    if (!mapInstance.current) return;
    const currentLat = parseFloat(lat);
    const currentLng = parseFloat(lng);
    if (!isNaN(currentLat) && !isNaN(currentLng)) {
      const center = mapInstance.current.getCenter();
      // Only pan if changed significantly to avoid feedback loops
      if (Math.abs(center.lat - currentLat) > 0.0001 || Math.abs(center.lng - currentLng) > 0.0001) {
        mapInstance.current.setView([currentLat, currentLng], mapInstance.current.getZoom());
      }
      if (markerRef.current) {
        markerRef.current.setLatLng([currentLat, currentLng]);
      }
    }
  }, [lat, lng]);

  const handleLocateMe = (e) => {
    if (e) e.stopPropagation();
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        const latStr = latitude.toFixed(6);
        const lngStr = longitude.toFixed(6);
        
        console.log("Location found:", latStr, lngStr);
        
        if (mapInstance.current) {
          mapInstance.current.setView([latitude, longitude], 16);
        }
        
        if (onConfirm && !isPicker) {
          onConfirm(latStr, lngStr);
        }
      },
      (err) => {
        setIsLocating(false);
        console.error("Locate Me failed:", err);
        let msg = "Could not get location.";
        if (err.code === 1) msg = "Location permission denied. Please allow location access in your browser settings.";
        else if (err.code === 2) msg = "Location unavailable.";
        else if (err.code === 3) msg = "Location request timed out.";
        alert(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="relative w-full h-full group/map">
      <div ref={mapRef} style={{ height, width: '100%', borderRadius: 'inherit' }} />
      
      {/* Dynamic Locate Me FAB */}
      <button 
        type="button"
        onClick={handleLocateMe}
        className={`absolute z-[1000] flex items-center justify-center bg-[#10B981] text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all outline-none ring-4 ring-white/20
          ${isPicker ? 'bottom-28 right-4 w-14 h-14' : 'top-4 right-4 w-10 h-10'}
          ${isLocating ? 'animate-pulse opacity-80' : ''}`}
        title="Find my current location"
      >
        {isLocating ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className={`${isPicker ? 'w-7 h-7' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" />
            <path d="M12 2v2M12 20v2M20 12h2M2 12h2" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {isPicker && (
        <div className="absolute top-4 right-4 z-[1000]">
          <button 
            onClick={() => onConfirm(mapPick.lat, mapPick.lng)}
            className="px-8 py-3 bg-[#10B981] text-white rounded-2xl font-black text-[15px] shadow-2xl hover:bg-[#0ea371] hover:-translate-y-0.5 transition-all active:translate-y-0"
          >
            Confirm Location
          </button>
        </div>
      )}
      {isPicker && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[1000] -translate-y-8">
          <div className="relative">
            <div className="animate-bounce">
              <svg className="w-12 h-12 text-[#10B981] drop-shadow-2xl" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" />
              </svg>
            </div>
            <div className="w-3 h-3 bg-black/10 rounded-full blur-[2px] absolute -bottom-1 left-1/2 -translate-x-1/2 scale-x-150"></div>
          </div>
        </div>
      )}
      {isPicker && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-[240px] bg-white/90 backdrop-blur px-6 py-3 rounded-2xl shadow-xl border border-white/50 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Position Pin</p>
          <p className="text-[12px] font-black text-slate-900 tabular-nums">{mapPick.lat}, {mapPick.lng}</p>
        </div>
      )}
    </div>
  );
};

const AddSpotView = ({ newSpot, setNewSpot, handleSubmitSpot, validationWarning, LeafletMap, leafletLoaded }) => {
  const [showMapPicker, setShowMapPicker] = useState(false);

  // Fetch Live Location on mount
  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Auto-location success:", latitude, longitude);
          setNewSpot(prev => ({
            ...prev,
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6)
          }));
        },
        (error) => {
          console.error("Geolocation auto-fetch error:", error);
          // Fallback to default if not set
          if (!newSpot.latitude) {
            setNewSpot(prev => ({ ...prev, latitude: '28.6139', longitude: '77.2090' }));
          }
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []); // Run once when Post a Spot is opened
  return (
    <div className="relative min-h-screen animate-in slide-in-from-right-4 duration-300 pb-20 bg-white max-w-xl mx-auto overflow-hidden">
      {/* Hero Header matching Profile View */}
      <div className="relative h-[240px] w-full overflow-hidden bg-[#10B981]">
        
        {/* Back Button (Absolute positioned over image) */}
        <button 
          onClick={() => setNewSpot(null)} // Trigger parent's close logic via prop if passed, or handled externally. For safety we use an injected onBack.
          className="absolute top-12 flex items-center bg-transparent z-[100]"
        >
        </button>

        <div className="absolute inset-0 z-0">
          <img 
            src={addSpotBg} 
            alt="Add Spot Header" 
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-transparent"></div>
        </div>

        {/* Wavy Shape Overlay */}
        <div className="absolute bottom-[-1px] left-0 right-0 z-10 select-none pointer-events-none">
          <svg viewBox="0 0 400 60" className="w-full h-auto">
            <path 
              fill="white" 
              d="M0,60 L0,30 C50,0 100,50 150,30 C200,10 250,55 300,35 C350,15 400,45 400,30 L400,60 Z"
            ></path>
          </svg>
        </div>
      </div>

      {/* Background Visual: Dotted Red Line & Location Icon */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.07] flex items-center justify-center">
        <svg width="100%" height="100%" viewBox="0 0 400 800" fill="none" xmlns="http://www.w3.org/2000/svg" className="translate-y-10 scale-125">
          {/* Main Journey Line */}
          <path d="M50 50C100 100 0 200 50 250C100 300 200 200 250 300C300 400 100 500 150 550C200 600 300 550 350 650" stroke="#EF4444" strokeWidth="2" strokeDasharray="8 8" />
          
          {/* Decorative Branch 1 */}
          <path d="M250 300C300 250 380 320 350 400C320 480 380 550 320 620" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5" />
          
          {/* Decorative Branch 2 */}
          <path d="M50 250C-20 300 20 400 80 450C140 500 100 600 150 550" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5" />
          
          {/* Connection points */}
          <circle cx="50" cy="50" r="6" fill="#EF4444" />
          <circle cx="350" cy="650" r="4" fill="#EF4444" opacity="0.5" />
          
          {/* Location Icon at the end of the main journey */}
          <g transform="translate(340, 640) scale(0.8)">
            <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#EF4444" />
          </g>
        </svg>
      </div>

      {/* Minimal Yellow Validation Warning */}
      {validationWarning && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[110] animate-toast-in">
          <div className="bg-yellow-400/95 backdrop-blur-md text-yellow-950 px-6 py-2.5 rounded-2xl text-[13px] font-bold shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex items-center gap-2 border border-yellow-200">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            <span className="whitespace-nowrap">{validationWarning}</span>
          </div>
        </div>
      )}

      <div className="relative z-10 px-8 pt-8">
        {/* Header Section */}
        <div className="flex flex-col gap-1 mb-10">
          <h2 className="text-[28px] font-bold text-slate-900 tracking-tight leading-none">Create Listing</h2>
          <p className="text-[14px] font-medium text-slate-400 mt-2">Set up your parking spot for the community</p>
        </div>

        {/* Spot Category (inspired by Billing frequency) */}
        <div className="mb-12">
          <h3 className="text-[17px] font-semibold text-slate-900 mb-6">Spot listing type</h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setNewSpot({...newSpot, type: 'hourly'})}
              className={`p-6 rounded-xl border-2 text-left transition-all relative group ${
                newSpot.type !== 'daily' ? 'border-[#10B981] bg-white ring-4 ring-emerald-50' : 'border-slate-100 hover:border-slate-400 bg-white'
              }`}
            >
              <div className="flex flex-col gap-1">
                <span className="text-[13px] font-semibold text-slate-400">Standard listing</span>
                <span className="text-[18px] font-bold text-slate-900">Hourly Basis</span>
              </div>
              {newSpot.type !== 'daily' && (
                <div className="absolute top-4 right-4 text-[#10B981]">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                </div>
              )}
            </button>
            <button 
              onClick={() => setNewSpot({...newSpot, type: 'daily'})}
              className={`p-6 rounded-xl border-2 text-left transition-all relative group ${
                newSpot.type === 'daily' ? 'border-[#10B981] bg-white ring-4 ring-emerald-50' : 'border-slate-100 hover:border-slate-400 bg-white'
              }`}
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-[#D4AF37]">Premium listing</span>
                  <span className="bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider">SAVE 20%</span>
                </div>
                <span className="text-[18px] font-bold text-slate-900">Daily Basis</span>
              </div>
              {newSpot.type === 'daily' && (
                <div className="absolute top-4 right-4 text-[#10B981]">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Upload Photos Section (inspired by Payment method) */}
        <div className="mb-12">
          <h3 className="text-[17px] font-semibold text-slate-900 mb-6">Media attachment</h3>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {[...Array(5)].map((_, i) => {
              const file = newSpot.images[i];
              const previewUrl = file ? URL.createObjectURL(file) : null;
              
              return (
                <div key={i} className="relative min-w-[120px]">
                  {file ? (
                    <div className="w-[120px] h-[80px] rounded-xl overflow-hidden border-2 border-[#10B981] relative group/photo">
                      <img src={previewUrl} className="w-full h-full object-cover" alt={`Spot ${i+1}`} />
                      <button 
                        onClick={() => {
                          const updatedImages = [...newSpot.images];
                          updatedImages.splice(i, 1);
                          setNewSpot({...newSpot, images: updatedImages});
                        }}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity shadow-lg"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3" strokeLinecap="round" /></svg>
                      </button>
                    </div>
                  ) : (
                    <label className={`w-[120px] h-[80px] rounded-xl border-2 border-dashed border-slate-400 flex flex-col items-center justify-center gap-1 hover:border-[#10B981] hover:bg-emerald-50 transition-all cursor-pointer group ${newSpot.images.length >= 5 && 'opacity-50 pointer-events-none'}`}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        disabled={newSpot.images.length >= 5}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) setNewSpot({...newSpot, images: [...newSpot.images, file]});
                        }}
                      />
                      <svg className="w-6 h-6 text-slate-400 group-hover:text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="2.5" strokeLinecap="round" /></svg>
                      <span className="text-[10px] font-semibold text-slate-400 group-hover:text-[#10B981] uppercase tracking-wider">Photo {newSpot.images.length + 1}</span>
                    </label>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Sections (Structured like reference) */}
        <div className="space-y-12">
          <section>
            <h3 className="text-[17px] font-semibold text-slate-900 mb-6">Spot details</h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold text-slate-600">Spot Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Illinois Center Basement"
                  className="w-full h-14 bg-white border-2 border-slate-400 rounded-lg px-4 text-[16px] font-bold text-slate-900 outline-none transition-all focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] placeholder:text-slate-300"
                  value={newSpot.title}
                  onChange={(e) => setNewSpot({...newSpot, title: e.target.value})}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold text-slate-600">Description</label>
                <textarea 
                  placeholder="Describe access instructions, size, etc."
                  rows="3"
                  className="w-full bg-white border-2 border-slate-400 rounded-lg px-4 py-4 text-[16px] font-bold text-slate-900 outline-none transition-all focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] resize-none placeholder:text-slate-300"
                  value={newSpot.description}
                  onChange={(e) => setNewSpot({...newSpot, description: e.target.value})}
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-[17px] font-semibold text-slate-900 mb-6">Location details</h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold text-slate-600">Street Address</label>
                <input 
                  type="text" 
                  placeholder="Street address or P.O box"
                  className="w-full h-14 bg-white border-2 border-slate-400 rounded-lg px-4 text-[16px] font-bold text-slate-900 outline-none transition-all focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] placeholder:text-slate-300"
                  value={newSpot.address}
                  onChange={(e) => setNewSpot({...newSpot, address: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-semibold text-slate-600">City</label>
                  <input 
                    type="text" 
                    placeholder="City"
                    className="w-full h-14 bg-white border-2 border-slate-400 rounded-lg px-4 text-[16px] font-bold text-slate-900 outline-none transition-all focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] placeholder:text-slate-300"
                    value={newSpot.city}
                    onChange={(e) => setNewSpot({...newSpot, city: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-semibold text-slate-600">State</label>
                  <input 
                    type="text" 
                    placeholder="State, region"
                    className="w-full h-14 bg-white border-2 border-slate-400 rounded-lg px-4 text-[16px] font-bold text-slate-900 outline-none transition-all focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] placeholder:text-slate-300"
                    value={newSpot.state}
                    onChange={(e) => setNewSpot({...newSpot, state: e.target.value})}
                  />
                </div>
              </div>

              {/* Map Preview Box */}
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold text-slate-600">Map Location</label>
                <div 
                  onClick={() => setShowMapPicker(true)}
                  className="w-full h-44 rounded-2xl border-2 border-slate-100 bg-slate-50 overflow-hidden relative cursor-pointer group transition-all hover:border-[#10B981]"
                >
                  <LeafletMap 
                    lat={newSpot.latitude} 
                    lng={newSpot.longitude} 
                    height="100%"
                    leafletLoaded={leafletLoaded}
                    onConfirm={(lat, lng) => setNewSpot({...newSpot, latitude: lat, longitude: lng})}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent flex items-end p-4 z-[500]">
                    <div className="flex items-center gap-2 text-white">
                      <div className="w-8 h-8 rounded-full bg-[#10B981] flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M15 10l-3 3-3-3m0 0l3-3 3 3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                      <span className="text-[12px] font-bold uppercase tracking-wider">Tap to adjust location</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-semibold text-slate-600">Pincode</label>
                  <input 
                    type="text" 
                    className="w-full h-14 bg-white border-2 border-slate-400 rounded-lg px-4 text-[16px] font-bold text-slate-900 outline-none transition-all focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] placeholder:text-slate-300"
                    value={newSpot.pincode}
                    onChange={(e) => setNewSpot({...newSpot, pincode: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-semibold text-slate-600">Price (₹)</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    className="w-full h-14 bg-white border-2 border-slate-400 rounded-lg px-4 text-[16px] font-bold text-slate-900 outline-none transition-all focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] placeholder:text-slate-300"
                    value={newSpot.pricePerHour}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.length <= 3) setNewSpot({...newSpot, pricePerHour: val});
                    }}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-semibold text-slate-600">Slots</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    className="w-full h-14 bg-white border-2 border-slate-400 rounded-lg px-4 text-[16px] font-bold text-slate-900 outline-none transition-all focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] placeholder:text-slate-300"
                    value={newSpot.totalSlots}
                    onChange={(e) => setNewSpot({...newSpot, totalSlots: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-16">
          <button 
            onClick={handleSubmitSpot}
            className="w-full h-16 bg-[#10B981] text-white rounded-2xl text-[17px] font-bold shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:scale-[1.01] transition-all active:scale-[0.98] flex items-center justify-center"
          >
            Publish Listing
          </button>
        </div>
      </div>

      {/* Full-screen Map Picker Overlay */}
      {showMapPicker && (
        <div className="fixed inset-0 z-[110] bg-white flex flex-col animate-in fade-in zoom-in duration-300">
          <div className="px-6 h-20 flex items-center justify-between border-b border-slate-100 relative z-[1100] bg-white">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowMapPicker(false)}
                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M15 19l-7-7 7-7" /></svg>
              </button>
              <h3 className="font-bold text-slate-900">Select Precision Location</h3>
            </div>
            {!leafletLoaded && <div className="text-[12px] font-bold text-slate-400 animate-pulse">Loading maps...</div>}
          </div>
          
          <div className="flex-1 relative bg-slate-100 overflow-hidden">
             <LeafletMap 
                lat={newSpot.latitude} 
                lng={newSpot.longitude} 
                height="100%"
                isPicker={true}
                leafletLoaded={leafletLoaded}
                onConfirm={(lat, lng) => {
                  setNewSpot({...newSpot, latitude: lat, longitude: lng});
                  setShowMapPicker(false);
                }}
              />
          </div>
        </div>
      )}
    </div>
  );
};

const ProfileView = ({ 
  userData, 
  currentMode, 
  subView, 
  setSubView, 
  handleSwitchMode, 
  onBack,
  newSpot,
  setNewSpot,
  handleSubmitSpot,
  validationWarning,
  LeafletMap,
  leafletLoaded
}) => {
  const renderDetailView = () => {
    switch(subView) {
      case 'account':
        return (
          <div className="animate-in slide-in-from-right-4 duration-300">
            <MenuItem icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} label="Edit Profile" />
            <MenuItem icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v5m-3-3l3 3 3-3m-3-12V4m-3 3l3-3 3 3M4 12c0-4.42 3.58-8 8-8s8 3.58 8 8-3.58 8-8 8-8-3.58-8-8z" /></svg>} label="Update Phone" />
            <MenuItem icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17" /></svg>} label="Security" />
          </div>
        );
      case 'driver':
        return (
          <div className="animate-in slide-in-from-right-4 duration-300">
            <MenuItem icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} label="My Bookings" />
            <MenuItem icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>} label="Saved Spots" />
            <MenuItem icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} label="Booking History" />
            <MenuItem icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>} label="Payment Methods" />
          </div>
        );
      case 'owner':
        return (
          <div className="animate-in slide-in-from-right-4 duration-300">
            <MenuItem 
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>} 
              label="Post a Spot" 
              onClick={() => setSubView('add_spot')}
            />
            <MenuItem icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" /></svg>} label="My Spots" />
            <MenuItem icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 0-2 2v6a2 2 0 002 2h2a2 2 0 002-2z" /></svg>} label="Earnings Dashboard" />
            <MenuItem icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>} label="Booking Requests" />
          </div>
        );
      case 'add_spot':
        return (
          <AddSpotView 
            newSpot={newSpot} 
            setNewSpot={setNewSpot} 
            handleSubmitSpot={handleSubmitSpot} 
            validationWarning={validationWarning}
            LeafletMap={LeafletMap}
            leafletLoaded={leafletLoaded}
          />
        );
      case 'settings':
        return (
          <div className="animate-in slide-in-from-right-4 duration-300">
            <MenuItem icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5h12M9 3v2" strokeWidth="2" strokeLinecap="round" /></svg>} label="Language" rightElement={<span className="text-xs font-bold text-slate-400">English (US)</span>} />
            <MenuItem icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341" strokeWidth="2" strokeLinecap="round" /></svg>} label="Notifications" />
            <MenuItem icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4" strokeWidth="2" strokeLinecap="round" /></svg>} label="Appearance" rightElement={<div className="w-8 h-4 bg-slate-200 rounded-full relative"><div className="absolute left-1 top-1 w-2 h-2 bg-white rounded-full"></div></div>} />
          </div>
        );
      case 'support':
        return (
          <div className="animate-in slide-in-from-right-4 duration-300">
            <MenuItem icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" /></svg>} label="Terms & Conditions" />
            <MenuItem icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} label="Privacy Policy" />
            <MenuItem icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093" /></svg>} label="Help Center" />
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="flex-1 bg-white flex flex-col overflow-hidden animate-in fade-in duration-500">
      {!subView ? (
        <div className="relative h-[300px] w-full overflow-hidden bg-[#10B981]">
          {/* Background Image Container */}
          <div className="absolute inset-0 z-0">
            <img 
              src={profileBg} 
              alt="Profile Background" 
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/40"></div>
          </div>

          {/* Wavy Shape Overlay - Reference Style */}
          <div className="absolute bottom-[-1px] left-0 right-0 z-10 select-none pointer-events-none">
            <svg viewBox="0 0 400 60" className="w-full h-auto">
              <path 
                fill="white" 
                d="M0,60 L0,30 C50,0 100,50 150,30 C200,10 250,55 300,35 C350,15 400,45 400,30 L400,60 Z"
              ></path>
            </svg>
          </div>
        </div>
      ) : (
        <div className="pt-12 pb-6 px-8 flex items-center bg-white border-b border-slate-50 animate-in slide-in-from-left-2 duration-300">
          <button 
            onClick={() => setSubView(null)}
            className="w-6 h-6 flex items-center justify-center text-slate-800 hover:text-[#10B981] transition-colors -ml-1"
          >
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M15 19l-7-7 7-7" /></svg>
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {subView ? (
          <div className="px-2 py-4">
            {renderDetailView()}
          </div>
        ) : (
          <div className="px-0 pb-12">
            {/* User Identity Section - Heather Barnes Style */}
            <div className="px-8 pt-0 pb-8 animate-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                <svg className="w-3.5 h-3.5 text-[#10B981]" fill="currentColor" viewBox="0 0 20 20"><path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" /></svg>
                ZURICH, SWITZERLAND
              </div>
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                  {userData?.phone ? userData.phone.replace(/^\+91/, '') : '9876543210'}
                </h1>
                <button 
                  onClick={() => setSubView('account')}
                  className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#10B981] hover:bg-white transition-all active:scale-90"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
              </div>
              <p className="text-[12px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Model/Spot Owner</p>
            </div>

            <div className="h-[1px] bg-slate-100 mx-8 mb-6"></div>
            <MenuItem 
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" /><circle cx="12" cy="12" r="3" /></svg>} 
              label="Settings" 
              onClick={() => setSubView('settings')}
            />
            <MenuItem 
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>} 
              label="Payment methods" 
              onClick={() => setSubView('driver')}
            />
            <MenuItem 
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341" /></svg>} 
              label="Notifications" 
              onClick={() => setSubView('settings')}
            />
            <MenuItem 
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01" /></svg>} 
              label="Help Center" 
              onClick={() => setSubView('support')}
            />
            <MenuItem 
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>} 
              label="Give us feedback" 
              onClick={() => setSubView('support')}
            />
            <MenuItem 
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>} 
              label={`Switch to ${currentMode === 'DRIVER' ? 'Owner' : 'Driver'}`}
              onClick={handleSwitchMode}
              subtitle={`Current: ${currentMode}`}
            />

            <MenuItem 
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>} 
              label="Log out" 
              onClick={onBack}
              danger
            />

            <div className="py-10 flex flex-col items-center gap-1 opacity-20">
              <p className="text-[10px] font-black text-slate-400 tracking-[0.2em]">PARKBUDDY V1.0.2</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const HomeDashboard = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [userRole, setUserRole] = useState('DRIVER'); // 'DRIVER', 'OWNER', or 'BOTH'
  const [currentMode, setCurrentMode] = useState('DRIVER'); // 'DRIVER' or 'OWNER'
  const [subView, setSubView] = useState(null); // Tracking drill-down state
  const [userData, setUserData] = useState(null);
  const [ownerSpots, setOwnerSpots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [validationWarning, setValidationWarning] = useState(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [newSpot, setNewSpot] = useState({
    type: 'hourly',
    title: '',
    description: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    latitude: '',
    longitude: '',
    pricePerHour: '',
    totalSlots: '',
    images: [],
  });

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSwitchMode = async () => {
    if (currentMode === 'DRIVER') {
      try {
        setIsLoading(true);
        const res = await fetch("http://10.199.124.131:3008/api/user/become-owner", {
          method: "PATCH",
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setCurrentMode('OWNER');
          if (data.user) setUserData(data.user);
          fetchOwnerSpots(); // Fetch spots immediately on switch
        } else {
          setToast({ message: data.message || "Failed to switch mode", type: 'error' });
        }
      } catch (err) {
        setToast({ message: "Network error", type: 'error' });
      } finally {
        setIsLoading(false);
      }
    } else {
      setCurrentMode('DRIVER');
    }
  };

  const fetchOwnerSpots = async () => {
    try {
      const res = await fetch("http://10.199.124.131:3008/api/spaces/my-spaces", {
        credentials: "include"
      });
      const data = await res.json();
      if (data.success && data.data) {
        setOwnerSpots(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch owner spots:", err);
    }
  };

  // Also fetch owner spots on mount if already in OWNER mode
  useEffect(() => {
    if (currentMode === 'OWNER') {
      fetchOwnerSpots();
    }
  }, [currentMode]);

  const handleSubmitSpot = async (e) => {
    if (e) e.preventDefault();
    if (!userData?.id) {
      setToast({ message: "User not identified. Please wait.", type: 'error' });
      return;
    }

    // Validation
    if (!newSpot.title) {
      setValidationWarning("Please add a title for your spot");
      setTimeout(() => setValidationWarning(null), 3000);
      return;
    }

    const requiredFields = ['address', 'city', 'pincode', 'latitude', 'longitude', 'pricePerHour', 'totalSlots'];
    for (const field of requiredFields) {
      if (!newSpot[field]) {
        setToast({ message: `Please fill in ${field}`, type: 'error' });
        return;
      }
    }

      setIsLoading(true);
      try {
        const formData = new FormData();
        formData.append('title', newSpot.title);
        formData.append('description', newSpot.description || '');
        formData.append('address', newSpot.address);
        formData.append('city', newSpot.city);
        formData.append('state', newSpot.state || '');
        formData.append('pincode', newSpot.pincode);
        formData.append('latitude', newSpot.latitude);
        formData.append('longitude', newSpot.longitude);
        formData.append('pricePerHour', newSpot.pricePerHour);
        formData.append('totalSlots', newSpot.totalSlots);
        
        // Append multiple images with the specific name convention
        newSpot.images.forEach((image) => {
          formData.append('images', image);
        });

        const res = await fetch("http://10.199.124.131:3008/api/spaces", {
          method: "POST",
          credentials: "include",
          body: formData,
        });

      const data = await res.json();
      if (data.success) {
        setToast({ message: "Spot posted successfully!", type: 'success' });
        setSubView(null);
        // Reset form
        setNewSpot({
          type: 'hourly', title: '', description: '', address: '', city: '', state: '',
          pincode: '', latitude: '', longitude: '', pricePerHour: '', totalSlots: '', images: []
        });
      } else {
        setToast({ message: data.message || "Failed to post spot", type: 'error' });
      }
    } catch (err) {
      setToast({ message: "Network error", type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('http://10.199.124.131:3008/api/user/me', {
          credentials: 'include',
        });
        const data = await response.json();
        if (data.success) {
          setUserData(data.user);
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Dynamically load Leaflet Assets
  useEffect(() => {
    if (leafletLoaded) return;
    
    // CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'http://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // JS
    const script = document.createElement('script');
    script.src = 'http://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => setLeafletLoaded(true);
    document.head.appendChild(script);

    return () => {
      // Clean up if needed, though usually staying for the session is fine
    };
  }, []);

  const spots = [
    {
      id: 1,
      name: 'Illinois Center',
      address: '111 E Wacker Dr, Chicago.',
      price: '$5/hours',
      image: 'http://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=800',
      isEV: true,
      featured: true
    },
    {
      id: 2,
      name: 'AON Center',
      address: '386 E Lake St, Chicago.',
      price: '$7/hours',
      image: 'http://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&q=80&w=800',
      isEV: false
    },
    {
      id: 3,
      name: 'Millennium Park',
      address: '201 E Randolph St, Chicago.',
      price: '$6/hours',
      image: 'http://images.unsplash.com/photo-1517731047197-f62273050d4a?auto=format&fit=crop&q=80&w=800',
      isEV: true
    }
  ];



  return (
    <>
      {isLoading && <LoadingScreen />}
      {toast && <Toast message={toast.message} type={toast.type} />}
      <div className={`fixed inset-0 z-50 flex flex-col font-sans overflow-hidden transition-colors duration-500 bg-slate-100 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
      
      {activeTab === 'profile' ? (
        <ProfileView 
          userData={userData}
          currentMode={currentMode}
          subView={subView}
          setSubView={setSubView}
          handleSwitchMode={handleSwitchMode}
          onBack={onBack}
          newSpot={newSpot}
          setNewSpot={setNewSpot}
          handleSubmitSpot={handleSubmitSpot}
          validationWarning={validationWarning}
          LeafletMap={LeafletMap}
          leafletLoaded={leafletLoaded}
        />
      ) : (
        <>
          {/* White Road-Style Background Layer */}
          <div className="absolute inset-0 pointer-events-none opacity-40 z-0">
            <svg className="w-full h-full" viewBox="0 0 800 1200" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Main Road Network */}
              <path d="M0 250 L800 400 M0 600 L800 550 M0 950 L800 1100 M450 0 L400 1200 M150 0 L200 1200 M750 0 L700 1200" stroke="white" strokeWidth="12" className="opacity-80" />
              <path d="M0 250 L800 400 M0 600 L800 550 M0 950 L800 1100 M450 0 L400 1200 M150 0 L200 1200 M750 0 L700 1200" stroke="#F1F5F9" strokeWidth="2" strokeDasharray="10 10" />
              
              {/* Secondary Connectors */}
              <path d="M180 300 L430 350 M720 580 L420 560 M200 1000 L440 1050 M410 200 L440 200 M170 600 L230 600 M680 900 L740 900" stroke="white" strokeWidth="8" className="opacity-60" />
              <path d="M180 300 L430 350 M720 580 L420 560 M200 1000 L440 1050 M410 200 L440 200 M170 600 L230 600 M680 900 L740 900" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="5 5" />
              
              {/* Red Dotted Route Line - CONNECTING LOCATIONS */}
              <path d="M100 200 L300 350 L500 480 L700 650 L650 900" stroke="#EF4444" strokeWidth="3" strokeDasharray="6 6" className="opacity-60" />
              <circle cx="100" cy="200" r="5" fill="#EF4444" />
              <circle cx="650" cy="900" r="5" fill="#EF4444" />

              {/* City Grid Accents */}
              <rect x="50" y="100" width="40" height="40" rx="4" fill="white" className="opacity-30" />
              <rect x="550" y="200" width="30" height="60" rx="4" fill="white" className="opacity-30" />
              <rect x="300" y="800" width="60" height="30" rx="4" fill="white" className="opacity-30" />
            </svg>
          </div>

          {/* Header */}
          <header className="px-4 py-3 flex items-center justify-between shrink-0 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white shadow-sm rounded-full border border-slate-200/50 flex items-center justify-center text-[#10B981]">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Location</h4>
                <p className="text-[11px] font-bold text-slate-900">Santa Ana, Illinois 85486</p>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto pb-28 relative z-10 no-scrollbar">
            {/* Compact Hero */}
            <div className="mt-2 mb-8 px-4">
              <h1 className="text-4xl font-extrabold text-slate-900 leading-[1.1] mb-5">
                {currentMode === 'DRIVER' ? (
                  <>Find Your<br />Parking Space</>
                ) : (
                  <>Manage Your<br />Parking Spots</>
                )}
              </h1>
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Search address or spot..." 
                  className="w-full h-11 pl-5 pr-14 bg-white border border-slate-200/60 rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-[#10B981] transition-all placeholder:text-slate-400 text-xs font-semibold"
                />
                <button className="absolute right-1.5 top-1.5 w-8 h-8 bg-[#10B981] text-white rounded-lg shadow-sm flex items-center justify-center hover:bg-[#059669] transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Horizontal Scroll Cards Section */}
            {currentMode === 'DRIVER' && (
              <div className="mt-auto pb-6">
                <div className="flex flex-row gap-6 overflow-x-auto no-scrollbar py-4 px-6 snap-x">
                  {spots.map((spot) => (
                    <div 
                      key={spot.id} 
                      className={`relative shrink-0 w-[300px] snap-center rounded-[40px] p-2.5 transition-all shadow-xl hover:shadow-2xl overflow-hidden flex flex-col ${
                        spot.featured ? 'bg-[#FDE047]' : 'bg-white border border-slate-100'
                      }`}
                    >
                      {/* Image Section */}
                      <div className="relative h-56 w-full rounded-[32px] overflow-hidden">
                        <img src={spot.image} alt={spot.name} className="w-full h-full object-cover" />
                        
                        {/* EV Icon Overlay */}
                        {spot.isEV && (
                          <div className="absolute top-4 left-4 w-9 h-9 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-5 h-5 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M11 2L3 14h9l-1 8 8-12h-9l1-8z" />
                            </svg>
                          </div>
                        )}

                        {/* Price Bubble */}
                        <div className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-full shadow-lg">
                          <span className="text-xs font-black text-slate-900">{spot.price}</span>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-5 pt-4 flex flex-col gap-1 relative">
                        <h4 className="font-extrabold text-xl text-slate-900 truncate pr-16">{spot.name}</h4>
                        <p className="text-xs font-bold text-slate-500 opacity-90 truncate tracking-tight">{spot.address}</p>

                        {/* Circular Cutout for Action Button */}
                        <div className="absolute -bottom-3 -right-3 w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center z-10">
                          <button className="w-16 h-16 bg-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 border-[3px] border-white ring-4 ring-slate-100/50">
                            <svg className="w-8 h-8 rotate-45 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* Spacer for horizontal scroll padding end */}
                  <div className="shrink-0 w-8"></div>
                </div>
              </div>
            )}

            {/* Owner Dashboard Cards Section */}
            {currentMode === 'OWNER' && (
              <div className="mt-4 pt-4 pb-6 w-full">
                <h3 className="text-[18px] font-bold text-slate-900 mb-6 px-6 tracking-tight">My parking spots</h3>
                
                {/* Horizontally scrollable container for owner spots */}
                <div className="flex overflow-x-auto no-scrollbar gap-5 px-6 pb-8 snap-x snap-mandatory">
                  
                  {ownerSpots.length === 0 ? (
                    <div className="text-sm text-slate-500 w-full text-center py-10">No spots posted yet. Complete a listing to see it here!</div>
                  ) : (
                    ownerSpots.map((spot, index) => {
                      const displayImage = spot.images && spot.images.length > 0 
                        ? spot.images[0].imageUrl 
                        : "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&q=80&w=800";
                      
                      return (
                        <div key={spot.id || index} className="shrink-0 w-[280px] snap-center">
                          {/* Custom Owner Card (Yellow) scaled down slightly */}
                          <div className="relative w-full rounded-[32px] p-[8px] bg-[#FDE047] shadow-[0_15px_30px_-5px_rgba(253,224,71,0.3)] overflow-hidden flex flex-col group cursor-pointer transition-transform hover:scale-[1.01]">
                            {/* Image Section */}
                            <div className="relative h-48 w-full rounded-[24px] overflow-hidden bg-slate-200">
                              <img src={displayImage} alt={spot.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                              
                              {/* EV Charging Icon - Bottom Left */}
                              <div className="absolute bottom-3 left-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md">
                                <svg className="w-4 h-4 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M12 20V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v15"/><path d="M4 20h10"/><path d="M14 6h2a2 2 0 0 1 2 2v5c0 1.1-.9 2-2 2h-2"/><path d="M18 10h1a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-1"/><path d="M8 10l2-3h-2l-2 3h2l2 3h-2l-2-3"/>
                                </svg>
                              </div>

                              {/* Price Tag - Bottom Right */}
                              <div className="absolute bottom-3 right-3 bg-white text-slate-900 px-3 py-[7px] rounded-full font-extrabold text-[13px] shadow-md leading-none tracking-tight">
                                ${spot.pricePerHour}/hours
                              </div>
                            </div>

                            {/* Content Section */}
                            <div className="pl-3 pt-3.5 pb-4 flex flex-col gap-0.5 relative">
                              <h4 className="font-bold text-[18px] text-slate-900 tracking-tight pr-14 leading-[1.15] truncate">{spot.title}</h4>
                              <p className="text-[13px] font-medium text-amber-900/70 truncate pr-14 tracking-tight mt-0.5">Slots limit: {spot.availableSlots || spot.totalSlots || 0}</p>

                              {/* Circular Cutout for Action Button matching background (slate-100) */}
                              <div className="absolute -bottom-3 -right-3 w-[85px] h-[85px] bg-slate-100 rounded-full flex items-center justify-center z-10 transition-colors duration-300">
                                <button className="w-12 h-12 bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all relative -top-1 -left-1">
                                  <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="6" y1="18" x2="18" y2="6" />
                                    <polyline points="9 6 18 6 18 15" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Spacer for horizontal scroll padding end */}
                  <div className="shrink-0 w-8"></div>
                </div>
              </div>
            )}

          </main>

          {/* Floating Action Button for Owner Mode */}
          {currentMode === 'OWNER' && activeTab === 'home' && (
            <button 
              onClick={() => {
                setSubView('add_spot');
              }}
              className="fixed bottom-24 right-8 w-14 h-14 bg-[#10B981] text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-[70] animate-in slide-in-from-bottom-4 duration-500"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}

          {/* Add Spot View overlay when in home tab */}
          {subView === 'add_spot' && activeTab === 'home' && (
            <div className="fixed inset-0 z-[80] bg-white overflow-y-auto">
              
              {/* Floating Back Button - Positioned over the image inside AddSpotView */}
              <div className="absolute top-4 left-4 z-[100]">
                <button 
                  onClick={() => setSubView(null)}
                  className="w-10 h-10 flex items-center justify-center text-slate-800 bg-white/50 backdrop-blur-md rounded-full shadow-sm hover:bg-white hover:text-[#10B981] transition-all"
                >
                  <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M15 19l-7-7 7-7" /></svg>
                </button>
              </div>


              <AddSpotView 
                newSpot={newSpot} 
                setNewSpot={setNewSpot} 
                handleSubmitSpot={handleSubmitSpot} 
                validationWarning={validationWarning}
                LeafletMap={LeafletMap}
                leafletLoaded={leafletLoaded}
              />
            </div>
          )}
        </>
      )}

      {/* Super Compact Bottom Nav */}
      <div className="fixed bottom-6 left-0 right-0 px-8 z-[60] pointer-events-none">
        <nav className="max-w-[280px] mx-auto h-14 bg-white/95 backdrop-blur-lg rounded-full flex items-center justify-around px-2 pointer-events-auto border border-slate-200/60 transition-all duration-500 shadow-[0_15px_40px_rgba(0,0,0,0.1)]">
          {[
            { id: 'home', icon: <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />, isStroke: false },
            { id: 'heart', icon: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />, isStroke: true },
            { id: 'bookmark', icon: <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />, isStroke: true },
            { id: 'profile', icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>, isStroke: true }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                activeTab === item.id 
                  ? 'bg-[#10B981] text-white shadow-lg shadow-[#10B981]/30' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill={item.isStroke ? "none" : "currentColor"} stroke={item.isStroke ? "currentColor" : "none"} strokeWidth={item.isStroke ? "2.5" : "0"}>
                {item.icon}
              </svg>
            </button>
          ))}
        </nav>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in-from-bottom {
          from { transform: translateY(1rem); }
          to { transform: translateY(0); }
        }
        .animate-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        .slide-in-from-bottom-4 {
          animation: slide-in-from-bottom 0.5s ease-out forwards;
        }
      `}</style>
    </div>
    </>
  );
};

export default HomeDashboard;
