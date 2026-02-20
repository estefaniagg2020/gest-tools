import { afterEach } from "vitest";

import { queryClient } from "@/lib/queryClient";

afterEach(() => {
  queryClient.clear();
});
