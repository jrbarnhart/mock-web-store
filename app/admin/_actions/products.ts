"use server";

import { z } from "zod";
import { put } from "@vercel/blob";
import prisma from "@/components/db/db";

const fileSchema = z.instanceof(File, { message: "Required" });

const imageSchema = fileSchema.refine(
  (file) => file.size === 0 || file.type.startsWith("image/")
);

const addProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  priceInCents: z.coerce.number().int().min(1),
  imageSource: imageSchema.refine((file) => file.size > 0, "Required"),
  availableForPurchase: z.boolean(),
  tags: z.string().array(),
});

async function addProductData(
  imageSource: string,
  data: {
    name: string;
    description: string;
    priceInCents: number;
    imageSource: File;
    availableForPurchase: boolean;
    tags: string[];
  }
) {
  // Create database entry

  // Check if tags exist

  return await prisma.$transaction([
    // Create needed tags
    // Create product
    prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        priceInCents: data.priceInCents,
        imageSource: imageSource,
        availableForPurchase: data.availableForPurchase,
      },
    }),
    // Create join table TagsOnProduct
  ]);
}

export async function addProduct(formData: FormData) {
  // JSON.parse to get correct data
  const dataEntries = Object.fromEntries(formData.entries());
  if ("tags" in dataEntries) {
    const tagsValue = dataEntries.tags;
    if (typeof tagsValue === "string") {
      dataEntries.tags = JSON.parse(tagsValue);
    }
  }
  if ("availableForPurchase" in dataEntries) {
    const availableValue = dataEntries.availableForPurchase;
    if (typeof availableValue === "string") {
      dataEntries.availableForPurchase = JSON.parse(availableValue);
    }
  }

  console.log("Start validation...", dataEntries);
  const result = addProductSchema.safeParse(dataEntries);
  if (result.success === false) {
    console.log("Failure!", result.error.formErrors.fieldErrors);
    return result.error.formErrors.fieldErrors;
  }
  console.log("Success!");
  const data = result.data;
  console.log(data);

  // Add image to Vercel Blob
  const imageFile = formData.get("imageSource") as File;
  const { url: imageSource } = await put(imageFile.name, imageFile, {
    access: "public",
  });

  addProductData(imageSource, data);
}
