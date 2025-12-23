'use client'

import { CautionDialog } from '@/app/admin/_components/CautionDialog'
import { UPLOAD_IMAGE } from '@/graphql/problem/mutations'
import { cn } from '@/libs/utils'
import imageUpload from '@/public/icons/image-upload.svg'
import { useMutation } from '@apollo/client'
import Image from 'next/image'
import React, { useCallback, useRef, useState } from 'react'
import { useController, useFormContext } from 'react-hook-form'

interface PosterUploadFormProps {
  name: string
  disabled?: boolean
}

export function PosterUploadForm({
  name,
  disabled = false
}: PosterUploadFormProps) {
  const {
    control
    // formState: { errors }
  } = useFormContext()

  const { field } = useController({
    name,
    control
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isCautionDialogOpen, setIsCautionDialogOpen] = useState(false)
  const [cautionDialogDescription, setCautionDialogDescription] =
    useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addImage = useCallback((posterUrl: string | undefined) => {
    if (posterUrl) {
      field.onChange(posterUrl)
      setIsLoading(false)
    }
  }, [])

  const [uploadImage] = useMutation(UPLOAD_IMAGE)

  const handleUploadPhoto = async (files: FileList | null) => {
    console.log('Bucket name:', process.env.NEXT_PUBLIC_MEDIA_BUCKET_NAME)
    console.log('App env:', process.env.NEXT_PUBLIC_APP_ENV)
    if (files === null) {
      return
    }
    const file = files[0]
    setIsLoading(true)
    try {
      const { data } = await uploadImage({
        variables: {
          input: { file }
        }
      })
      const newposterUrl = data?.uploadImage.src ?? ''
      addImage(newposterUrl)
      return newposterUrl
    } catch (error) {
      setIsLoading(false)
      if (error instanceof Error) {
        const errorMessage = error.message
        if (errorMessage === 'File size exceeds maximum limit') {
          // TODO: errorMessage 확인 후 수정
          setCautionDialogDescription(
            'Images larger than 20MB cannot be uploaded.'
          )
          setIsCautionDialogOpen(true)
        }
      }
    }
  }

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <>
      <div
        onClick={handleClick}
        className={cn(
          'relative z-10 flex h-[312px] w-[234px] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-[#80808029] bg-[#80808014] text-[#3333334D]',
          field.value ? 'bg-white' : 'bg-[#80808014]',
          disabled && 'cursor-not-allowed'
        )}
      >
        {isLoading ? (
          <div className="text-center text-[11px] font-normal">Loading...</div>
        ) : (
          <div className="flex shrink-0 rounded-xl">
            <Image
              src={field.value || imageUpload}
              alt="Contest Poster"
              width={234}
              height={312}
              className={cn(
                'object-contain',
                field.value ? 'h-[312px] w-[234px]' : 'h-full w-full'
              )}
            />
          </div>
        )}
        {!field.value && !isLoading && (
          <>
            <h1 className="text-xs font-semibold">Upload Your Poster</h1>
            <p className="text-center text-[11px] font-normal">
              Supported Format: PNG, JPEG, JPG
              <br />
              Maximum Size: 20MB
            </p>
          </>
        )}
      </div>
      <input
        type="file"
        accept="image/png, image/jpeg, image/jpg"
        ref={fileInputRef}
        onChange={(e) => handleUploadPhoto(e.target.files)}
        style={{ display: 'none' }}
        disabled={disabled}
      />

      <CautionDialog
        isOpen={isCautionDialogOpen}
        onClose={() => setIsCautionDialogOpen(false)}
        description={cautionDialogDescription}
      />
    </>
  )
}
