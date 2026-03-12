import React, { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, Sparkles, Check } from "lucide-react";

/**
 * Onboarding Tour Component
 * Provides step-by-step guidance for new users
 */
const OnboardingTour = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const steps = [
    {
      title: "Welcome to Your Accounting Dashboard! 🎉",
      description:
        "Let's take a quick tour to help you get started. This will only take a minute!",
      image: "💰",
      highlights: [
        "Track your finances week by week",
        "Manage multiple accounts easily",
        "Collaborate with team members",
        "Schedule shifts and track activities",
      ],
    },
    {
      title: "Financial Overview Cards",
      description: "At the top of your dashboard, you'll see three main cards:",
      image: "📊",
      highlights: [
        "Bank Balance - View and manage linked bank accounts",
        "Cash Box - Track your current cash on hand",
        "Total Expenses - See all expenses for the current week",
      ],
    },
    {
      title: "Daily Breakdown",
      description: "Below the overview, you'll find your daily activities:",
      image: "📅",
      highlights: [
        "Click any day to expand and see details",
        "Add expenses, shifts, and activities",
        "View check-ins, work logs, and more",
        "Everything is organized by date",
      ],
    },
    {
      title: "Schedule Management",
      description: "Switch to Schedule view to manage shifts and time-off:",
      image: "🗓️",
      highlights: [
        "Create and assign shifts to team members",
        "Track check-ins and check-outs",
        "Manage extra hours and time-off requests",
        "View reports and analytics",
      ],
    },
    {
      title: "Permissions & Roles",
      description: "Control what team members can do:",
      image: "🔐",
      highlights: [
        "Invite members with specific roles",
        "Set view-only or full access permissions",
        "Manage multiple accounts separately",
        "Protect sensitive financial data",
      ],
    },
    {
      title: "You're All Set! 🚀",
      description:
        "You're ready to start tracking your finances. Need help? Look for the (?) icons throughout the app for quick tips!",
      image: "✨",
      highlights: [
        "Hover over any (?) icon for instant help",
        "Check Settings for customization options",
        "Use keyboard shortcuts for faster navigation",
        "Visit the Help Center anytime you need support",
      ],
    },
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem("onboardingCompleted", "true");
    onComplete?.();
  };

  const handleSkip = () => {
    setIsVisible(false);
    localStorage.setItem("onboardingSkipped", "true");
    onSkip?.();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-6 h-6" />
              <span className="text-sm font-semibold uppercase tracking-wider">
                Quick Start Guide
              </span>
            </div>
            <h2 className="text-3xl font-bold">{currentStepData.title}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Progress */}
          <div className="flex gap-2 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full transition-all ${
                  index === currentStep
                    ? "bg-gradient-to-r from-blue-600 to-purple-600"
                    : index < currentStep
                      ? "bg-emerald-500"
                      : "bg-slate-200"
                }`}
              />
            ))}
          </div>

          {/* Step Content */}
          <div className="text-center mb-8">
            <div className="text-7xl mb-4">{currentStepData.image}</div>
            <p className="text-slate-700 text-lg leading-relaxed mb-6">
              {currentStepData.description}
            </p>
          </div>

          {/* Highlights */}
          <div className="space-y-3 mb-8">
            {currentStepData.highlights.map((highlight, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="text-slate-700 font-medium">{highlight}</span>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            <button
              onClick={handlePrevious}
              disabled={isFirstStep}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                isFirstStep
                  ? "text-slate-400 cursor-not-allowed"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            <div className="text-sm font-medium text-slate-500">
              Step {currentStep + 1} of {steps.length}
            </div>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              {isLastStep ? "Get Started" : "Next"}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
