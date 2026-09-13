"use client";

import React, { useState } from 'react';
import {
    ArrowLeft,
    Share,
    Heart,
    Star,
    MapPin,
    MessageCircle,
    Navigation,
    Image as ImageIcon,
    CheckCircle2,
    Clock,
    Sparkles
} from 'lucide-react';

export default function PremiumBusinessPWA() {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className="relative min-h-screen bg-zinc-50 pb-28 md:max-w-md md:mx-auto md:shadow-2xl overflow-hidden selection:bg-indigo-100">

            {/* 1. Immersive Hero with Glassmorphism Header */}
            <div className="relative h-96 w-full bg-zinc-900">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80&w=1000"
                        alt="Interior"
                        className="w-full h-full object-cover opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>
                </div>

                {/* Floating App Header */}
                <header className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-5 pt-8">
                    <button className="p-3 bg-white/20 backdrop-blur-xl rounded-full text-white shadow-sm active:scale-95 transition-all border border-white/10">
                        <ArrowLeft size={22} strokeWidth={2.25} />
                    </button>
                    <div className="flex gap-3">
                        <button className="p-3 bg-white/20 backdrop-blur-xl rounded-full text-white shadow-sm active:scale-95 transition-all border border-white/10">
                            <Share size={20} strokeWidth={2.5} />
                        </button>
                        <button className="p-3 bg-white/20 backdrop-blur-xl rounded-full text-white shadow-sm active:scale-95 transition-all border border-white/10">
                            <Heart size={20} strokeWidth={2.5} />
                        </button>
                    </div>
                </header>

                {/* Gallery Badge */}
                <button className="absolute bottom-16 right-5 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-medium border border-white/20">
                    <ImageIcon size={14} />
                    12 Photos
                </button>
            </div>

            {/* 2. Floating Business Card (Overlaps Hero) */}
            <div className="relative z-30 -mt-10 mx-4 bg-white rounded-[2rem] shadow-xl shadow-zinc-200/50 p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-1.5 mb-1">
                            <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
                                Aura Aesthetics
                            </h1>
                            <CheckCircle2 size={18} className="text-indigo-600 fill-indigo-100" />
                        </div>
                        <p className="text-zinc-500 text-sm font-medium">Premium Medspa & Wellness</p>
                    </div>

                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 bg-zinc-900 text-white px-2.5 py-1 rounded-xl text-sm font-bold shadow-sm">
                            <Star size={14} className="fill-amber-400 text-amber-400" />
                            4.9
                        </div>
                        <span className="text-zinc-400 text-xs mt-1 underline decoration-zinc-200">(128 reviews)</span>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center gap-4 mt-6 pt-6 border-t border-zinc-100">
                    <div className="flex items-center gap-2 text-zinc-600">
                        <MapPin size={16} className="text-zinc-400" />
                        <span className="text-sm font-medium">1.2 mi</span>
                    </div>
                    <div className="w-1 h-1 bg-zinc-300 rounded-full"></div>
                    <div className="flex items-center gap-2 text-zinc-600">
                        <Clock size={16} className="text-zinc-400" />
                        <span className="text-sm font-medium text-emerald-600">Open until 9 PM</span>
                    </div>
                </div>
            </div>

            {/* 3. Segmented Navigation */}
            <div className="flex px-6 mt-6 mb-4 gap-6 border-b border-zinc-200">
                {['overview', 'services', 'reviews'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 text-sm font-bold capitalize transition-colors relative ${activeTab === tab ? 'text-zinc-900' : 'text-zinc-400'
                            }`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 rounded-t-full"></div>
                        )}
                    </button>
                ))}
            </div>

            {/* 4. Tab Content: Featured Services */}
            <div className="px-5 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={18} className="text-indigo-600" />
                    <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Signature Treatments</h2>
                </div>

                {/* Premium Service Cards */}
                {[1, 2].map((item) => (
                    <div key={item} className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm border border-zinc-100">
                        <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-zinc-100">
                            <img
                                src={`https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=300&h=300&sig=${item}`}
                                alt="Service"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex flex-col justify-center flex-1">
                            <h3 className="font-bold text-zinc-900 text-base leading-tight mb-1">HydraFacial Glow</h3>
                            <p className="text-zinc-500 text-xs line-clamp-2 mb-2">A multi-step treatment to cleanse, exfoliate, and extract impurities.</p>
                            <div className="flex justify-between items-center mt-auto">
                                <span className="font-extrabold text-zinc-900">$195</span>
                                <button className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg active:scale-95 transition-transform">
                                    Book
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 5. Floating Glassmorphism Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-40 p-4 pb-safe md:max-w-md md:mx-auto">
                <div className="flex gap-3 bg-white/80 backdrop-blur-xl p-2 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white">
                    <button className="flex items-center justify-center w-14 h-14 bg-zinc-100 rounded-full text-zinc-900 active:scale-95 transition-transform shrink-0">
                        <MessageCircle size={22} />
                    </button>
                    <button className="flex items-center justify-center w-14 h-14 bg-zinc-100 rounded-full text-zinc-900 active:scale-95 transition-transform shrink-0">
                        <Navigation size={22} />
                    </button>
                    <button className="flex-1 bg-zinc-900 text-white font-bold text-base rounded-full shadow-lg shadow-zinc-900/30 active:scale-95 transition-transform flex items-center justify-center">
                        Book Appointment
                    </button>
                </div>
            </div>

        </div>
    );
}
