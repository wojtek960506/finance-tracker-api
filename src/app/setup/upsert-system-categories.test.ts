import { describe, expect, it, Mock, vi } from "vitest";

import { upsertSystemNamedResources } from "@app/setup";
import { upsertSystemCategories } from "@app/setup/upsert-system-categories";
import { SYSTEM_CATEGORY_NAMES } from "@utils/consts";

import { CategoryModel } from "@/category/model";

vi.mock("@app/setup", async () => ({
    upsertSystemNamedResources: vi.fn(),
  }
  
  
));

describe('upsertSystemCategories', () => {

  it('delegates to upsertSystemNamedResources', async () => {
    (upsertSystemNamedResources as Mock).mockResolvedValue({} as any);

    await upsertSystemCategories();

    expect(upsertSystemNamedResources).toHaveBeenCalledOnce();
    expect(upsertSystemNamedResources).toHaveBeenCalledWith(CategoryModel, SYSTEM_CATEGORY_NAMES);
  });
});
