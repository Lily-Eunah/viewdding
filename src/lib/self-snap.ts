import fs from "node:fs/promises";
import path from "node:path";
import initialItems from "@/data/self-snap-items.json";
import initialVenues from "@/data/self-snap-venues.json";
import type { SelfSnapItem, SelfSnapVenue } from "@/domain/self-snap-types";

const itemsFilePath = path.join(process.cwd(), "src", "data", "self-snap-items.json");
const venuesFilePath = path.join(process.cwd(), "src", "data", "self-snap-venues.json");

export async function getSelfSnapItems(): Promise<SelfSnapItem[]> {
  try {
    const raw = await fs.readFile(itemsFilePath, "utf-8");
    const items = JSON.parse(raw) as SelfSnapItem[];
    return items.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  } catch {
    return (initialItems as SelfSnapItem[]).sort(
      (a, b) => (a.order ?? 999) - (b.order ?? 999)
    );
  }
}

export async function saveSelfSnapItems(items: SelfSnapItem[]): Promise<boolean> {
  try {
    const sorted = items.map((item, idx) => ({ ...item, order: idx + 1 }));
    await fs.writeFile(itemsFilePath, JSON.stringify(sorted, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Failed to save self snap items:", error);
    return false;
  }
}

export async function getSelfSnapVenues(): Promise<SelfSnapVenue[]> {
  try {
    const raw = await fs.readFile(venuesFilePath, "utf-8");
    const venues = JSON.parse(raw) as SelfSnapVenue[];
    return venues.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  } catch {
    return (initialVenues as SelfSnapVenue[]).sort(
      (a, b) => (a.order ?? 999) - (b.order ?? 999)
    );
  }
}

export async function saveSelfSnapVenues(venues: SelfSnapVenue[]): Promise<boolean> {
  try {
    const sorted = venues.map((venue, idx) => ({ ...venue, order: idx + 1 }));
    await fs.writeFile(venuesFilePath, JSON.stringify(sorted, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Failed to save self snap venues:", error);
    return false;
  }
}
