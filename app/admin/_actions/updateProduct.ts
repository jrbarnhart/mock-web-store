"use server";

import { z } from "zod";
import { del, put } from "@vercel/blob";
import prisma from "@/components/db/db";
import { Prisma, Tag } from "@prisma/client";
import { ProductDataObject, ActionResponse } from "@/lib/types";
import { notFound } from "next/navigation";

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

const updateProductSchema = addProductSchema.extend({
  image: imageSchema.optional(),
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

async function uploadImage(imageFile: File) {
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

export async function updateProduct(
  id: string,
  prevState: any,
  formData: FormData
) {
  // JSON.parse to convert from strings to values
  const dataEntriesRes = dataEntriesFromForm(formData);
  if (!dataEntriesRes.success) return dataEntriesRes;

  // Validate dataEntries into data with Zod
  const zodResult = updateProductSchema.safeParse(dataEntriesRes.payload);
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
  const product = await prisma.product.findUnique({ where: { id } });

  if (product === null) {
    return notFound();
  }

  try {
    // Upload image to Vercel Blob
    let uploadImageSource: string = product.imageSource;
    if (data.image && data.image.size > 0) {
      if (uploadImageSource !== "") {
        await del(uploadImageSource);
      }
      const uploadImageRes = await uploadImage(data.image);
      if (!uploadImageRes.success) return uploadImageRes;
      uploadImageSource = uploadImageRes.payload;
    }

    // Create product data in database
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          priceInCents: data.priceInCents,
          imageSource: uploadImageSource,
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

    return { success: true, message: "Product created." } as ActionResponse;
  } catch (error) {
    console.error("Failure: Update project data.", error);
    return {
      success: false,
      message: "Failure: Update project data.",
    } as ActionResponse;
  }
}
