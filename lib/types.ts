export interface ProductDataObject {
  name: string;
  description: string;
  priceInCents: number;
  image: File;
  availableForPurchase: boolean;
  tags: string[];
}

export interface ProductFieldErrors {
  tags?: string[] | undefined;
  availableForPurchase?: string[] | undefined;
  name?: string[] | undefined;
  description?: string[] | undefined;
  priceInCents?: string[] | undefined;
  image?: string[] | undefined;
}

export interface ActionResponse {
  success: boolean;
  message: string;
  payload: any;
  fieldErrors: ProductFieldErrors | null;
}
