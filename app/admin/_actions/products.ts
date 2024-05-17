"use server";

import { z } from "zod";

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
}
