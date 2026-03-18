import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { accountService, memberService } from "../services/api";
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
  const { isAuthenticated, user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [people, setPeople] = useState([]);
  const [currentMember, setCurrentMember] = useState(null);

  // Derived permission helper — true if owner or permission is granted
  // Falls back to true if the user is the account creator and no member record exists yet
  const hasPermission = (perm) => {
    if (!currentMember) {
      // Legacy fallback: if user is the account creator, treat as owner
      if (
        user &&
        currentAccount &&
        currentAccount.userId?.toString() === user._id?.toString()
      ) {
        return true;
      }
      return false;
    }
    if (currentMember.role === "owner") return true;
    return !!currentMember.permissions?.[perm];
  };

  // Load accounts when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadAccounts();
    } else {
      setAccounts([]);
      setCurrentAccount(null);
      setCategories([]);
      setPeople([]);
      setCurrentMember(null);
    }
  }, [isAuthenticated]);

  // Track current account ID in a ref so we can skip redundant loads
  const currentAccountIdRef = useRef(null);

  // Load current account from localStorage
  useEffect(() => {
    const storedAccountId = localStorage.getItem("currentAccountId");
    if (storedAccountId && accounts.length > 0) {
      const account = accounts.find((acc) => acc._id === storedAccountId);
      if (account) {
        // Only update currentAccount + reload data when account ID actually changes
        if (currentAccountIdRef.current !== account._id) {
          currentAccountIdRef.current = account._id;
          setCurrentAccount(account);
          loadAccountData(account._id);
        }
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
      const [categoriesRes, peopleRes, memberRes] = await Promise.all([
        accountService.getCategories(accountId),
        accountService.getPeople(accountId),
        memberService.getMe(accountId).catch(() => null),
      ]);

      if (categoriesRes.success) {
        setCategories(categoriesRes.data);
      }

      if (peopleRes.success) {
        setPeople(peopleRes.data);
      }

      if (memberRes?.success) {
        setCurrentMember(memberRes.data);
      } else {
        setCurrentMember(null);
      }
    } catch (error) {
      console.error("Failed to load account data:", error);
    }
  };

  const switchAccount = async (accountId) => {
    const account = accounts.find((acc) => acc._id === accountId);
    if (account) {
      currentAccountIdRef.current = accountId;
      setCurrentAccount(account);
      localStorage.setItem("currentAccountId", accountId);
      await loadAccountData(accountId);
    }
  };

  const createAccount = async (accountData) => {
    try {
      // Pass the account data directly to backend
      const response = await accountService.create(accountData);
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
    currentMember,
    hasPermission,
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
