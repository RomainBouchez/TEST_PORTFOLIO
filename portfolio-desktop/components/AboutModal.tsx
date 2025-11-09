'use client';

import { useState, useRef, useEffect } from 'react';

interface AboutModalProps {
  onClose: () => void;
  initialPosition?: { x: number; y: number };
}

export default function AboutModal({ onClose, initialPosition = { x: 150, y: 150 } }: AboutModalProps) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const windowRef = useRef<HTMLDivElement>(null);
  const initialMousePosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && windowRef.current) {
        // Calculate movement distance from initial mouse position
        const deltaX = Math.abs(e.clientX - initialMousePosRef.current.x);
        const deltaY = Math.abs(e.clientY - initialMousePosRef.current.y);
        
        // If moved more than 5 pixels, consider it a drag
        if (deltaX > 5 || deltaY > 5) {
          setHasMoved(true);
        }
        
        // Update window position
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      // Reset after a short delay to allow click detection
      setTimeout(() => {
        setHasMoved(false);
      }, 150);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    // Stop propagation to prevent backdrop click
    e.stopPropagation();
    if (windowRef.current) {
      const rect = windowRef.current.getBoundingClientRect();
      initialMousePosRef.current = { x: e.clientX, y: e.clientY };
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
      setHasMoved(false);
    }
  };

  const handleBackdropMouseDown = (e: React.MouseEvent) => {
    // Only close if clicking directly on backdrop (not on window) and not dragging
    if (e.target === e.currentTarget && !isDragging) {
      // Use a small delay to check if this was a click (not a drag start)
      const mouseDownTime = Date.now();
      const mouseDownX = e.clientX;
      const mouseDownY = e.clientY;
      
      const handleMouseUp = (upEvent: MouseEvent) => {
        const mouseUpTime = Date.now();
        const deltaX = Math.abs(upEvent.clientX - mouseDownX);
        const deltaY = Math.abs(upEvent.clientY - mouseDownY);
        const timeDiff = mouseUpTime - mouseDownTime;
        
        // Only close if it was a quick click (not a drag) on the backdrop
        if (timeDiff < 300 && deltaX < 5 && deltaY < 5 && upEvent.target === e.target) {
          onClose();
        }
        
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  const handleWindowMouseDown = (e: React.MouseEvent) => {
    // Stop propagation to prevent backdrop from closing when interacting with window
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        ref={windowRef}
        onMouseDown={handleWindowMouseDown}
        className="bg-[#F5F5F7] rounded-xl overflow-hidden max-w-5xl w-full max-h-[90vh] flex flex-col"
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35), 0 15px 25px rgba(0, 0, 0, 0.25), 0 5px 10px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* Window Header - macOS style */}
        <div
          className="relative bg-[#E8E8E8] px-3 py-2.5 flex items-center gap-2 cursor-move border-b border-[#D1D1D6]"
          onMouseDown={handleHeaderMouseDown}
        >

        <div className="flex items-center gap-2">
          {/* Bouton Fermer */}
            <button
              onClick={onClose}
              className="group flex h-3 w-3 items-center justify-center rounded-full bg-[#FF5F56] p-0 transition-colors hover:bg-[#FF3B30]" /* On enlève "relative" ici */
              aria-label="Close"
            >
                {/* Pseudo-élément pour étendre la zone de clic */}
                <span className="absolute -inset-3"></span>
              </button>
            </div>

            {/* Bouton Minimiser */}
            <button
              className="group flex h-3 w-3 items-center justify-center rounded-full bg-[#FFBD2E] p-0 transition-colors hover:bg-[#FFB302]"
              aria-label="Minimize"
            >
            </button>

            {/* Bouton Agrandir */}
            <button
              className="group flex h-3 w-3 items-center justify-center rounded-full bg-[#27C93F] p-0 transition-colors hover:bg-[#1AAD34]"
              aria-label="Maximize"
            >
            </button>
          </div>

        {/* Toolbar */}
        <div className="bg-[#F5F5F7] px-4 py-2 flex items-center gap-2 border-b border-[#D1D1D6]">
          {/* Left side toolbar icons */}
          <div className="flex items-center gap-3">
            <button className="text-gray-600 hover:text-gray-900 transition-colors" title="List view">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
            <button className="text-gray-600 hover:text-gray-900 transition-colors" title="Grid view">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
            </button>
            <button className="text-gray-600 hover:text-gray-900 transition-colors" title="Back">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          </div>

          {/* Right side toolbar icons */}
          <div className="ml-auto flex items-center gap-3">
            <button className="text-gray-600 hover:text-gray-900 transition-colors" title="Delete">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
            <button className="text-gray-600 hover:text-gray-900 transition-colors" title="Edit">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button className="text-gray-600 hover:text-gray-900 transition-colors" title="Text">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="4 7 4 4 20 4 20 7" />
                <line x1="9" y1="20" x2="15" y2="20" />
                <line x1="12" y1="4" x2="12" y2="20" />
              </svg>
            </button>
          </div>
        </div>

        {/* Main Content Area - Sidebar + Notes */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-56 bg-[#E8E8EA] border-r border-[#D1D1D6] overflow-y-auto">
            {/* iCloud Section */}
            <div className="p-3">
              <div className="text-xs text-gray-500 font-semibold mb-2 px-2">iCloud</div>
              <div className="space-y-1">
                <div className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-[#D1D1D6]/60 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">📁</span>
                    <span className="text-sm text-gray-800">All iCloud</span>
                  </div>
                  <span className="text-xs text-gray-500">7</span>
                </div>
                <div className="flex items-center justify-between px-2 py-1.5 rounded bg-[#FBD38D] cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-600">📄</span>
                    <span className="text-sm text-gray-900 font-medium">Notes</span>
                  </div>
                  <span className="text-xs text-gray-700">1</span>
                </div>
                <div className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-[#D1D1D6]/60 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">📁</span>
                    <span className="text-sm text-gray-800">Projects</span>
                  </div>
                  <span className="text-xs text-gray-500">3</span>
                </div>
                <div className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-[#D1D1D6]/60 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">📁</span>
                    <span className="text-sm text-gray-800">Personal</span>
                  </div>
                  <span className="text-xs text-gray-500">2</span>
                </div>
              </div>
            </div>

            {/* On My Mac Section */}
            <div className="p-3 border-t border-[#D1D1D6]">
              <div className="text-xs text-gray-500 font-semibold mb-2 px-2">On My Mac</div>
              <div className="space-y-1">
                <div className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-[#D1D1D6]/60 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">📄</span>
                    <span className="text-sm text-gray-800">Notes</span>
                  </div>
                  <span className="text-xs text-gray-500">1</span>
                </div>
              </div>
            </div>
          </div>

          {/* Note Content */}
          <div className="flex-1 overflow-y-auto bg-white">
            <div className="max-w-3xl mx-auto p-12">
              {/* Note Title */}
              <h1 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">
                À propos de moi
              </h1>

              {/* Note Date */}
              <div className="text-sm text-gray-400 mb-8">
                {new Date().toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>

              {/* Bio Content */}
              <div className="space-y-6 text-[15px] leading-relaxed text-gray-800">
                <p>
                  Je suis <strong>Romain Bouchez</strong>, étudiant en école d'ingénieur à l'<strong>ESIEA</strong> avec une forte appétence pour l'<strong>Intelligence Artificielle</strong> et le <strong>Machine Learning</strong>. Mon parcours académique m'a permis d'acquérir de solides bases en programmation (Python, C), en algorithmique et en analyse de données.
                </p>
                <p>
                  Fasciné par la capacité des modèles à extraire des tendances et à automatiser des tâches complexes, je souhaite orienter ma carrière vers l'ingénierie IA. Je suis actuellement à la recherche d'un stage stimulant où je pourrais mettre en pratique mes connaissances et contribuer à des projets ayant un impact réel.
                </p>
                <p>
                  Curieux et autonome, mon objectif est de rejoindre une équipe innovante pour développer des solutions intelligentes, tout en continuant à apprendre et à repousser les limites de mes compétences techniques.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
