import { useLayoutEffect, useState } from "react";
import { AppConfig, ChartType } from "./types";
import createResourceList from "./createResourceList";

export default function useResourceList(config?: AppConfig | null) {
  const [resourceList, setResourceList] = useState<ChartType[]>([]);

  useLayoutEffect(() => {

    if (!config?.monitor) {
      return;
    }

    (async () => {
      const list = await createResourceList(config.monitor);
      setResourceList(list);
    })();

  }, [config?.monitor])

  return resourceList;
}
