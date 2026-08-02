function ValidationCard1() {
  return <div>입력 검증 first div content</div>
}

function ValidationCard2() {
  return <div>입력 검증 second div content</div>
}

export const ValidationTab = {
  value: 'validation' as const,
  label: '입력 검증',
  cards: [ValidationCard1, ValidationCard2]
}
