import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Bill, BillItem, Installment } from '../types';

interface BillingState {
  bills: Bill[];
  isLoading: boolean;

  // Bill CRUD
  addBill: (bill: Bill) => void;
  updateBill: (id: string, updates: Partial<Bill>) => void;
  deleteBill: (id: string) => void;
  getBillById: (id: string) => Bill | undefined;
  getBillsByPatient: (patientId: string) => Bill[];
  getBillsByLocation: (locationId: string) => Bill[];
  getBillsByStatus: (status: Bill['status']) => Bill[];

  // Payments
  recordPayment: (billId: string, amount: number, mode: Bill['paymentMode']) => void;

  // Installments
  addInstallment: (billId: string, installment: Installment) => void;
  markInstallmentPaid: (billId: string, installmentId: string, mode: Bill['paymentMode']) => void;

  // Aggregations
  getTotalRevenue: () => number;
  getTotalPending: () => number;
  getMonthlyRevenue: (month: string) => number;
  getLocationRevenue: (locationId: string) => number;

  setLoading: (loading: boolean) => void;
}

export const useBillingStore = create<BillingState>()(
  persist(
    (set, get) => ({
      bills: [],
      isLoading: false,

      addBill: (bill) =>
        set((state) => ({ bills: [...state.bills, bill] })),

      updateBill: (id, updates) =>
        set((state) => ({
          bills: state.bills.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        })),

      deleteBill: (id) =>
        set((state) => ({ bills: state.bills.filter((b) => b.id !== id) })),

      getBillById: (id) => get().bills.find((b) => b.id === id),

      getBillsByPatient: (patientId) =>
        get().bills.filter((b) => b.patientId === patientId),

      getBillsByLocation: (locationId) =>
        get().bills.filter((b) => b.locationId === locationId),

      getBillsByStatus: (status) =>
        get().bills.filter((b) => b.status === status),

      recordPayment: (billId, amount, mode) =>
        set((state) => ({
          bills: state.bills.map((b) => {
            if (b.id !== billId) return b;
            const newPaid = b.paidAmount + amount;
            const newBalance = b.grandTotal - newPaid;
            return {
              ...b,
              paidAmount: newPaid,
              balanceAmount: newBalance,
              paymentMode: mode,
              status: newBalance <= 0 ? 'paid' as const : 'partial' as const,
            };
          }),
        })),

      addInstallment: (billId, installment) =>
        set((state) => ({
          bills: state.bills.map((b) =>
            b.id === billId
              ? { ...b, installments: [...b.installments, installment] }
              : b
          ),
        })),

      markInstallmentPaid: (billId, installmentId, mode) =>
        set((state) => ({
          bills: state.bills.map((b) => {
            if (b.id !== billId) return b;
            const updatedInstallments = b.installments.map((inst) =>
              inst.id === installmentId
                ? { ...inst, isPaid: true, paidDate: new Date().toISOString(), paymentMode: mode }
                : inst
            );
            const paidInstallmentAmount = updatedInstallments
              .filter((i) => i.isPaid)
              .reduce((sum, i) => sum + i.amount, 0);
            const newBalance = b.grandTotal - paidInstallmentAmount;
            return {
              ...b,
              installments: updatedInstallments,
              paidAmount: paidInstallmentAmount,
              balanceAmount: newBalance,
              status: newBalance <= 0 ? 'paid' as const : 'partial' as const,
            };
          }),
        })),

      getTotalRevenue: () =>
        get().bills.reduce((sum, b) => sum + b.paidAmount, 0),

      getTotalPending: () =>
        get().bills.reduce((sum, b) => sum + b.balanceAmount, 0),

      getMonthlyRevenue: (month) =>
        get()
          .bills.filter((b) => b.createdAt.startsWith(month))
          .reduce((sum, b) => sum + b.paidAmount, 0),

      getLocationRevenue: (locationId) =>
        get()
          .bills.filter((b) => b.locationId === locationId)
          .reduce((sum, b) => sum + b.paidAmount, 0),

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'orthosync-billing',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
