"use server";

import { z } from "zod";
import { put } from "@vercel/blob";
import prisma from "@/components/db/db";
import { TagOnProduct } from "@prisma/client";

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
  return prisma.$transaction(async (tx) => {
    // Return list of tag names not in db yet
    const existingTags = await prisma.productTag.findMany();
    let existingTagNames = existingTags.map((tag) => tag.name);
    const newTags = data.tags.filter((tag) => !existingTagNames.includes(tag));

    // Create new tags if needed
    if (newTags.length > 0) {
      await prisma.productTag.createMany({
        data: newTags.map((name) => ({ name })),
        skipDuplicates: true,
      });
    }

    const updatedTags = await prisma.productTag.findMany();

    // Get ids for tags on product
    const productTagIds = updatedTags
      .filter((tag) => data.tags.includes(tag.name))
      .map((tag) => tag.id);

    // Create the product
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        priceInCents: data.priceInCents,
        imageSource: imageSource,
        availableForPurchase: data.availableForPurchase,
      },
    });

    await prisma.tagOnProduct.createMany({
      data: productTagIds.map((tagId) => ({ tagId, productId: product.id })),
    });

    return product;
  });
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

  if (imageSource === undefined || imageSource === "") {
    return new Error(
      "There was an error while uploading image to Vercel Blob."
    );
  }

  const productData = await addProductData(imageSource, data);
  console.log("Product data added!", productData);
}
