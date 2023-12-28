import { IoIosLink } from 'react-icons/io'
import { RiGithubFill } from 'react-icons/ri'
import { RiKakaoTalkFill } from 'react-icons/ri'
import { TbMailFilled } from 'react-icons/tb'

export default function Footer() {
  return (
    <footer className=" items-center py-7">
      <div className="flex h-20 w-full flex-col items-center justify-center gap-2 bg-gray-100">
        <div className="flex flex-row items-center justify-center gap-4">
          <div className="cursor-pointer">
            <RiKakaoTalkFill className="text-gray-500" size="24" />
          </div>
          <div className="cursor-pointer">
            <TbMailFilled className="text-gray-500" size="24" />
          </div>
          <div className="cursor-pointer">
            <RiGithubFill className="text-gray-500" size="24" />
          </div>
          <div className="cursor-pointer">
            <IoIosLink className="text-gray-500" size="23" />
          </div>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-500">
            (c) SKKUDING &nbsp;&nbsp;/ Since 2021
          </p>
        </div>
      </div>
    </footer>
  )
}
