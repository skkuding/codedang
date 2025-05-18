'use client'

import { useSession } from '@/libs/hooks/useSession'
import * as ChannelService from '@channel.io/channel-web-sdk-loader'
import { useEffect } from 'react'

export function ChannelIO() {
  const session = useSession()
  const username = session?.user.username ?? null

  useEffect(() => {
    const pluginKey = process.env.NEXT_PUBLIC_CHANNEL_PLUGIN_KEY
    if (!pluginKey) {
      console.warn('Channel plugin key is not defined.')
      return
    }

    ChannelService.loadScript()
    ChannelService.boot({
      pluginKey,
      profile: {
        name: username
      }
    })

    return () => {
      ChannelService.shutdown()
    }
  }, [username])

  return null
}
