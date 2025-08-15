'use client'

import { CHANNEL_TALK_KEY } from '@/libs/constants'
import { useSession } from '@/libs/hooks/useSession'
import * as ChannelService from '@channel.io/channel-web-sdk-loader'
import { useEffect } from 'react'

export function ChannelIO() {
  const session = useSession()
  const username = session?.user.username ?? null

  useEffect(() => {
    ChannelService.loadScript()
    ChannelService.boot({
      pluginKey: CHANNEL_TALK_KEY,
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
