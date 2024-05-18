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
  image: imageSchema.refine((file) => file.size > 0, "Required"),
  availableForPurchase: z.boolean(),
  tags: z.string().array(),
});

export async function addProduct(formData: FormData) {
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
  } catch (error) {
    console.error(
      "An error occurred while parsing tags and availableForPurchase.",
      error
    );
    return {
      success: false,
      message: "An error occurred while parsing tags and availableForPurchase.",
    };
  }

  console.log("Start validation...", dataEntries);
  const result = addProductSchema.safeParse(dataEntries);
  if (result.success === false) {
    console.error("Failure!", result.error.formErrors.fieldErrors);
    return result.error.formErrors.fieldErrors;
  }
  console.log("Success!");
  const data = result.data;

  try {
    // Add image to Vercel Blob
    const imageFile = data.image;
    const { url: imageSource } = await put(imageFile.name, imageFile, {
      access: "public",
    });

    if (imageSource === undefined || imageSource === "") {
      console.error("An error occurred while uploading image to Vercel Blob.");
      return {
        success: false,
        message: "An error occurred while uploading image to Vercel Blob.",
      };
    }

    // Add data to database
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        priceInCents: data.priceInCents,
        imageSource,
        availableForPurchase: data.availableForPurchase,
        tags: {
          create: data.tags.map((tag) => ({
            tag: {
              connectOrCreate: {
                where: { name: tag },
                create: { name: tag },
              },
            },
          })),
        },
      },
    });

    console.log("Product data added!");
    return { success: true };
  } catch (error) {
    console.error("An error occurred while adding product to database.", error);
    return {
      success: false,
      message: "An error occurred while adding product to database.",
    };
  }
}
