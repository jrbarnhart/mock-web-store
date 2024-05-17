"use client";

import { useRef, SetStateAction, useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { formatCurrency } from "@/lib/formatters";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

export function AddProductForm() {
  const [priceInCents, setPriceInCents] = useState<number>();
  const [tags, setTags] = useState<string[]>([]);

  return (
    <form className="space-y-8">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input type="text" id="name" name="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="price-cents">Price In Cents</Label>
        <Input
          type="number"
          id="price-cents"
          name="price-cents"
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
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input type="text" id="name" name="name" required />
      </div>
      <div className="space-y-2">
        <TagSelection tags={tags} setTags={setTags} />
      </div>
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
