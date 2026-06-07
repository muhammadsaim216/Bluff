import React, { createContext, useContext, useState, useEffect } from "react";
import { User, signInWithPopup, signOut, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { auth, db, googleProvider, OperationType, handleFirestoreError } from "./firebase";

export interface UserProfileData {
  id: string;
  name: string;
  avatar: string;
  chips: number;
  xp: number;
  equippedCardBack: string;
  equippedTableFelt: string;
  unlockedItems: string[];
  claimedSignUpBonus?: boolean;
}

interface AuthContextType {
  user: User | null;
  userData: UserProfileData | null;
  isLoggingIn: boolean;
  showBonusModal: boolean;
  setShowBonusModal: (show: boolean) => void;
  signIn: () => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  updateChips: (change: number) => Promise<void>;
  updateXP: (change: number) => Promise<void>;
  unlockItem: (itemId: string, cost: number) => Promise<void>;
  equipItem: (type: "card-back" | "table-felt", itemId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(true);
  const [showBonusModal, setShowBonusModal] = useState<boolean>(false);

  // Synchronize Auth changes
  useEffect(() => {
    let unsubDoc: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch or create user data structure in Firestore
        const userDocRef = doc(db, "users", currentUser.uid);
        
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserData(userDocSnap.data() as UserProfileData);
          } else {
            // New user defaults with 207,150 welcome bonus coins dynamically added!
            const defaultProfile: UserProfileData = {
              id: currentUser.uid,
              name: currentUser.displayName || "Anonymous Deceiver",
              avatar: currentUser.photoURL || "https://lh3.googleusercontent.com/aida-public/AB6AXuDTgL14DiKZ-tm2YYrHOw_fomgLJRrF2ejbWQHyYOTG1oTxztFYerbHe_o7mbhs4gtYPpEtCcW26Vqldm3gKuMR0ulxn1ogximUg6uftX7fqhG9WtUt80WKRKlw8QD9zK5VgeuIZmMAYWsu0Z2hDcMfL5lr7yMwjpkdzp3fml3220_Y6ZubRjJX4GaaSQUIW0ln_1KgDg_MjEKDUAmHZcY8bK527-uh6HhmsjJO2M4TnZZD_4C3x8BxXoN4FWWoc6Yz3IF6S9lQH6I",
              chips: 250000,
              xp: 0,
              equippedCardBack: "default",
              equippedTableFelt: "default-felt",
              unlockedItems: ["default", "default-felt"],
              claimedSignUpBonus: true
            };
            await setDoc(userDocRef, defaultProfile);
            setUserData(defaultProfile);
            setShowBonusModal(true);
          }
        } catch (error) {
          console.warn("Auth initialization profile fetch failed, using local/guest fallback metrics:", error);
          // Provide an interactive, ready fallback state to prevent stuck loading indicator
          const fallbackProfile: UserProfileData = {
            id: currentUser.uid,
            name: currentUser.displayName || "Anonymous Deceiver",
            avatar: currentUser.photoURL || "https://lh3.googleusercontent.com/aida-public/AB6AXuDTgL14DiKZ-tm2YYrHOw_fomgLJRrF2ejbWQHyYOTG1oTxztFYerbHe_o7mbhs4gtYPpEtCcW26Vqldm3gKuMR0ulxn1ogximUg6uftX7fqhG9WtUt80WKRKlw8QD9zK5VgeuIZmMAYWsu0Z2hDcMfL5lr7yMwjpkdzp3fml3220_Y6ZubRjJX4GaaSQUIW0ln_1KgDg_MjEKDUAmHZcY8bK527-uh6HhmsjJO2M4TnZZD_4C3x8BxXoN4FWWoc6Yz3IF6S9lQH6I",
            chips: 250000,
            xp: 0,
            equippedCardBack: "default",
            equippedTableFelt: "default-felt",
            unlockedItems: ["default", "default-felt"],
            claimedSignUpBonus: true
          };
          setUserData(fallbackProfile);
        }

        // Set up real-time listener for user profile doc changes
        try {
          unsubDoc = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
              setUserData(docSnap.data() as UserProfileData);
            }
          }, (err) => {
            console.warn("Real-time profile Sync aborted or denied (ignoring):", err);
          });
        } catch (snapErr) {
          console.warn("Snapshot attaching blocked (ignoring):", snapErr);
        }

        setIsLoggingIn(false);
      } else {
        setUserData(null);
        setIsLoggingIn(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubDoc) unsubDoc();
    };
  }, []);

  const signIn = async () => {
    setIsLoggingIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google Auth SignIn Failed:", error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    setIsLoggingIn(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: name,
      });
      // Update local state with display name
      setUser({ ...userCredential.user, displayName: name });
    } catch (error) {
      console.error("Email Signup Failed:", error);
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    setIsLoggingIn(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Email Signin Failed:", error);
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logOut = async () => {
    setIsLoggingIn(true);
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Google Auth SignOut Failed:", error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const updateChips = async (change: number) => {
    if (!user || !userData) return;
    const userDocRef = doc(db, "users", user.uid);
    try {
      const newChips = Math.max(0, userData.chips + change);
      await setDoc(userDocRef, { ...userData, chips: newChips }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const updateXP = async (change: number) => {
    if (!user || !userData) return;
    const userDocRef = doc(db, "users", user.uid);
    try {
      const newXP = Math.max(0, userData.xp + change);
      await setDoc(userDocRef, { ...userData, xp: newXP }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const unlockItem = async (itemId: string, cost: number) => {
    if (!user || !userData) return;
    const userDocRef = doc(db, "users", user.uid);
    try {
      const newUnlocked = Array.from(new Set([...userData.unlockedItems, itemId]));
      const newChips = Math.max(0, userData.chips - cost);
      await setDoc(userDocRef, { 
        ...userData, 
        chips: newChips, 
        unlockedItems: newUnlocked 
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const equipItem = async (type: "card-back" | "table-felt", itemId: string) => {
    if (!user || !userData) return;
    const userDocRef = doc(db, "users", user.uid);
    try {
      const payload = type === "card-back" 
        ? { equippedCardBack: itemId } 
        : { equippedTableFelt: itemId };
      await setDoc(userDocRef, payload, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      userData,
      isLoggingIn,
      showBonusModal,
      setShowBonusModal,
      signIn,
      signUpWithEmail,
      signInWithEmail,
      logOut,
      updateChips,
      updateXP,
      unlockItem,
      equipItem
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
