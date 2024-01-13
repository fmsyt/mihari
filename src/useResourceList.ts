import { useLayoutEffect, useState } from "react";
import { AppConfig, ResourceGroup } from "./types";
import createResourceList from "./createResourceList";

export default function useResourceList(config?: AppConfig | null) {
  const [resourceList, setResourceList] = useState<ResourceGroup[]>([]);

  useLayoutEffect(() => {

    if (!config) {
      return;
    }

    (async () => {
      const list = await createResourceList(config);
      setResourceList(list);
    })();

  }, [config])

  return resourceList;
}
