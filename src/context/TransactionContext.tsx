import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    setDoc
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from './AuthContext';
import { Transaction, Category } from '../types';

interface TransactionContextType {
    transactions: Transaction[];
    categories: Category[];
    saveTransaction: (data: any) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    saveCategory: (data: any) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
    loading: boolean;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setTransactions([]);
            setCategories([]);
            setLoading(false);
            return;
        }

        console.log("📡 TransactionContext: Listener active for user:", user.uid);

        // CENTRAL TRANSACTION LISTENER
        const txQuery = query(
            collection(db, "users", user.uid, "transactions"),
            orderBy("createdAt", "desc")
        );

        const unsubTx = onSnapshot(txQuery, (snapshot) => {
            console.log("📊 Transaction Snapshot size:", snapshot.size);
            const items = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    ...data,
                    id: doc.id,
                    createdAt: data.createdAt?.toMillis?.() || data.createdAt,
                    updatedAt: data.updatedAt?.toMillis?.() || data.updatedAt,
                } as Transaction;
            });
            setTransactions(items);
            setLoading(false);
        });

        // CENTRAL CATEGORY LISTENER
        const catQuery = query(
            collection(db, "users", user.uid, "categories"),
            orderBy("createdAt", "desc")
        );

        const unsubCat = onSnapshot(catQuery, (snapshot) => {
            const items = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    ...data,
                    id: doc.id,
                    createdAt: data.createdAt?.toMillis?.() || data.createdAt,
                    updatedAt: data.updatedAt?.toMillis?.() || data.updatedAt,
                } as Category;
            });
            setCategories(items);
        });

        return () => {
            console.log("🔌 TransactionContext: Detaching listeners");
            unsubTx();
            unsubCat();
        };
    }, [user]);

    const saveTransaction = async (data: any) => {
        if (!user) return;
        const id = data.id || Math.random().toString(36).substr(2, 9);
        const docRef = doc(db, "users", user.uid, "transactions", id);

        await setDoc(docRef, {
            ...data,
            id,
            createdAt: data.createdAt ? data.createdAt : serverTimestamp(),
            updatedAt: serverTimestamp()
        }, { merge: true });
    };

    const deleteTransaction = async (id: string) => {
        if (!user) return;
        const docRef = doc(db, "users", user.uid, "transactions", id);
        await deleteDoc(docRef);
    };

    const saveCategory = async (data: any) => {
        if (!user) return;
        const id = data.id || Math.random().toString(36).substr(2, 9);
        const docRef = doc(db, "users", user.uid, "categories", id);

        await setDoc(docRef, {
            ...data,
            id,
            createdAt: data.createdAt ? data.createdAt : serverTimestamp(),
            updatedAt: serverTimestamp()
        }, { merge: true });
    };

    const deleteCategory = async (id: string) => {
        if (!user) return;
        const docRef = doc(db, "users", user.uid, "categories", id);
        await deleteDoc(docRef);
    };

    return (
        <TransactionContext.Provider value={{ transactions, categories, saveTransaction, deleteTransaction, saveCategory, deleteCategory, loading }}>
            {children}
        </TransactionContext.Provider>
    );
};

export const useTransactions = () => {
    const context = useContext(TransactionContext);
    if (!context) throw new Error("useTransactions must be used within a TransactionProvider");
    return context;
};
