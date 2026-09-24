import { describe, expect, it } from "vite-plus/test";
import * as Schema from "effect/Schema";

import { CustomModelEntry } from "./model.ts";

const decodeCustomModelEntry = Schema.decodeUnknownSync(CustomModelEntry);

const normal = { id: "normal", label: "Normal", tokens: 272_000, isDefault: true };
const long = { id: "long", label: "Long", tokens: 872_000, modelSuffix: "-long" };

describe("CustomModelEntry context windows", () => {
  it("accepts declared windows alongside other capabilities", () => {
    const entry = {
      slug: "gateway-model",
      capabilities: { optionDescriptors: [{ id: "fastMode", label: "Fast", type: "boolean" }] },
      contextWindows: [normal, long],
    };
    expect(decodeCustomModelEntry(entry)).toEqual(entry);
  });

  it.each([
    ["an empty list", [], "at least one window"],
    ["a repeated id", [normal, { ...long, id: "normal" }], 'id "normal" is used twice'],
    ["two defaults", [normal, { ...long, isDefault: true }], "only one context window"],
    ["a zero token count", [{ ...normal, tokens: 0 }], "tokens"],
    ["a fractional token count", [{ ...normal, tokens: 1.5 }], "tokens"],
  ])("rejects %s", (_case, contextWindows, message) => {
    expect(() => decodeCustomModelEntry({ slug: "gateway-model", contextWindows })).toThrow(
      message,
    );
  });

  it("rejects a hand-written context option next to declared windows", () => {
    expect(() =>
      decodeCustomModelEntry({
        slug: "gateway-model",
        capabilities: {
          optionDescriptors: [
            {
              id: "contextWindow",
              label: "Context Window",
              type: "select",
              options: [{ id: "normal", label: "Normal" }],
            },
          ],
        },
        contextWindows: [normal],
      }),
    ).toThrow('declares contextWindows and a "contextWindow" option');
  });
});
