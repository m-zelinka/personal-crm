import { useCallback, useEffect, useState } from 'react'

export function useClipboard(value: string, timeout = 1500) {
  const [{ state, i }, setState] = useState<{
    state: 'idle' | 'copied'
    i: number
  }>({ state: 'idle', i: 0 })
  const hasCopied = state === 'copied'

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(value)
    setState({ state: 'copied', i: i + 1 })
  }, [i, value])

  useEffect(() => {
    if (hasCopied) {
      const timeoutId = window.setTimeout(() => {
        setState({ state: 'idle', i: i + 1 })
      }, timeout)

      return function cleanup() {
        window.clearTimeout(timeoutId)
      }
    }
  }, [hasCopied, i, timeout])

  return { copy, hasCopied }
}
