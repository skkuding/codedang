import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/shadcn/dialog'
import compileIcon from '@/public/icons/compile-version.svg'
import { getTranslate } from '@/tolgee/server'
import { FileText } from 'lucide-react'
import Image from 'next/image'

export async function ReferenceDialog() {
  const t = await getTranslate()
  return (
    <div className="flex px-6">
      <Dialog>
        <DialogTrigger asChild>
          <Image
            className="cursor-pointer"
            src={compileIcon}
            alt="compile"
            width={24}
          />
        </DialogTrigger>
        <DialogContent
          showDarkOverlay={true}
          className="rounded-xl border-none bg-slate-900 text-gray-300 sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle className="font-normal text-white">
              {t('compiler_version_document')}
            </DialogTitle>
          </DialogHeader>
          <div className="rounded-xs overflow-x-auto border border-slate-600">
            <table className="min-w-full bg-slate-900 text-left text-sm">
              <thead className="border-b border-slate-600 bg-slate-800 text-xs">
                <tr>
                  <th className="px-6 py-3">{t('language_header')}</th>
                  <th className="px-6 py-3">
                    {t('compiler_version_document_header')}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-600">
                  <td className="flex px-6 py-4">{t('language_c')}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <a
                        href="https://cplusplus.com/reference/clibrary/"
                        target="_blank"
                      >
                        <FileText size={18} />
                      </a>
                      <span>gcc 13.2.0</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a
                        href="https://cplusplus.com/reference/clibrary/"
                        target="_blank"
                      >
                        <FileText size={18} />
                      </a>
                      <span>c11</span>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-slate-600">
                  <td className="flex px-6 py-4">{t('language_cpp')}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <a
                        href="https://cplusplus.com/reference/"
                        target="_blank"
                      >
                        <FileText size={18} />
                      </a>
                      <span>g++ 13.2.0</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a
                        href="https://cplusplus.com/reference/"
                        target="_blank"
                      >
                        <FileText size={18} />
                      </a>
                      <span>c++ 14</span>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-slate-600">
                  <td className="flex px-6 py-4">{t('language_java')}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <a
                        href="https://docs.oracle.com/en/java/javase/17/docs/api/index.html"
                        target="_blank"
                      >
                        <FileText size={18} />
                      </a>
                      <span>openjdk 17.0.11</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="flex px-6 py-4">{t('language_python')}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <a
                        href="https://docs.python.org/3.12/library/index.html"
                        target="_blank"
                      >
                        <FileText size={18} />
                      </a>
                      <span>python 3.12.3</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
