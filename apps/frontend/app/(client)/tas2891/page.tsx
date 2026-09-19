//테스트용 페이지
import { Button } from '@/components/shadcn/button'
import Clock from '@/public/icons/clock.svg'

const styles = ['default', 'secondary', 'tertiary', 'lined'] as const
const sizes = ['large', 'middle', 'small'] as const
const width = ['w-[372px]', 'w-[120px]', 'w-102px'] as const
const widthSub = ['w-[131px]', 'w-[131px]', 'w-[110px]'] as const

export default function ButtonTestPage() {
  return (
    <div className="space-y-10 bg-[#424243] p-10">
      <h1 className="text-2xl font-bold text-white">Button Test</h1>

      {styles.map((style) => (
        <section key={style} className="space-y-4">
          <h2 className="text-lg font-semibold text-white">{style}</h2>

          <div className="flex flex-wrap items-center gap-4">
            {sizes.map((size, index) => (
              <Button
                key={`${style}-${size}-enabled`}
                variant={style}
                size={size}
                className={width[index]}
              >
                <Clock className="w-5" />
                {size}
              </Button>
            ))}

            {sizes.map((size, index) => (
              <Button
                key={`${style}-${size}-disabled`}
                variant={style}
                size={size}
                className={width[index]}
                disabled
              >
                <Clock className="w-5" />
                disabled
              </Button>
            ))}
          </div>
        </section>
      ))}
      {sizes.map((size, index) => (
        <section key={size} className="flex flex-wrap gap-4 space-y-4">
          <Button
            variant="primary_sub"
            size={`${size}_sub`}
            className={widthSub[index]}
          >
            <Clock className="w-5" />
            SUB
          </Button>
          <Button
            variant="lined_sub"
            size={`${size}_sub`}
            className={widthSub[index]}
          >
            <Clock className="w-5" />
            SUB
          </Button>
          <Button
            variant="primary_sub"
            size={`${size}_sub`}
            className={widthSub[index]}
            disabled
          >
            <Clock className="w-5" />
            SUB
          </Button>
        </section>
      ))}
      <section className="flex gap-4">
        <Button variant="icon" size="icon_large">
          <Clock className="w-5" />
        </Button>
        <Button variant="icon" size="icon_small">
          <Clock className="w-5" />
        </Button>
      </section>
    </div>
  )
}
