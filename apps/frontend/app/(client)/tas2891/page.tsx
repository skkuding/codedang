//테스트용 페이지
import { Button } from '@/components/shadcn/button'
import Clock from '@/public/icons/clock.svg'

const styles = ['default', 'secondary', 'tertiary', 'lined'] as const
const sizes = ['large', 'middle', 'small'] as const

export default function ButtonTestPage() {
  return (
    <div className="space-y-10 bg-[#424243] p-10">
      <h1 className="text-2xl font-bold text-white">Button Test</h1>

      {styles.map((style) => (
        <section key={style} className="space-y-4">
          <h2 className="text-lg font-semibold text-white">{style}</h2>

          <div className="flex flex-wrap items-center gap-4">
            {sizes.map((size) => (
              <Button
                key={`${style}-${size}-enabled`}
                variant={style}
                size={size}
              >
                <Clock className="w-5" />
                {size}
              </Button>
            ))}

            {sizes.map((size) => (
              <Button
                key={`${style}-${size}-disabled`}
                variant={style}
                size={size}
                disabled
              >
                <Clock className="w-5" />
                disabled
              </Button>
            ))}
          </div>
        </section>
      ))}
      {sizes.map((size) => (
        <section key={size} className="flex flex-wrap gap-4 space-y-4">
          <Button variant="primary_sub" size={`${size}_sub`}>
            <Clock className="w-5" />
            SUB
          </Button>
          <Button variant="lined_sub" size={`${size}_sub`}>
            <Clock className="w-5" />
            SUB
          </Button>
          <Button variant="primary_sub" size={`${size}_sub`} disabled>
            <Clock className="w-5" />
            SUB
          </Button>
        </section>
      ))}
      <Button variant="icon" size="icons">
        <Clock className="w-6" />
      </Button>
    </div>
  )
}
