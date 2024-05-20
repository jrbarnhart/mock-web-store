"use client";

import { useRef, SetStateAction, useState, useEffect } from "react";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { formatCurrency } from "@/lib/formatters";
import { Textarea } from "../../ui/textarea";
import { Button } from "../../ui/button";
import { Switch } from "../../ui/switch";
import { addProduct } from "@/app/admin/_actions/addProduct";
import { useFormState, useFormStatus } from "react-dom";
import { redirect } from "next/navigation";
import { ActionResponse } from "@/lib/types";
import { Product } from "@prisma/client";

export function AddProductForm({ product }: { product?: Product | null }) {
  const initialActionState: ActionResponse = {
    success: false,
    message: "",
    payload: null,
    fieldErrors: null,
  };
  const [formState, formAction] = useFormState(addProduct, initialActionState);
  const [priceInCents, setPriceInCents] = useState<number>();
  const [tags, setTags] = useState<string[]>([]);
  const [available, setAvailable] = useState<boolean>(false);

  function handleAvailableChanged() {
    setAvailable((prev) => !prev);
  }

  async function handleSubmit(formData: FormData) {
    formData.append("availableForPurchase", JSON.stringify(available));
    formData.append("tags", JSON.stringify(tags));
    formAction(formData);
  }

  useEffect(() => {
    if ("success" in formState && formState.success === true) {
      redirect("/admin/products");
    }
  }, [formState]);

  return (
    <form action={handleSubmit} className="space-y-8">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input type="text" id="name" name="name" required />
        {formState.fieldErrors?.name && (
          <div className="text-destructive">{formState.fieldErrors.name}</div>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="image">Image</Label>
        <Input type="file" id="image" name="image" required />
        {formState.fieldErrors?.image && (
          <div className="text-destructive">{formState.fieldErrors.image}</div>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="priceInCents">Price In Cents</Label>
        <Input
          type="number"
          id="priceInCents"
          name="priceInCents"
          required
          value={priceInCents}
          onChange={(e) => setPriceInCents(Number(e.target.value) || undefined)}
        />
        {formState.fieldErrors?.priceInCents && (
          <div className="text-destructive">
            {formState.fieldErrors.priceInCents}
          </div>
        )}
        <div className="text-muted-foreground">
          {formatCurrency((priceInCents || 0) / 100)}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" required />
        {formState.fieldErrors?.description && (
          <div className="text-destructive">
            {formState.fieldErrors.description}
          </div>
        )}
      </div>
      <div className="space-y-2 grid">
        <Label htmlFor="availableForPurchase">Available For Purchase</Label>
        <div className="flex gap-2">
          <Switch
            id="availableForPurchase"
            checked={available}
            onCheckedChange={handleAvailableChanged}
            className={!available ? "border-2 border-destructive" : ""}
          />
          <p className="text-muted-foreground">{available ? "Yes" : "No"}</p>
        </div>
        {formState.fieldErrors?.availableForPurchase && (
          <div className="text-destructive">
            {formState.fieldErrors.availableForPurchase}
          </div>
        )}
      </div>
      <div className="space-y-2">
        <TagSelection tags={tags} setTags={setTags} />
        {formState.fieldErrors?.tags && (
          <div className="text-destructive">{formState.fieldErrors.tags}</div>
        )}
      </div>
      <SubmitButton />
    </form>
  );
}

function TagSelection({
  tags,
  setTags,
}: {
  tags: string[];
  setTags: React.Dispatch<SetStateAction<string[]>>;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleEnterKeyPress();
    }
  }

  function handleEnterKeyPress() {
    if (!inputRef.current) {
      return;
    }
    const newTag = inputRef.current.value.toLowerCase().trim();
    if (newTag !== "" && !tags.includes(newTag)) {
      setTags((prev) => [...prev, newTag].sort());
      inputRef.current.value = "";
    }
  }

  function handleRemoveTagClick(tag: string) {
    setTags((prev) => prev.filter((value) => value !== tag));
  }

  return (
    <>
      <Label htmlFor="add-tag">Add Tags</Label>
      <Input
        type="text"
        id="add-tag"
        ref={inputRef}
        onKeyDown={handleKeyDown}
      />
      <div className="flex flex-wrap gap-2 pt-1 text-sm font-bold">
        {tags.map((tag) => {
          return (
            <div
              key={tag}
              className="flex items-center bg-primary text-primary-foreground rounded-md pl-4"
            >
              <p className="flex">{tag[0].toUpperCase() + tag.slice(1)}</p>
              <Button
                aria-label="Remove Tag"
                type="button"
                className="text-red-500 h-8"
                onClick={() => {
                  handleRemoveTagClick(tag);
                }}
              >
                X
              </Button>
            </div>
          );
        })}
      </div>
    </>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save"}
    </Button>
  );
}
