import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommissionRecord, Settlement } from '../types';

interface CommissionState {
  commissionRecords: CommissionRecord[];
  isLoading: boolean;

  // CRUD
  addRecord: (record: CommissionRecord) => void;
  updateRecord: (id: string, updates: Partial<CommissionRecord>) => void;
  deleteRecord: (id: string) => void;
  getRecordById: (id: string) => CommissionRecord | undefined;
  getRecordsByLocation: (locationId: string) => CommissionRecord[];
  getRecordByLocationAndMonth: (locationId: string, month: string) => CommissionRecord | undefined;

  // Settlements
  addSettlement: (recordId: string, settlement: Settlement) => void;

  // Auto-calculate commission for a location/month
  calculateCommission: (params: {
    locationId: string;
    locationName: string;
    ownerName: string;
    month: string;
    totalRevenue: number;
    materialCost: number;
    commissionType: 'percentage' | 'fixed_per_patient' | 'fixed_per_visit' | 'rent' | 'none';
    commissionValue: number;
    calculatedOn: 'total_fee' | 'fee_minus_material';
    patientCount?: number;
    visitCount?: number;
  }) => CommissionRecord;

  // Aggregations
  getTotalCommissionPending: () => number;
  getTotalCommissionPaid: () => number;
  getMonthlyRecords: (month: string) => CommissionRecord[];

  setLoading: (loading: boolean) => void;
}

export const useCommissionStore = create<CommissionState>()(
  persist(
    (set, get) => ({
      commissionRecords: [],
      isLoading: false,

      addRecord: (record) =>
        set((state) => ({ commissionRecords: [...state.commissionRecords, record] })),

      updateRecord: (id, updates) =>
        set((state) => ({
          commissionRecords: state.commissionRecords.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),

      deleteRecord: (id) =>
        set((state) => ({
          commissionRecords: state.commissionRecords.filter((r) => r.id !== id),
        })),

      getRecordById: (id) => get().commissionRecords.find((r) => r.id === id),

      getRecordsByLocation: (locationId) =>
        get().commissionRecords.filter((r) => r.locationId === locationId),

      getRecordByLocationAndMonth: (locationId, month) =>
        get().commissionRecords.find((r) => r.locationId === locationId && r.month === month),

      addSettlement: (recordId, settlement) =>
        set((state) => ({
          commissionRecords: state.commissionRecords.map((r) => {
            if (r.id !== recordId) return r;
            const updatedSettlements = [...r.settlements, settlement];
            const totalPaid = updatedSettlements.reduce((sum, s) => sum + s.amount, 0);
            const pending = r.commissionAmount - totalPaid;
            return {
              ...r,
              settlements: updatedSettlements,
              paidToOwner: totalPaid,
              pendingAmount: pending,
              status: pending <= 0 ? 'settled' as const : totalPaid > 0 ? 'partial' as const : 'pending' as const,
            };
          }),
        })),

      calculateCommission: (params) => {
        const {
          locationId, locationName, ownerName, month,
          totalRevenue, materialCost,
          commissionType, commissionValue, calculatedOn,
          patientCount = 0, visitCount = 0,
        } = params;

        let commissionAmount = 0;
        const base = calculatedOn === 'fee_minus_material' ? totalRevenue - materialCost : totalRevenue;

        switch (commissionType) {
          case 'percentage':
            commissionAmount = (base * commissionValue) / 100;
            break;
          case 'fixed_per_patient':
            commissionAmount = patientCount * commissionValue;
            break;
          case 'fixed_per_visit':
            commissionAmount = visitCount * commissionValue;
            break;
          case 'rent':
            commissionAmount = commissionValue;
            break;
          case 'none':
            commissionAmount = 0;
            break;
        }

        commissionAmount = Math.round(commissionAmount * 100) / 100;
        const doctorNet = totalRevenue - commissionAmount - materialCost;

        const existing = get().getRecordByLocationAndMonth(locationId, month);
        if (existing) {
          const updates = {
            totalRevenue,
            commissionAmount,
            materialCost,
            doctorNetEarning: doctorNet,
            pendingAmount: commissionAmount - existing.paidToOwner,
          };
          get().updateRecord(existing.id, updates);
          return { ...existing, ...updates };
        }

        const record: CommissionRecord = {
          id: `comm_${Date.now()}`,
          doctorId: '',
          locationId,
          locationName,
          ownerName,
          month,
          totalRevenue,
          commissionAmount,
          materialCost,
          doctorNetEarning: doctorNet,
          paidToOwner: 0,
          pendingAmount: commissionAmount,
          status: 'pending',
          settlements: [],
        };

        get().addRecord(record);
        return record;
      },

      getTotalCommissionPending: () =>
        get().commissionRecords.reduce((sum, r) => sum + r.pendingAmount, 0),

      getTotalCommissionPaid: () =>
        get().commissionRecords.reduce((sum, r) => sum + r.paidToOwner, 0),

      getMonthlyRecords: (month) =>
        get().commissionRecords.filter((r) => r.month === month),

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'orthosync-commissions',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
