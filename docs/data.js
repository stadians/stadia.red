import * as records from "./records.js";
export class DataStore {
  constructor() {
    // Update to clear existing data when making incompatible schema changes.
    this.schema = 20200205;
    this.skusById = new Map();
  }
  static async open() {
    const data = new DataStore();
    await data.load();
    return data;
  }
  async migrate() {
    const existingSchema = (await browser.storage.local.get("schema")).schema;
    if (this.schema !== existingSchema) {
      console.info(
        `Resetting extension storage (data schema was ${existingSchema} but we need ${this.schema}).`
      );
      await browser.storage.local.clear();
      await browser.storage.local.set({ schema: this.schema });
    }
  }
  async load() {
    await this.migrate();
    const { skusById } = await browser.storage.local.get(["skusById"]);
    console.debug("i'd like to load", skusById);
  }
  async save() {
    await this.migrate();
    await browser.storage.local.set({
      skusById: records.sorted(Object.fromEntries(this.skusById.entries())),
    });
  }
  values() {
    return this.skusById.values();
  }
  get(id) {
    return this.skusById.get(id);
  }
  upsert(sku) {
    const existing = this.skusById.get(sku.sku);
    if (existing === undefined) {
      this.skusById.set(sku.sku, sku);
      console.info("SKU added", sku);
      return sku;
    }
    if (existing !== sku) {
      if (JSON.stringify(existing) !== JSON.stringify(sku)) {
        const previous = { ...existing };
        console.info(
          "SKU updated, adding",
          sku,
          "to",
          previous,
          "producing",
          existing
        );
        Object.assign(existing, sku);
      }
    }
    return existing;
  }
}
export const localKey = (sku) => {
  const length = 32;
  const maxNameLength = 23;
  const typeTag =
    { game: "g", addon: "o", bundle: "x", subscription: "c" }[sku.type] ??
    `?${sku.type}?`;
  const idsPrefix = sku.app.slice(0, 6) + sku.sku.slice(0, 2);
  const idsRest = sku.app.slice(6) + sku.sku.slice(2);
  let name = (sku.name + sku.internalSlug)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
  if (name.length > maxNameLength) {
    const letterCounts = {};
    for (const letter of name) {
      letterCounts[letter] = (letterCounts[letter] || 0) + 1;
    }
    while (name.length > maxNameLength) {
      const mostFrequentCount = Math.max(...Object.values(letterCounts));
      const mostFrequent = Object.entries(letterCounts)
        .filter(([_letter, count]) => count == mostFrequentCount)
        .map(([letter, _count]) => letter);
      for (let i = name.length - 1; i >= 0; i -= 1) {
        const letter = name[i];
        if (mostFrequent.includes(letter)) {
          name = name.slice(0, i) + name.slice(i + 1);
          letterCounts[letter] -= 1;
          break;
        }
      }
    }
  }
  return (typeTag + idsPrefix + name + idsRest).slice(0, length);
};
export class CommonSku {
  constructor(app, sku, type, name, internalSlug, description) {
    this.app = app;
    this.sku = sku;
    this.type = type;
    this.name = name;
    this.internalSlug = internalSlug;
    this.description = description;
    this.proPriceCents = null;
    this.proSalePriceCents = null;
    this.basePriceCents = null;
    this.baseSalePriceCents = null;
    this.localKey = localKey(this);
  }
}
export class Game extends CommonSku {
  constructor(app, sku, type = "game", name, internalSlug, description) {
    super(app, sku, type, name, internalSlug, description);
    this.type = type;
    this.internalSlug = internalSlug;
    this.description = description;
  }
}
export class AddOn extends CommonSku {
  constructor(app, sku, type = "addon", name, internalSlug, description) {
    super(app, sku, type, name, internalSlug, description);
    this.type = type;
    this.internalSlug = internalSlug;
    this.description = description;
  }
}
export class Bundle extends CommonSku {
  constructor(
    app,
    sku,
    type = "bundle",
    name,
    internalSlug,
    description,
    skus
  ) {
    super(app, sku, type, name, internalSlug, description);
    this.type = type;
    this.internalSlug = internalSlug;
    this.description = description;
    this.skus = skus;
  }
}
export class Subscription extends CommonSku {
  constructor(
    app,
    sku,
    type = "subscription",
    name,
    internalSlug,
    description,
    skus
  ) {
    super(app, sku, type, name, internalSlug, description);
    this.type = type;
    this.internalSlug = internalSlug;
    this.description = description;
    this.skus = skus;
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiZGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEtBQUssT0FBTyxNQUFNLGNBQWMsQ0FBQztBQUl4QyxNQUFNLE9BQU8sU0FBUztJQU1wQjtRQUxBLHlFQUF5RTtRQUNoRSxXQUFNLEdBQUcsUUFBVSxDQUFDO1FBRXJCLGFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBbUIsQ0FBQztJQUV2QixDQUFDO0lBRWpCLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSTtRQUN0QixNQUFNLElBQUksR0FBRyxJQUFJLFNBQVMsRUFBRSxDQUFDO1FBQzdCLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2xCLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVPLEtBQUssQ0FBQyxPQUFPO1FBQ25CLE1BQU0sY0FBYyxHQUFHLENBQUMsTUFBTSxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDMUUsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLGNBQWMsRUFBRTtZQUNsQyxPQUFPLENBQUMsSUFBSSxDQUNWLGdEQUFnRCxjQUFjLGdCQUFnQixJQUFJLENBQUMsTUFBTSxJQUFJLENBQzlGLENBQUM7WUFDRixNQUFNLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3BDLE1BQU0sT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1NBQzFEO0lBQ0gsQ0FBQztJQUVNLEtBQUssQ0FBQyxJQUFJO1FBQ2YsTUFBTSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDckIsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLE1BQU0sT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFL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NUIsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFMOUMsU0FBSSxHQUFKLElBQUksQ0FBbUI7UUFFdkIsaUJBQVksR0FBWixZQUFZLENBQVE7UUFDcEIsZ0JBQVcsR0FBWCxXQUFXLENBQVE7SUFHOUIsQ0FBQztDQUNGO0FBRUQsTUFBTSxPQUFPLE1BQU8sU0FBUSxTQUFTO0lBQ25DLFlBQ0UsR0FBVyxFQUNYLEdBQVcsRUFDRixPQUFPLFFBQWlCLEVBQ2pDLElBQVksRUFDSCxZQUFvQixFQUNwQixXQUFtQixFQUNuQixJQUFtQjtRQUU1QixLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxXQUFXLENBQUMsQ0FBQztRQU45QyxTQUFJLEdBQUosSUFBSSxDQUFvQjtRQUV4QixpQkFBWSxHQUFaLFlBQVksQ0FBUTtRQUNwQixnQkFBVyxHQUFYLFdBQVcsQ0FBUTtRQUNuQixTQUFJLEdBQUosSUFBSSxDQUFlO0lBRzlCLENBQUM7Q0FDRjtBQUVELE1BQU0sT0FBTyxZQUFhLFNBQVEsU0FBUztJQUN6QyxZQUNFLEdBQVcsRUFDWCxHQUFXLEVBQ0YsT0FBTyxjQUF1QixFQUN2QyxJQUFZLEVBQ0gsWUFBb0IsRUFDcEIsV0FBbUIsRUFDbkIsSUFBbUI7UUFFNUIsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFOOUMsU0FBSSxHQUFKLElBQUksQ0FBMEI7UUFFOUIsaUJBQVksR0FBWixZQUFZLENBQVE7UUFDcEIsZ0JBQVcsR0FBWCxXQUFXLENBQVE7UUFDbkIsU0FBSSxHQUFKLElBQUksQ0FBZTtJQUc5QixDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyByZWNvcmRzIGZyb20gXCIuL3JlY29yZHMuanNcIjtcblxuZXhwb3J0IHR5cGUgU2t1ID0gR2FtZSB8IEFkZE9uIHwgQnVuZGxlIHwgU3Vic2NyaXB0aW9uO1xuXG5leHBvcnQgY2xhc3MgRGF0YVN0b3JlIHtcbiAgLy8gVXBkYXRlIHRvIGNsZWFyIGV4aXN0aW5nIGRhdGEgd2hlbiBtYWtpbmcgaW5jb21wYXRpYmxlIHNjaGVtYSBjaGFuZ2VzLlxuICByZWFkb25seSBzY2hlbWEgPSAyMF8yMDAyXzA1O1xuXG4gIHByaXZhdGUgc2t1c0J5SWQgPSBuZXcgTWFwPFNrdVtcInNrdVwiXSwgU2t1PigpO1xuXG4gIHByaXZhdGUgY29uc3RydWN0b3IoKSB7fVxuXG4gIHB1YmxpYyBzdGF0aWMgYXN5bmMgb3BlbigpIHtcbiAgICBjb25zdCBkYXRhID0gbmV3IERhdGFTdG9yZSgpO1xuICAgIGF3YWl0IGRhdGEubG9hZCgpO1xuICAgIHJldHVybiBkYXRhO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBtaWdyYXRlKCkge1xuICAgIGNvbnN0IGV4aXN0aW5nU2NoZW1hID0gKGF3YWl0IGJyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQoXCJzY2hlbWFcIikpLnNjaGVtYTtcbiAgICBpZiAodGhpcy5zY2hlbWEgIT09IGV4aXN0aW5nU2NoZW1hKSB7XG4gICAgICBjb25zb2xlLmluZm8oXG4gICAgICAgIGBSZXNldHRpbmcgZXh0ZW5zaW9uIHN0b3JhZ2UgKGRhdGEgc2NoZW1hIHdhcyAke2V4aXN0aW5nU2NoZW1hfSBidXQgd2UgbmVlZCAke3RoaXMuc2NoZW1hfSkuYFxuICAgICAgKTtcbiAgICAgIGF3YWl0IGJyb3dzZXIuc3RvcmFnZS5sb2NhbC5jbGVhcigpO1xuICAgICAgYXdhaXQgYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCh7IHNjaGVtYTogdGhpcy5zY2hlbWEgfSk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGxvYWQoKSB7XG4gICAgYXdhaXQgdGhpcy5taWdyYXRlKCk7XG4gICAgY29uc3QgeyBza3VzQnlJZCB9ID0gYXdhaXQgYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldChbXCJza3VzQnlJZFwiXSk7XG4gICAgY29uc29sZS5kZWJ1ZyhcImknZCBsaWtlIHRvIGxvYWRcIiwgc2t1c0J5SWQpO1xuICB9XG5cbiAgcHVibGljIGFzeW5jIHNhdmUoKSB7XG4gICAgYXdhaXQgdGhpcy5taWdyYXRlKCk7XG4gICAgYXdhaXQgYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCh7XG4gICAgICBza3VzQnlJZDogcmVjb3Jkcy5zb3J0ZWQoT2JqZWN0LmZyb21FbnRyaWVzKHRoaXMuc2t1c0J5SWQuZW50cmllcygpKSksXG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgdmFsdWVzKCk6IEl0ZXJhYmxlPFNrdT4ge1xuICAgIHJldHVybiB0aGlzLnNrdXNCeUlkLnZhbHVlcygpO1xuICB9XG5cbiAgcHVibGljIGdldChpZDogc3RyaW5nKTogU2t1IHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5za3VzQnlJZC5nZXQoaWQpO1xuICB9XG5cbiAgcHVibGljIHVwc2VydChza3U6IFNrdSk6IFNrdSB7XG4gICAgY29uc3QgZXhpc3RpbmcgPSB0aGlzLnNrdXNCeUlkLmdldChza3Uuc2t1KTtcbiAgICBpZiAoZXhpc3RpbmcgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5za3VzQnlJZC5zZXQoc2t1LnNrdSwgc2t1KTtcbiAgICAgIGNvbnNvbGUuaW5mbyhcIlNLVSBhZGRlZFwiLCBza3UpO1xuICAgICAgcmV0dXJuIHNrdTtcbiAgICB9XG5cbiAgICBpZiAoZXhpc3RpbmcgIT09IHNrdSkge1xuICAgICAgaWYgKEpTT04uc3RyaW5naWZ5KGV4aXN0aW5nKSAhPT0gSlNPTi5zdHJpbmdpZnkoc2t1KSkge1xuICAgICAgICBjb25zdCBwcmV2aW91cyA9IHsgLi4uZXhpc3RpbmcgfTtcbiAgICAgICAgY29uc29sZS5pbmZvKFxuICAgICAgICAgIFwiU0tVIHVwZGF0ZWQsIGFkZGluZ1wiLFxuICAgICAgICAgIHNrdSxcbiAgICAgICAgICBcInRvXCIsXG4gICAgICAgICAgcHJldmlvdXMsXG4gICAgICAgICAgXCJwcm9kdWNpbmdcIixcbiAgICAgICAgICBleGlzdGluZ1xuICAgICAgICApO1xuICAgICAgICBPYmplY3QuYXNzaWduKGV4aXN0aW5nLCBza3UpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBleGlzdGluZztcbiAgfVxuXG4gIC8vICAgaWYgKGV4aXN0aW5nKSB7XG4gIC8vICAgICBjb25zdCBleGlzdGluZ0pzb24gPSBKU09OLnN0cmluZ2lmeShleGlzdGluZyk7XG4gIC8vICAgICBjb25zdCBuZXdKc29uID0gSlNPTi5zdHJpbmdpZnkoc2t1KTtcbiAgLy8gICAgIGlmIChleGlzdGluZ0pzb24gIT09IG5ld0pzb24pIHtcbiAgLy8gICAgICAgY29uc29sZS53YXJuKGBza3VzIGhhZCBzYW1lIGlkcyBidXQgZGlmZmVyZW50IHByb3BlcnRpZXMuYCk7XG4gIC8vICAgICAgIE9iamVjdC5hc3NpZ24oZXhpc3RpbmcsIHNrdSk7XG4gIC8vICAgICB9XG4gIC8vICAgICByZXR1cm4gZXhpc3Rpbmc7XG4gIC8vICAgfSBlbHNlIHtcbiAgLy8gICAgIHRoaXMuc2t1c1tza3Uuc2t1XSA9IHNrdTtcbiAgLy8gICAgIHJldHVybiBza3U7XG4gIC8vICAgfVxuICAvLyB9XG59XG5cbmV4cG9ydCBjb25zdCBsb2NhbEtleSA9IChza3U6IFNrdSB8IENvbW1vblNrdSkgPT4ge1xuICBjb25zdCBsZW5ndGggPSAzMjtcbiAgY29uc3QgbWF4TmFtZUxlbmd0aCA9IDIzO1xuICBjb25zdCB0eXBlVGFnID1cbiAgICAoeyBnYW1lOiBcImdcIiwgYWRkb246IFwib1wiLCBidW5kbGU6IFwieFwiLCBzdWJzY3JpcHRpb246IFwiY1wiIH0gYXMgYW55KVtcbiAgICAgIHNrdS50eXBlXG4gICAgXSA/PyBgPyR7c2t1LnR5cGV9P2A7XG4gIGNvbnN0IGlkc1ByZWZpeCA9IHNrdS5hcHAuc2xpY2UoMCwgNikgKyBza3Uuc2t1LnNsaWNlKDAsIDIpO1xuICBjb25zdCBpZHNSZXN0ID0gc2t1LmFwcC5zbGljZSg2KSArIHNrdS5za3Uuc2xpY2UoMik7XG5cbiAgbGV0IG5hbWUgPSAoc2t1Lm5hbWUgKyBza3UuaW50ZXJuYWxTbHVnKVxuICAgIC50b0xvd2VyQ2FzZSgpXG4gICAgLnJlcGxhY2UoL1teYS16MC05XSsvZywgXCJcIik7XG5cbiAgaWYgKG5hbWUubGVuZ3RoID4gbWF4TmFtZUxlbmd0aCkge1xuICAgIGNvbnN0IGxldHRlckNvdW50czogUmVjb3JkPHN0cmluZywgbnVtYmVyPiA9IHt9O1xuICAgIGZvciAoY29uc3QgbGV0dGVyIG9mIG5hbWUpIHtcbiAgICAgIGxldHRlckNvdW50c1tsZXR0ZXJdID0gKGxldHRlckNvdW50c1tsZXR0ZXJdIHx8IDApICsgMTtcbiAgICB9XG4gICAgd2hpbGUgKG5hbWUubGVuZ3RoID4gbWF4TmFtZUxlbmd0aCkge1xuICAgICAgY29uc3QgbW9zdEZyZXF1ZW50Q291bnQgPSBNYXRoLm1heCguLi5PYmplY3QudmFsdWVzKGxldHRlckNvdW50cykpO1xuICAgICAgY29uc3QgbW9zdEZyZXF1ZW50ID0gT2JqZWN0LmVudHJpZXMobGV0dGVyQ291bnRzKVxuICAgICAgICAuZmlsdGVyKChbX2xldHRlciwgY291bnRdKSA9PiBjb3VudCA9PSBtb3N0RnJlcXVlbnRDb3VudClcbiAgICAgICAgLm1hcCgoW2xldHRlciwgX2NvdW50XSkgPT4gbGV0dGVyKTtcbiAgICAgIGZvciAobGV0IGkgPSBuYW1lLmxlbmd0aCAtIDE7IGkgPj0gMDsgaSAtPSAxKSB7XG4gICAgICAgIGNvbnN0IGxldHRlciA9IG5hbWVbaV07XG4gICAgICAgIGlmIChtb3N0RnJlcXVlbnQuaW5jbHVkZXMobGV0dGVyKSkge1xuICAgICAgICAgIG5hbWUgPSBuYW1lLnNsaWNlKDAsIGkpICsgbmFtZS5zbGljZShpICsgMSk7XG4gICAgICAgICAgbGV0dGVyQ291bnRzW2xldHRlcl0gLT0gMTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiAodHlwZVRhZyArIGlkc1ByZWZpeCArIG5hbWUgKyBpZHNSZXN0KS5zbGljZSgwLCBsZW5ndGgpO1xufTtcblxuZXhwb3J0IGNsYXNzIENvbW1vblNrdSB7XG4gIHJlYWRvbmx5IHByb1ByaWNlQ2VudHM6IG51bWJlciB8IG51bGwgPSBudWxsO1xuICByZWFkb25seSBwcm9TYWxlUHJpY2VDZW50czogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG4gIHJlYWRvbmx5IGJhc2VQcmljZUNlbnRzOiBudW1iZXIgfCBudWxsID0gbnVsbDtcbiAgcmVhZG9ubHkgYmFzZVNhbGVQcmljZUNlbnRzOiBudW1iZXIgfCBudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICByZWFkb25seSBhcHA6IHN0cmluZyxcbiAgICByZWFkb25seSBza3U6IHN0cmluZyxcbiAgICByZWFkb25seSB0eXBlOiBcImdhbWVcIiB8IFwiYWRkb25cIiB8IFwiYnVuZGxlXCIgfCBcInN1YnNjcmlwdGlvblwiLFxuICAgIHJlYWRvbmx5IG5hbWU6IHN0cmluZyxcbiAgICByZWFkb25seSBpbnRlcm5hbFNsdWc6IHN0cmluZyxcbiAgICByZWFkb25seSBkZXNjcmlwdGlvbjogc3RyaW5nXG4gICkge1xuICAgIHRoaXMubG9jYWxLZXkgPSBsb2NhbEtleSh0aGlzKTtcbiAgfVxuICByZWFkb25seSBsb2NhbEtleTogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgR2FtZSBleHRlbmRzIENvbW1vblNrdSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIGFwcDogc3RyaW5nLFxuICAgIHNrdTogc3RyaW5nLFxuICAgIHJlYWRvbmx5IHR5cGUgPSBcImdhbWVcIiBhcyBjb25zdCxcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgcmVhZG9ubHkgaW50ZXJuYWxTbHVnOiBzdHJpbmcsXG4gICAgcmVhZG9ubHkgZGVzY3JpcHRpb246IHN0cmluZ1xuICApIHtcbiAgICBzdXBlcihhcHAsIHNrdSwgdHlwZSwgbmFtZSwgaW50ZXJuYWxTbHVnLCBkZXNjcmlwdGlvbik7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEFkZE9uIGV4dGVuZHMgQ29tbW9uU2t1IHtcbiAgY29uc3RydWN0b3IoXG4gICAgYXBwOiBzdHJpbmcsXG4gICAgc2t1OiBzdHJpbmcsXG4gICAgcmVhZG9ubHkgdHlwZSA9IFwiYWRkb25cIiBhcyBjb25zdCxcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgcmVhZG9ubHkgaW50ZXJuYWxTbHVnOiBzdHJpbmcsXG4gICAgcmVhZG9ubHkgZGVzY3JpcHRpb246IHN0cmluZ1xuICApIHtcbiAgICBzdXBlcihhcHAsIHNrdSwgdHlwZSwgbmFtZSwgaW50ZXJuYWxTbHVnLCBkZXNjcmlwdGlvbik7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEJ1bmRsZSBleHRlbmRzIENvbW1vblNrdSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIGFwcDogc3RyaW5nLFxuICAgIHNrdTogc3RyaW5nLFxuICAgIHJlYWRvbmx5IHR5cGUgPSBcImJ1bmRsZVwiIGFzIGNvbnN0LFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICByZWFkb25seSBpbnRlcm5hbFNsdWc6IHN0cmluZyxcbiAgICByZWFkb25seSBkZXNjcmlwdGlvbjogc3RyaW5nLFxuICAgIHJlYWRvbmx5IHNrdXM6IEFycmF5PHN0cmluZz5cbiAgKSB7XG4gICAgc3VwZXIoYXBwLCBza3UsIHR5cGUsIG5hbWUsIGludGVybmFsU2x1ZywgZGVzY3JpcHRpb24pO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTdWJzY3JpcHRpb24gZXh0ZW5kcyBDb21tb25Ta3Uge1xuICBjb25zdHJ1Y3RvcihcbiAgICBhcHA6IHN0cmluZyxcbiAgICBza3U6IHN0cmluZyxcbiAgICByZWFkb25seSB0eXBlID0gXCJzdWJzY3JpcHRpb25cIiBhcyBjb25zdCxcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgcmVhZG9ubHkgaW50ZXJuYWxTbHVnOiBzdHJpbmcsXG4gICAgcmVhZG9ubHkgZGVzY3JpcHRpb246IHN0cmluZyxcbiAgICByZWFkb25seSBza3VzOiBBcnJheTxzdHJpbmc+XG4gICkge1xuICAgIHN1cGVyKGFwcCwgc2t1LCB0eXBlLCBuYW1lLCBpbnRlcm5hbFNsdWcsIGRlc2NyaXB0aW9uKTtcbiAgfVxufVxuIl19
