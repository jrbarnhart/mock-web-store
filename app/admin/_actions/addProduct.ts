"use server";

import { z } from "zod";
import { put } from "@vercel/blob";
import prisma from "@/components/db/db";
import { Prisma, Tag } from "@prisma/client";
import { ProductDataObject, ActionResponse } from "@/lib/types";
import { revalidatePath } from "next/cache";

// Zod Schema
const fileSchema = z.instanceof(File, { message: "Required" });
const imageSchema = fileSchema.refine(
  (file) => file.size === 0 || file.type.startsWith("image/"),
  "File must be an image"
);
const addProductSchema = z.object({
  name: z.string().trim().min(1, "Name required."),
  description: z.string().trim().min(1, "Description required."),
  priceInCents: z.coerce.number().int().min(1),
  image: imageSchema.refine((file) => file.size > 0, "Required"),
  availableForPurchase: z.boolean(),
  tags: z.string().array(),
});

// Helper functions
function dataEntriesFromForm(formData: FormData) {
  // JSON.parse to convert from strings to values
  const dataEntries = Object.fromEntries(formData.entries());
  try {
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
    return {
      success: true,
      message: "Data entries parsed.",
      payload: dataEntries,
    } as ActionResponse;
  } catch (error) {
    console.error("Failure: JSON parsing formData.", error);
    return {
      success: false,
      message: "Failure: JSON parsing formData.",
    } as ActionResponse;
  }
}

async function uploadImage(data: ProductDataObject) {
  const imageFile = data.image;
  if (!imageFile) {
    console.error(
      "Failure: Uploading image to Vercel Blob. Image file not found."
    );
    return {
      success: false,
      message: "Failure: Uploading image to Vercel Blob. Image file not found.",
    } as ActionResponse;
  }

  const { url: imageSource } = await put(imageFile.name, imageFile, {
    access: "public",
  });

  if (imageSource === undefined || imageSource === "") {
    console.error("Failure: Uploading image to Vercel Blob.");
    return {
      success: false,
      message: "Failure: Uploading image to Vercel Blob.",
    } as ActionResponse;
  }

  return {
    success: true,
    payload: imageSource,
    message: "Image upload complete.",
  } as ActionResponse;
}

async function createOrUpdateTags(
  tagNames: string[],
  tx: Prisma.TransactionClient
) {
  const tags: Tag[] = [];

  for (const tagName of tagNames) {
    const tag = await tx.tag.upsert({
      where: { name: tagName },
      create: { name: tagName },
      update: {},
    });
    tags.push(tag);
  }

  return tags;
}

export async function addProduct(prevState: any, formData: FormData) {
  // JSON.parse to convert from strings to values
  const dataEntriesRes = dataEntriesFromForm(formData);
  if (!dataEntriesRes.success) return dataEntriesRes;

  // Validate dataEntries into data with Zod
  const zodResult = addProductSchema.safeParse(dataEntriesRes.payload);
  if (zodResult.success === false) {
    console.error(
      "Failure: Zod validation.",
      zodResult.error.formErrors.fieldErrors
    );
    return {
      success: false,
      message: "Failure: Zod validation.",
      fieldErrors: zodResult.error.formErrors.fieldErrors,
    } as ActionResponse;
  }
  const data = zodResult.data;

  try {
    // Upload image to Vercel Blob
    const uploadImageRes = await uploadImage(data);
    if (!uploadImageRes.success) return uploadImageRes;

    // Create product data in database
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: data.name,
          description: data.description,
          priceInCents: data.priceInCents,
          imageSource: uploadImageRes.payload,
          availableForPurchase: data.availableForPurchase,
        },
      });

      // Create or fetch tags
      const tags = await createOrUpdateTags(data.tags, tx);
      const tagsIds = tags.map((tag) => ({ id: tag.id }));

      // Create join table entries for productTags
      await tx.productTag.createMany({
        data: tagsIds.map((tagId) => ({
          tagId: tagId.id,
          productId: product.id,
        })),
      });
    });

    revalidatePath("/admin/products");

    return { success: true, message: "Product created." } as ActionResponse;
  } catch (error) {
    console.error("Failure: Add product to database.", error);
    return {
      success: false,
      message: "Failure: Add product to database.",
    } as ActionResponse;
  }
}
