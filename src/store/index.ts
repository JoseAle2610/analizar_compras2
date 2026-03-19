import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Store, Product, Establishment, BuyingRound, Visit, Currency, RatesConfig, BaseCurrency } from '../types';

interface ProductOld {
  id: string;
  name: string;
  category?: string;
  tags?: string[];
  createdAt: string;
}

interface RoundOld {
  id: string;
  name: string;
  date: string;
  status: 'in_process' | 'completed' | 'deleted';
  targetProducts?: ProductOld[];
  targetProductIds?: string[];
  createdAt: string;
}

const migrateProducts = (products: ProductOld[]): Product[] => {
  return products.map((p) => {
    if (p.category && !p.tags) {
      return {
        id: p.id,
        name: p.name,
        tags: [p.category],
        createdAt: p.createdAt,
      };
    }
    return {
      id: p.id,
      name: p.name,
      tags: p.tags || [],
      createdAt: p.createdAt,
    };
  });
};

const migrateRounds = (rounds: RoundOld[], defaultRates: RatesConfig, defaultCurrency: BaseCurrency): BuyingRound[] => {
  return rounds.map((r) => {
    if (r.targetProducts && !r.targetProductIds) {
      return {
        id: r.id,
        name: r.name,
        date: r.date,
        status: r.status,
        targetProductIds: r.targetProducts.map((p) => p.id),
        rates: defaultRates,
        baseCurrency: defaultCurrency,
        createdAt: r.createdAt,
      };
    }
    return {
      id: r.id,
      name: r.name,
      date: r.date,
      status: r.status,
      targetProductIds: r.targetProductIds || [],
      rates: defaultRates,
      baseCurrency: defaultCurrency,
      createdAt: r.createdAt,
    };
  });
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      products: [],
      establishments: [],
      rounds: [],
      visits: [],
      rates: { bcv: 0, usdt: 0, eur: 0 },
      baseCurrency: 'Bs' as BaseCurrency,

      addProduct: (name: string, tags: string[] = []) => {
        const product: Product = {
          id: uuidv4(),
          name,
          tags,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ products: [...state.products, product] }));
      },

      updateProduct: (id: string, name: string, tags: string[] = []) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, name, tags } : p
          ),
        }));
      },

      deleteProduct: (id: string) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));
      },

      getUnusedProducts: () => {
        const { rounds } = get();
        const usedProductIds = new Set(
          rounds.flatMap((r) => r.targetProductIds)
        );
        return get().products.filter((p) => !usedProductIds.has(p.id));
      },

      getAllTags: () => {
        const { products } = get();
        const allTags = new Set<string>();
        products.forEach((p) => {
          p.tags.forEach((tag) => allTags.add(tag));
        });
        return Array.from(allTags).sort();
      },

      addEstablishment: (name: string) => {
        const establishment: Establishment = {
          id: uuidv4(),
          name,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          establishments: [...state.establishments, establishment],
        }));
      },

      updateEstablishment: (id: string, name: string) => {
        set((state) => ({
          establishments: state.establishments.map((e) =>
            e.id === id ? { ...e, name } : e
          ),
        }));
      },

      deleteEstablishment: (id: string) => {
        set((state) => ({
          establishments: state.establishments.filter((e) => e.id !== id),
        }));
      },

      getUnusedEstablishments: () => {
        const { visits } = get();
        const usedEstablishmentIds = new Set(
          visits.map((v) => v.establishmentId)
        );
        return get().establishments.filter((e) => !usedEstablishmentIds.has(e.id));
      },

      addRound: (name: string, date: string, targetProductIds: string[]) => {
        const { rates, baseCurrency } = get();
        const id = uuidv4();
        const round: BuyingRound = {
          id,
          name,
          date,
          status: 'in_process',
          targetProductIds,
          rates: { ...rates },
          baseCurrency,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ rounds: [...state.rounds, round] }));
        return id;
      },

      updateRound: (id: string, updates: Partial<BuyingRound>) => {
        set((state) => ({
          rounds: state.rounds.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        }));
      },

      deleteRound: (id: string) => {
        set((state) => ({
          rounds: state.rounds.map((r) =>
            r.id === id ? { ...r, status: 'deleted' as const } : r
          ),
        }));
      },

      completeRound: (id: string) => {
        set((state) => ({
          rounds: state.rounds.map((r) =>
            r.id === id ? { ...r, status: 'completed' as const } : r
          ),
        }));
      },

      reopenRound: (id: string) => {
        set((state) => ({
          rounds: state.rounds.map((r) =>
            r.id === id ? { ...r, status: 'in_process' as const } : r
          ),
        }));
      },

      addVisit: (roundId: string, establishmentId: string) => {
        const id = uuidv4();
        const visit: Visit = {
          id,
          roundId,
          establishmentId,
          date: new Date().toISOString(),
          status: 'pending',
          products: [],
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ visits: [...state.visits, visit] }));
        return id;
      },

      updateVisit: (id: string, updates: Partial<Visit>) => {
        set((state) => ({
          visits: state.visits.map((v) =>
            v.id === id ? { ...v, ...updates } : v
          ),
        }));
      },

      updateVisitProduct: (
        visitId: string,
        productId: string,
        price: number,
        currency: Currency
      ) => {
        set((state) => ({
          visits: state.visits.map((v) => {
            if (v.id !== visitId) return v;
            const existingIndex = v.products.findIndex(
              (p) => p.productId === productId
            );
            if (existingIndex >= 0) {
              const newProducts = [...v.products];
              newProducts[existingIndex] = { productId, price, currency };
              return { ...v, products: newProducts };
            }
            return {
              ...v,
              products: [...v.products, { productId, price, currency }],
            };
          }),
        }));
      },

      completeVisit: (id: string) => {
        set((state) => ({
          visits: state.visits.map((v) =>
            v.id === id ? { ...v, status: 'completed' as const } : v
          ),
        }));
      },

      reopenVisit: (id: string) => {
        set((state) => ({
          visits: state.visits.map((v) =>
            v.id === id ? { ...v, status: 'pending' as const } : v
          ),
        }));
      },

      deleteVisit: (id: string) => {
        set((state) => ({
          visits: state.visits.filter((v) => v.id !== id),
        }));
      },

      getVisitsByRound: (roundId: string) => {
        return get().visits.filter((v) => v.roundId === roundId);
      },

      isEstablishmentVisited: (roundId: string, establishmentId: string) => {
        return get().visits.some(
          (v) => v.roundId === roundId && v.establishmentId === establishmentId
        );
      },

      getBestPriceForProduct: (roundId: string, productId: string) => {
        const { visits, establishments } = get();
        const roundVisits = visits.filter(
          (v) => v.roundId === roundId
        );
        
        let bestPrice: number | null = null;
        let bestEstablishmentName = '';
        let bestCurrency: Currency = 'Bs';

        for (const visit of roundVisits) {
          const product = visit.products.find((p) => p.productId === productId);
          if (product && (bestPrice === null || product.price < bestPrice)) {
            bestPrice = product.price;
            bestCurrency = product.currency;
            const establishment = establishments.find(
              (e) => e.id === visit.establishmentId
            );
            bestEstablishmentName = establishment?.name || '';
          }
        }

        if (bestPrice === null) return null;
        return { price: bestPrice, establishmentName: bestEstablishmentName, currency: bestCurrency };
      },

      getProductById: (productId: string) => {
        return get().products.find((p) => p.id === productId);
      },

      isProductInUse: (productId: string) => {
        const { rounds, visits } = get();
        const isInRound = rounds.some((r) => r.targetProductIds.includes(productId));
        const isInVisit = visits.some((v) => v.products.some((p) => p.productId === productId));
        return isInRound || isInVisit;
      },

      isEstablishmentInUse: (establishmentId: string) => {
        const { visits } = get();
        return visits.some((v) => v.establishmentId === establishmentId);
      },

      updateRates: (newRates: Partial<RatesConfig>) => {
        set((state) => ({
          rates: { ...state.rates, ...newRates },
        }));
      },

      updateBaseCurrency: (currency: BaseCurrency) => {
        set(() => ({ baseCurrency: currency }));
      },

      convertPrice: (amount: number, fromCurrency: Currency, rates: RatesConfig, toCurrency: BaseCurrency): number => {
        if (fromCurrency === toCurrency) return amount;
        
        let amountInBs: number;
        
        if (fromCurrency === 'Bs') {
          amountInBs = amount;
        } else if (fromCurrency === 'USD') {
          const avgRate = (rates.bcv + rates.usdt) / 2;
          amountInBs = amount * avgRate;
        } else if (fromCurrency === 'EUR') {
          amountInBs = amount * rates.eur;
        } else {
          amountInBs = amount;
        }
        
        if (toCurrency === 'Bs') {
          return amountInBs;
        } else if (toCurrency === 'USD') {
          const avgRate = (rates.bcv + rates.usdt) / 2;
          return amountInBs / avgRate;
        } else if (toCurrency === 'EUR') {
          return amountInBs / rates.eur;
        }
        
        return amountInBs;
      },

      addProductToRound: (roundId: string, productId: string) => {
        set((state) => ({
          rounds: state.rounds.map((r) => {
            if (r.id !== roundId) return r;
            if (r.targetProductIds.includes(productId)) return r;
            return {
              ...r,
              targetProductIds: [...r.targetProductIds, productId],
              removedTargetProductIds: r.removedTargetProductIds?.filter((id) => id !== productId) || [],
            };
          }),
        }));
      },

      removeProductFromRound: (roundId: string, productId: string) => {
        set((state) => ({
          rounds: state.rounds.map((r) => {
            if (r.id !== roundId) return r;
            if (!r.targetProductIds.includes(productId)) return r;
            return {
              ...r,
              targetProductIds: r.targetProductIds.filter((id) => id !== productId),
              removedTargetProductIds: [...(r.removedTargetProductIds || []), productId],
            };
          }),
        }));
      },

      restoreProductToRound: (roundId: string, productId: string) => {
        set((state) => ({
          rounds: state.rounds.map((r) => {
            if (r.id !== roundId) return r;
            if (!r.removedTargetProductIds?.includes(productId)) return r;
            return {
              ...r,
              targetProductIds: [...r.targetProductIds, productId],
              removedTargetProductIds: r.removedTargetProductIds.filter((id) => id !== productId),
            };
          }),
        }));
      },
    }),
    {
      name: 'kiosco-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          const migratedProducts = migrateProducts(state.products as unknown as ProductOld[]);
          state.products = migratedProducts;
          const defaultRates = state.rates || { bcv: 0, usdt: 0, eur: 0 };
          const defaultCurrency = state.baseCurrency || 'Bs';
          const migratedRounds = migrateRounds(state.rounds as unknown as RoundOld[], defaultRates, defaultCurrency);
          state.rounds = migratedRounds;
        }
      },
    }
  )
);
