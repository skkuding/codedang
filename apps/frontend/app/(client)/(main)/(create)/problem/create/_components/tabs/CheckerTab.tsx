function CheckerCard1() {
  return <div>특수 채점 first div content</div>
}

export const CheckerTab = {
  value: 'checker' as const,
  label: '특수 채점',
  cards: [CheckerCard1]
}
