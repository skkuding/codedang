import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/shadcn/accordion'

interface AssignmentAccordionProps {
  week: number
}

export function AssignmentAccordion({ week }: AssignmentAccordionProps) {
  return (
    <>
      {Array.from({ length: week }, (_, i) => i + 1).map((week: number) => (
        <AssignmentAccordionItem key={week} week={week} />
      ))}
    </>
  )
}

interface AssignmentAccordionItemProps {
  week: number
}

function AssignmentAccordionItem({ week }: AssignmentAccordionItemProps) {
  return (
    <Accordion type="single" collapsible className="w-[1208px]">
      <AccordionItem value={week.toString()} className="mx-6 border-b-0">
        <AccordionTrigger
          className="my-2 flex h-[68px] rounded-2xl px-8 text-lg font-semibold shadow-lg"
          iconSize="w-7 h-7"
        >
          <div className="relative text-left">
            <p className="text-primary absolute top-0 w-32 -translate-y-1/2">
              [Week {week}]
            </p>
            <p className="absolute left-32 top-0 w-32 -translate-y-1/2">
              {week}주차
            </p>
          </div>
        </AccordionTrigger>
        <AccordionContent className="mb-10 pb-0 pt-[3px] text-base text-[#00000080]">
          Assignment Contents
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
