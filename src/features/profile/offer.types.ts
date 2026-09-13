export type BusinessOffer = {
  id: string;
  title: string;
  description: string;
  image: string | null;
  starts_at: string;
  expires_at: string;
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
