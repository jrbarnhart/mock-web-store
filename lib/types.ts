export interface ProductDataObject {
  name: string;
  description: string;
  priceInCents: number;
  image: File;
  availableForPurchase: boolean;
  tags: string[];
}

export interface ActionResponse {
  success: boolean;
  message: string;
  payload: any;
  error: any;
}
