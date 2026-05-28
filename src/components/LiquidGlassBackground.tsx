"use client";

import React from 'react';

export function LiquidGlassBackground() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      
      {/* Mesh de Degradê fluido de fundo adaptável */}
      <div className="absolute inset-0 bg-[#f4f4f7] dark:bg-[#020204] transition-colors duration-500" />

      {/* Orbes de luz coloridos líquidos adaptáveis (Animação totalmente desativada no desktop/tablet) */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] max-w-[600px] rounded-full bg-indigo-400/15 dark:bg-indigo-700/15 mix-blend-multiply dark:mix-blend-screen filter blur-[80px] animate-orb-1 md:animate-none lg:animate-none opacity-80" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[70vw] h-[70vw] max-w-[700px] rounded-full bg-violet-400/12 dark:bg-violet-800/10 mix-blend-multiply dark:mix-blend-screen filter blur-[100px] animate-orb-2 md:animate-none lg:animate-none opacity-70" />
      <div className="absolute top-[35%] right-[-5%] w-[45vw] h-[45vw] max-w-[450px] rounded-full bg-cyan-300/15 dark:bg-cyan-700/10 mix-blend-multiply dark:mix-blend-screen filter blur-[70px] animate-orb-3 md:animate-none lg:animate-none opacity-60" />
      <div className="absolute bottom-[20%] left-[-15%] w-[55vw] h-[55vw] max-w-[550px] rounded-full bg-fuchsia-300/12 dark:bg-fuchsia-900/10 mix-blend-multiply dark:mix-blend-screen filter blur-[90px] animate-orb-1 md:animate-none lg:animate-none opacity-70" />

      {/* Padrão Crystalline de Vidro Refletivo no modo claro */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5 opacity-50 dark:opacity-0" />

      {/* Textura sofisticada de granulação sobre o vidro */}
      <div className="absolute inset-0 noise-overlay mix-blend-overlay" />

      {/* Gradiente de profundidade inferior para suavizar o visual */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#f4f4f7] dark:from-[#020204] to-transparent transition-colors duration-500" />
    </div>
  );
}