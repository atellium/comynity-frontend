export type BusinessOffer = {
  id: string;
  title: string;
  description: string;
  image: string | null;
  is_all_time: boolean;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  is_currently_active: boolean;
  status: string;
  sort_order: number;
  terms: string[];
  created_at: string;
  updated_at: string;
};

export type BusinessOffersResponse = {
  results: BusinessOffer[] | null;
};

export type BusinessOfferResponse = {
  result: BusinessOffer | null;
};

export type BusinessOfferPayload = {
  title: string;
  description: string;
  is_all_time: boolean;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  sort_order: number;
  terms: string[];
};
