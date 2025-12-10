import api from '../utils/api';

export interface CoinPackage {
  id: number;
  amount: number;
  price: string;
  bonus: string | null;
  popular: boolean;
  color: string;
  image: string;
}

export interface MerchItem {
  id: number;
  name: string;
  price: string;
  image: string;
  category: string;
  rarity: string;
}

export interface PowerUpItem {
  name: string;
  price: string;
  icon: string; // We might need to map string to icon component in frontend
  color: string;
  bg: string;
  desc: string;
}

export const storeService = {
  getCoinPackages: async () => {
    const response = await api.get<CoinPackage[]>('/store/coins');
    return response.data;
  },

  getMerchItems: async () => {
    const response = await api.get<MerchItem[]>('/store/merch');
    return response.data;
  },

  getPowerUps: async () => {
    const response = await api.get<PowerUpItem[]>('/store/powerups');
    return response.data;
  }
};
