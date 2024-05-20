import { Prisma } from "@prisma/client";

export interface ProductDataObject {
  name: string;
  description: string;
  priceInCents: number;
  image: File | undefined;
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

export type ProductWithTagNames = Prisma.ProductGetPayload<{
  include: {
    tags: {
      include: {
        tag: {
          select: {
            name: true;
          };
        };
      };
    };
  };
}>;

export type ProductWithTags = Prisma.ProductGetPayload<{
  include: {
    tags: {
      include: {
        tag: true;
      };
    };
  };
}>;
