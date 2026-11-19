import { InputForm } from './InputForm'

export function ContactForm() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-sub1_sb_18">Contact</span>
        <span className="rounded bg-[#F5F5F5] px-2 py-1 text-xs text-[#8A8A8A]">
          Opt
        </span>
      </div>

      <div className="flex flex-col gap-[10px] rounded-[10px] bg-[#F5F5F5] p-5">
        <div className="flex items-end gap-2">
          <InputForm
            label="Email"
            placeholder="example"
            name="emailLocal"
            type="text"
            className="w-[45%]"
          />
          <span className="select-none py-[10px]">@</span>
          <InputForm
            placeholder="skku.edu"
            name="emailDomain"
            type="text"
            className="w-[55%]"
          />
        </div>

        <div className="flex items-end gap-2">
          <InputForm
            label="Phone Number"
            placeholder="010"
            name="phoneNum1"
            type="text"
            maxLength={3}
            className="w-[28%]"
          />
          <span className="select-none py-[10px]">-</span>
          <InputForm
            placeholder="1234"
            name="phoneNum2"
            type="text"
            maxLength={4}
            className="w-[36%]"
          />
          <span className="select-none py-[10px]">-</span>
          <InputForm
            placeholder="5678"
            name="phoneNum3"
            type="text"
            maxLength={4}
            className="w-[36%]"
          />
        </div>

        <InputForm
          label="Office"
          placeholder="제2공학관 26B12A호"
          name="office"
          type="text"
        />

        <InputForm
          label="Website"
          placeholder="https://example.com"
          name="website"
          type="text"
        />
      </div>
    </div>
  )
}
