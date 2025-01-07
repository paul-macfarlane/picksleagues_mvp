import { ESPNListResponse } from "@/integrations/espn/shared";
import axios from "axios";

export async function getAllRefUrlsFromESPNListUrl(
  listUrl: string,
): Promise<string[]> {
  let response = await axios.get<ESPNListResponse>(`${listUrl}&page=${1}`);

  let refs = response.data.items.map((item) => item.$ref);
  while (response.data.pageIndex < response.data.pageCount) {
    response = await axios.get<ESPNListResponse>(
      `${listUrl}&page=${response.data.pageIndex + 1}`,
    );

    refs = [...refs, ...response.data.items.map((item) => item.$ref)];
  }

  return refs;
}
