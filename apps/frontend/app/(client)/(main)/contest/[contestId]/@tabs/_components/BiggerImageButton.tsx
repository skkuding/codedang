'use client'

import { Button } from '@/components/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/shadcn/dialog'
import { Input } from '@/components/shadcn/input'
import { cn, safeFetcherWithAuth } from '@/libs/utils'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { IoSearchCircle } from 'react-icons/io5'
import { toast } from 'sonner'
import * as v from 'valibot'

const schema = v.object({
  invitationCode: v.pipe(v.string(), v.length(6))
})

export function BiggerImageButton({ description }: { description: string }) {}
