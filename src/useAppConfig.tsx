import { type UnlistenFn, listen } from "@tauri-apps/api/event"
import { useEffect, useRef, useState } from "react"

import { getAppConfig } from "./api"
import type { AppConfig } from "./types"

export default function useAppConfig() {
  const [config, setConfig] = useState<AppConfig | null>(null)

  useEffect(() => {
    let unListen: UnlistenFn | undefined = undefined
    ;(async () => {
      // FIXME: Replace this to check tauri API is ready
      await new Promise((resolve) => setTimeout(resolve, 100))
      const config = await getAppConfig()

      setConfig(config)

      unListen = await listen<AppConfig>(
        "configChanged",
        ({ payload: config }) => {
          setConfig(config)
        },
      )
    })()

    return () => {
      unListen?.()
    }
  }, [])

  const watchingRef = useRef(false)

  useEffect(() => {
    if (watchingRef.current) {
      return
    }

    if (!config?.monitor?.resource.cpu.show) {
      return
    }

    watchingRef.current = true
  }, [config?.monitor?.resource.cpu.show])

  return config
}
