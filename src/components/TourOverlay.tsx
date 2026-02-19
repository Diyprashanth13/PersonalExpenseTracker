
import React, { useEffect, useState, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { useTour } from '../context/TourContext';
import { X, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

export const TourOverlay: React.FC = () => {
    const { isTourActive, currentStepIndex, steps, nextStep, prevStep, skipTour, finishTour } = useTour();
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [tooltipStyles, setTooltipStyles] = useState<React.CSSProperties>({ opacity: 0 });
    const tooltipRef = useRef<HTMLDivElement>(null);
    const portalRoot = document.getElementById('portal-root');

    // Safety: Get current step but handle undefined cases gracefully
    const currentStep = useMemo(() => steps[currentStepIndex] || null, [steps, currentStepIndex]);

    // Update target position
    useEffect(() => {
        if (!isTourActive || !currentStep) {
            setTargetRect(null);
            return;
        }

        const updatePosition = () => {
            if (!currentStep) return;
            const selectors = currentStep.target.split(',').map(s => s.trim());
            let element: HTMLElement | null = null;

            for (const selector of selectors) {
                try {
                    const el = document.querySelector(selector) as HTMLElement;
                    if (el) {
                        const style = window.getComputedStyle(el);
                        const rect = el.getBoundingClientRect();
                        if (style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0) {
                            element = el;
                            break;
                        }
                    }
                } catch (e) {
                    console.warn(`Tour: Invalid selector ${selector}`);
                }
            }

            if (element) {
                let isFixed = false;
                let parent: HTMLElement | null = element;
                while (parent && parent !== document.body) {
                    if (window.getComputedStyle(parent).position === 'fixed') {
                        isFixed = true;
                        break;
                    }
                    parent = parent.parentElement as HTMLElement;
                }

                if (!isFixed) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                }

                const rect = element.getBoundingClientRect();
                setTargetRect(rect);
            } else {
                setTargetRect(null);
            }
        };

        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, { passive: true });
        const timer = setInterval(updatePosition, 300);

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition);
            clearInterval(timer);
        };
    }, [isTourActive, currentStepIndex, steps, currentStep]);

    // Calculate tooltip position
    useEffect(() => {
        if (!targetRect || !tooltipRef.current || !currentStep) {
            setTooltipStyles(prev => ({ ...prev, opacity: 0 }));
            return;
        }

        const tooltip = tooltipRef.current.getBoundingClientRect();
        const padding = 20;
        let top = 0;
        let left = 0;

        const spaceAbove = targetRect.top;
        const spaceBelow = window.innerHeight - targetRect.bottom;

        // Positioning logic
        if (currentStep.position === 'center') {
            top = (window.innerHeight / 2) - (tooltip.height / 2);
            left = (window.innerWidth / 2) - (tooltip.width / 2);
        } else if (spaceBelow > tooltip.height + padding * 2) {
            top = targetRect.bottom + padding;
            left = Math.max(padding, Math.min(window.innerWidth - tooltip.width - padding, targetRect.left + (targetRect.width / 2) - (tooltip.width / 2)));
        } else if (spaceAbove > tooltip.height + padding * 2) {
            top = targetRect.top - tooltip.height - padding;
            left = Math.max(padding, Math.min(window.innerWidth - tooltip.width - padding, targetRect.left + (targetRect.width / 2) - (tooltip.width / 2)));
        } else {
            // Fallback: Overlay on top of screen but centered horizontally
            top = padding + 60; // Offset for mobile headers
            left = (window.innerWidth / 2) - (tooltip.width / 2);
        }

        setTooltipStyles({
            top: `${top}px`,
            left: `${left}px`,
            opacity: 1,
            transform: 'translateY(0) scale(1)',
        });
    }, [targetRect, currentStepIndex, currentStep]);

    // Final stability checks
    if (!isTourActive || !currentStep || !portalRoot) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[10000] pointer-events-none select-none">
            {/* Dark backdrop with hole */}
            <div
                className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px] transition-all duration-500 ease-in-out"
                style={{
                    clipPath: targetRect
                        ? `polygon(0% 0%, 0% 100%, ${targetRect.left}px 100%, ${targetRect.left}px ${targetRect.top}px, ${targetRect.right}px ${targetRect.top}px, ${targetRect.right}px ${targetRect.bottom}px, ${targetRect.left}px ${targetRect.bottom}px, ${targetRect.left}px 100%, 100% 100%, 100% 0%)`
                        : 'none',
                    pointerEvents: 'auto'
                }}
                onClick={skipTour}
            />

            {/* Highlight glow & border */}
            {targetRect && (
                <div
                    className="absolute rounded-xl transition-all duration-300 pointer-events-none ring-4 ring-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                    style={{
                        top: targetRect.top - 4,
                        left: targetRect.left - 4,
                        width: targetRect.width + 8,
                        height: targetRect.height + 8,
                    }}
                >
                    <div className="absolute inset-0 border-2 border-emerald-400 rounded-xl animate-pulse" />
                </div>
            )}

            {/* Tooltip Card */}
            <div
                ref={tooltipRef}
                className="absolute w-[calc(100vw-32px)] max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100 dark:border-slate-800 p-6 pointer-events-auto transition-all duration-500 ease-out transform"
                style={tooltipStyles}
            >
                <button
                    onClick={skipTour}
                    className="absolute top-5 right-5 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-full transition-all"
                >
                    <X size={18} />
                </button>

                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700 ease-out"
                                style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                            />
                        </div>
                        <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 tabular-nums uppercase tracking-widest whitespace-nowrap">
                            {currentStepIndex + 1} / {steps.length}
                        </span>
                    </div>

                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-3">
                        {currentStep.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                        {currentStep.description}
                    </p>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                        onClick={prevStep}
                        disabled={currentStepIndex === 0}
                        className="flex-1 py-3.5 px-4 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-20 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 border border-slate-100 dark:border-transparent"
                    >
                        <ChevronLeft size={18} />
                        Back
                    </button>

                    {currentStepIndex === steps.length - 1 ? (
                        <button
                            onClick={finishTour}
                            className="flex-[1.5] py-3.5 px-4 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <CheckCircle2 size={18} />
                            Finish Tour
                        </button>
                    ) : (
                        <button
                            onClick={nextStep}
                            className="flex-[1.5] py-3.5 px-4 bg-slate-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-slate-200 dark:shadow-none hover:translate-x-1 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            Continue
                            <ChevronRight size={18} />
                        </button>
                    )}
                </div>
            </div>
        </div>,
        portalRoot
    );
};
