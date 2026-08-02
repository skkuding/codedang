function TcManualCard1() {
  return <div>TC 수동 생성 first div content</div>
}

function TcManualCard2() {
  return <div>TC 수동 생성 second div content</div>
}

export const TcManualTab = {
  value: 'tc-manual' as const,
  label: 'TC 수동 생성',
  cards: [TcManualCard1, TcManualCard2]
}
