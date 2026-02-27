import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/shadcn/dialog'
import compileIcon from '@/public/icons/compile-version.svg'
import Image from 'next/image'
import { FaRegFile } from 'react-icons/fa6'

export function ReferenceDialog() {
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
          className="h-[415px] w-[580px] max-w-none rounded-2xl border-none bg-slate-900 text-gray-300"
        >
          <DialogHeader>
            <DialogTitle className="text-title1_sb_20 text-white">
              Compiler Version Document
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto rounded-[10px] border border-slate-600">
            <table className="text-body4_r_14 min-w-full bg-[#222939] text-left">
              <thead className="text-caption4_r_12 border-b border-slate-600 bg-slate-800 text-[#C4CACC]">
                <tr>
                  <th className="text-body3_r_16 py-3 pl-4">Language</th>
                  <th className="text-body3_r_16 py-3 pl-4">Time Limit</th>

                  <th className="text-body3_r_16 py-3 pl-4">Memory Limit</th>
                  <th className="text-body3_r_16 px-3 py-3">
                    Compiler Version Document
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-600 bg-slate-900">
                  <td className="py-3 pl-4">C</td>
                  <td className="py-3 pl-4 text-[#8A8A8A]">-</td>
                  <td className="py-3 pl-4 text-[#8A8A8A]">-</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center space-x-2 pb-2">
                      <a
                        href="https://cplusplus.com/reference/clibrary/"
                        target="_blank"
                      >
                        <FaRegFile size={16} />
                      </a>
                      <span>gcc 13.2.0</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a
                        href="https://cplusplus.com/reference/clibrary/"
                        target="_blank"
                      >
                        <FaRegFile size={16} />
                      </a>
                      <span>c11</span>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-slate-600 bg-slate-900">
                  <td className="py-3 pl-4">C++</td>
                  <td className="py-3 pl-4 text-[#8A8A8A]">-</td>
                  <td className="py-3 pl-4 text-[#8A8A8A]">-</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center space-x-2 pb-2">
                      <a
                        href="https://cplusplus.com/reference/"
                        target="_blank"
                      >
                        <FaRegFile size={16} />
                      </a>
                      <span>g++ 13.2.0</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a
                        href="https://cplusplus.com/reference/"
                        target="_blank"
                      >
                        <FaRegFile size={16} />
                      </a>
                      <span>c++ 14</span>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-slate-600 bg-slate-900">
                  <td className="py-3 pl-4">Java</td>
                  <td className="py-3 pl-4 text-[#8A8A8A]">x2+1 sec</td>
                  <td className="py-3 pl-4 text-[#8A8A8A]">x2+16 MB</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center space-x-2">
                      <a
                        href="https://docs.oracle.com/en/java/javase/17/docs/api/index.html"
                        target="_blank"
                      >
                        <FaRegFile size={16} />
                      </a>
                      <span>openjdk 17.0.11</span>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-slate-600 bg-slate-900">
                  <td className="py-3 pl-4">Python</td>
                  <td className="py-3 pl-4 text-[#8A8A8A]">x3+2 sec</td>
                  <td className="py-3 pl-4 text-[#8A8A8A]">x2+32 MB</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center space-x-2">
                      <a
                        href="https://docs.python.org/3.12/library/index.html"
                        target="_blank"
                      >
                        <FaRegFile size={16} />
                      </a>
                      <span>python 3.12.3</span>
                    </div>
                  </td>
                </tr>
                <tr className="bg-slate-900">
                  <td className="py-3 pl-4">PyPy3</td>
                  <td className="py-3 pl-4 text-[#8A8A8A]">x3+2 sec</td>
                  <td className="py-3 pl-4 text-[#8A8A8A]">x2+128 MB</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center space-x-2">
                      <a href="https://pypy.org/" target="_blank">
                        <FaRegFile size={16} />
                      </a>
                      <span>Python 3.1.0.14, PyPy 7.3.17</span>
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
