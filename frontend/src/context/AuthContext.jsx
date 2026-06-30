import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../config/firebase";
import { authService } from "../services/api";

const googleProvider = new GoogleAuthProvider();

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!active) return;
      setFirebaseUser(fbUser);

      if (fbUser) {
        const token = localStorage.getItem("accessToken");
        if (token) {
          try {
            const res = await authService.getMe();
            if (active) setUser(res.data);
          } catch {
            // Access token expired — silently re-auth using Firebase session
            try {
              const idToken = await fbUser.getIdToken(true);
              const res = await authService.login(idToken);
              if (active) setUser(res.data.user);
            } catch {
              localStorage.removeItem("accessToken");
              if (active) setUser(null);
            }
          }
        } else {
          // No access token in storage — Firebase session still valid, restore it
          try {
            const idToken = await fbUser.getIdToken();
            const res = await authService.login(idToken);
            if (active) setUser(res.data.user);
          } catch {
            if (active) setUser(null);
          }
        }
      } else {
        if (active) setUser(null);
      }
      if (active) setLoading(false);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  async function login(email, password) {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await credential.user.getIdToken();
    const res = await authService.login(idToken);
    setUser(res.data.user);
    return res.data.user;
  }

  async function loginWithGoogle() {
    console.log("loginwithgoogle e toh ashlo");
    const result = await signInWithPopup(auth, googleProvider);
    console.log("result");
    const idToken = await result.user.getIdToken();
    const res = await authService.login(idToken);
    console.log(res);
    setUser(res.data.user);
    setFirebaseUser(result.user);
    return res.data.user;
  }

  async function register(firstName, lastName, email, password) {
    await authService.register(firstName, lastName, email, password);
    return login(email, password);
  }

  async function logout() {
    try {
      await authService.logout();
    } catch {
      /* ignore network errors on logout */
    }
    await signOut(auth);
    localStorage.removeItem("accessToken");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        login,
        loginWithGoogle,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
