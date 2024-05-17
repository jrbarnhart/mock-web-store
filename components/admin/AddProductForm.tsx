"use client";

import { useRef, SetStateAction, useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { formatCurrency } from "@/lib/formatters";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { addProduct } from "@/app/admin/_actions/products";

export function AddProductForm() {
  const [priceInCents, setPriceInCents] = useState<number>();
  const [tags, setTags] = useState<string[]>([]);
  const [available, setAvailable] = useState<boolean>(true);

  function handleAvailableChanged() {
    setAvailable((prev) => !prev);
  }

  function handleSubmit(formData: FormData) {
    formData.append("available-for-purchase", JSON.stringify(available));
    formData.append("tags", JSON.stringify(tags));
    addProduct(formData);
  }

  return (
    <form action={handleSubmit} className="space-y-8">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input type="text" id="name" name="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="image-source">Image</Label>
        <Input type="file" id="image-source" name="image-source" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="price-in-cents">Price In Cents</Label>
        <Input
          type="number"
          id="price-in-cents"
          name="price-in-cents"
          required
          value={priceInCents}
          onChange={(e) => setPriceInCents(Number(e.target.value) || undefined)}
        />
        <div className="text-muted-foreground">
          {formatCurrency((priceInCents || 0) / 100)}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" required />
      </div>
      <div className="space-y-2 grid">
        <Label htmlFor="available-for-purchase">Available For Purchase</Label>
        <div className="flex gap-2">
          <Switch
            id="available-for-purchase"
            checked={available}
            onCheckedChange={handleAvailableChanged}
            className={!available ? "border-2 border-destructive" : ""}
          />
          <p className="text-muted-foreground">{available ? "Yes" : "No"}</p>
        </div>
      </div>
      <div className="space-y-2">
        <TagSelection tags={tags} setTags={setTags} />
      </div>
      <Button type="submit">Save</Button>
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
