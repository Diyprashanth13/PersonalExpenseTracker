
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { TOUR_STEPS, TourStep } from '../constants/tourSteps';
import { useAuth } from './AuthContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

interface TourContextType {
    isTourActive: boolean;
    currentStepIndex: number;
    steps: TourStep[];
    startTour: (force?: boolean) => void;
    nextStep: () => void;
    prevStep: () => void;
    skipTour: () => void;
    finishTour: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [isTourActive, setIsTourActive] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    const startTour = useCallback((force: boolean = false) => {
        setCurrentStepIndex(0);
        setIsTourActive(true);
    }, []);

    const updateOnboardingStatus = useCallback(async () => {
        if (!user) return;
        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                hasCompletedOnboarding: true,
                updatedAt: Date.now()
            });
            console.log('✅ Tour: Onboarding status updated in Firestore');
        } catch (err) {
            console.error('❌ Tour: Failed to update onboarding status', err);
        }
    }, [user]);

    const finishTour = useCallback(() => {
        setIsTourActive(false);
        updateOnboardingStatus();
    }, [updateOnboardingStatus]);

    const skipTour = useCallback(() => {
        setIsTourActive(false);
        updateOnboardingStatus();
    }, [updateOnboardingStatus]);

    const nextStep = useCallback(() => {
        if (currentStepIndex < TOUR_STEPS.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            finishTour();
        }
    }, [currentStepIndex, finishTour]);

    const prevStep = useCallback(() => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        }
    }, [currentStepIndex]);

    return (
        <TourContext.Provider value={{
            isTourActive,
            currentStepIndex,
            steps: TOUR_STEPS,
            startTour,
            nextStep,
            prevStep,
            skipTour,
            finishTour
        }}>
            {children}
        </TourContext.Provider>
    );
};

export const useTour = () => {
    const context = useContext(TourContext);
    if (context === undefined) {
        throw new Error('useTour must be used within a TourProvider');
    }
    return context;
};
