import React, { createContext, useContext, useState, useEffect } from "react";
import { accountService } from "../services/api";
import { useAuth } from "./AuthContext";

const AccountContext = createContext();

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error("useAccount must be used within an AccountProvider");
  }
  return context;
};

export const AccountProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [people, setPeople] = useState([]);

  // Load accounts when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadAccounts();
    } else {
      setAccounts([]);
      setCurrentAccount(null);
      setCategories([]);
      setPeople([]);
    }
  }, [isAuthenticated]);

  // Load current account from localStorage
  useEffect(() => {
    const storedAccountId = localStorage.getItem("currentAccountId");
    if (storedAccountId && accounts.length > 0) {
      const account = accounts.find((acc) => acc._id === storedAccountId);
      if (account) {
        setCurrentAccount(account);
        loadAccountData(account._id);
      } else if (accounts.length > 0) {
        // If stored account not found, use first account
        switchAccount(accounts[0]._id);
      }
    } else if (accounts.length > 0 && !currentAccount) {
      // No stored account, use first one
      switchAccount(accounts[0]._id);
    }
  }, [accounts]);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const response = await accountService.getAll();
      if (response.success) {
        setAccounts(response.data);
      }
    } catch (error) {
      console.error("Failed to load accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAccountData = async (accountId) => {
    try {
      const [categoriesRes, peopleRes] = await Promise.all([
        accountService.getCategories(accountId),
        accountService.getPeople(accountId),
      ]);

      if (categoriesRes.success) {
        setCategories(categoriesRes.data);
      }

      if (peopleRes.success) {
        setPeople(peopleRes.data);
      }
    } catch (error) {
      console.error("Failed to load account data:", error);
    }
  };

  const switchAccount = async (accountId) => {
    const account = accounts.find((acc) => acc._id === accountId);
    if (account) {
      setCurrentAccount(account);
      localStorage.setItem("currentAccountId", accountId);
      await loadAccountData(accountId);
    }
  };

  const createAccount = async (accountData) => {
    try {
      // Map frontend fields to backend fields
      const backendData = {
        accountName: accountData.name,
        currency: accountData.currency,
        timezone: accountData.timezone,
      };

      const response = await accountService.create(backendData);
      if (response.success) {
        await loadAccounts();
        // Auto-switch to new account
        await switchAccount(response.data._id);
        return { success: true, data: response.data };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to create account",
      };
    }
  };

  const updateAccount = async (accountId, accountData) => {
    try {
      const response = await accountService.update(accountId, accountData);
      if (response.success) {
        await loadAccounts();
        if (currentAccount?._id === accountId) {
          setCurrentAccount(response.data);
        }
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update account",
      };
    }
  };

  const deleteAccount = async (accountId) => {
    try {
      const response = await accountService.delete(accountId);
      if (response.success) {
        await loadAccounts();
        if (currentAccount?._id === accountId) {
          setCurrentAccount(null);
          localStorage.removeItem("currentAccountId");
        }
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete account",
      };
    }
  };

  const addCategory = async (categoryName) => {
    if (!currentAccount)
      return { success: false, message: "No account selected" };

    try {
      const response = await accountService.createCategory(currentAccount._id, {
        name: categoryName,
      });
      if (response.success) {
        setCategories([...categories, response.data]);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to add category",
      };
    }
  };

  const addPerson = async (personData) => {
    if (!currentAccount)
      return { success: false, message: "No account selected" };

    try {
      const response = await accountService.createPerson(
        currentAccount._id,
        personData,
      );
      if (response.success) {
        setPeople([...people, response.data]);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to add person",
      };
    }
  };

  const value = {
    accounts,
    currentAccount,
    loading,
    categories,
    people,
    switchAccount,
    createAccount,
    updateAccount,
    deleteAccount,
    addCategory,
    addPerson,
    refreshAccounts: loadAccounts,
  };

  return (
    <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
  );
};
