'use client'

import { CautionDialog } from '@/app/admin/_components/CautionDialog'
import { UPLOAD_IMAGE } from '@/graphql/problem/mutations'
import imageUpload from '@/public/icons/image-upload.svg'
import { useMutation } from '@apollo/client'
import Image from 'next/image'
import React, { useCallback, useRef, useState } from 'react'

export function ImageUploadSection() {
  const [imageUrl, setImageUrl] = useState<string | undefined>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCautionDialogOpen, setIsCautionDialogOpen] = useState(false)
  const [cautionDialogDescription, setCautionDialogDescription] =
    useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addImage = useCallback((imageUrl: string | undefined) => {
    if (imageUrl) {
      setImageUrl(imageUrl)
      setIsLoading(false)
    }
  }, [])

  const [uploadImage] = useMutation(UPLOAD_IMAGE)

  const handleUploadPhoto = async (files: FileList | null) => {
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
      const newImageUrl = data?.uploadImage.src ?? ''
      addImage(newImageUrl)
      return newImageUrl
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
        className="relative z-10 flex h-[312px] w-[234px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border bg-[#80808014] text-[#3333334D]"
      >
        {isLoading ? (
          <div className="text-center text-[11px] font-normal">Loading...</div>
        ) : (
          <Image
            src={imageUrl || imageUpload}
            alt="Contest Image"
            width={imageUrl ? 234 : undefined}
            height={imageUrl ? 312 : undefined}
          />
        )}
        {!imageUrl && !isLoading && (
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
      />

      <CautionDialog
        isOpen={isCautionDialogOpen}
        onClose={() => setIsCautionDialogOpen(false)}
        description={cautionDialogDescription}
      />
    </>
  )
}
