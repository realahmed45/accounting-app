import { useState, useEffect } from "react";
import api from "../services/api";

export const useSubscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch if user is authenticated (has a token)
    // Without this guard, unauthenticated page loads hit the API, get a 401,
    // and the interceptor does window.location.href="/" causing an infinite reload loop.
    const token = localStorage.getItem("token");
    if (token) {
      fetchSubscription();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await api.get("/subscription");
      if (response.data.success) {
        setSubscription(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanLimits = () => {
    if (!subscription) return null;

    const limits = {
      free: {
        accounts: 1,
        expenses: 50,
        teamMembers: 0,
        storage: 50, // MB
        scheduling: false,
        advancedReports: false,
      },
      professional: {
        accounts: 5,
        expenses: Infinity,
        teamMembers: 3,
        storage: 500, // MB
        scheduling: true,
        schedulingShifts: 50, // per month
        advancedReports: false,
      },
      business: {
        accounts: 20,
        expenses: Infinity,
        teamMembers: Infinity,
        storage: 2048, // MB
        scheduling: true,
        schedulingShifts: Infinity,
        advancedReports: true,
      },
      enterprise: {
        accounts: Infinity,
        expenses: Infinity,
        teamMembers: Infinity,
        storage: Infinity,
        scheduling: true,
        schedulingShifts: Infinity,
        advancedReports: true,
      },
    };

    return limits[subscription.currentPlan] || limits.free;
  };

  const canCreateAccount = () => {
    // Allow when subscription hasn't loaded yet — fail open so the
    // first-account creation flow is never blocked on load timing.
    if (!subscription) return true;
    const limits = getPlanLimits();
    if (!limits) return true;
    return subscription.usage.accountsCount < limits.accounts;
  };

  const canAddExpense = () => {
    const limits = getPlanLimits();
    if (!limits || !subscription) return false;
    if (limits.expenses === Infinity) return true;
    return subscription.usage.expensesThisMonth < limits.expenses;
  };

  const canInviteMember = () => {
    const limits = getPlanLimits();
    if (!limits || !subscription) return false;
    if (limits.teamMembers === Infinity) return true;
    return subscription.usage.teamMembersCount < limits.teamMembers;
  };

  const canUseScheduling = () => {
    const limits = getPlanLimits();
    if (!limits) return false;
    return limits.scheduling;
  };

  const canUseAdvancedReports = () => {
    const limits = getPlanLimits();
    if (!limits) return false;
    return limits.advancedReports;
  };

  const getExpensesRemaining = () => {
    const limits = getPlanLimits();
    if (!limits || !subscription) return 0;
    if (limits.expenses === Infinity) return Infinity;
    return Math.max(0, limits.expenses - subscription.usage.expensesThisMonth);
  };

  const getAccountsRemaining = () => {
    const limits = getPlanLimits();
    if (!limits || !subscription) return 0;
    if (limits.accounts === Infinity) return Infinity;
    return Math.max(0, limits.accounts - subscription.usage.accountsCount);
  };

  const isFreePlan = () => {
    return subscription?.currentPlan === "free";
  };

  return {
    subscription,
    loading,
    planLimits: getPlanLimits(),
    canCreateAccount,
    canAddExpense,
    canInviteMember,
    canUseScheduling,
    canUseAdvancedReports,
    getExpensesRemaining,
    getAccountsRemaining,
    isFreePlan,
    refreshSubscription: fetchSubscription,
  };
};
