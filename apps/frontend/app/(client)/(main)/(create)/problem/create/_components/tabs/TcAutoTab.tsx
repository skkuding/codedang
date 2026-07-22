function TcAutoCard1() {
  return <div>TC 자동 생성 first div content</div>
}

function TcAutoCard2() {
  return <div>TC 자동 생성 second div content</div>
}

function TcAutoCard3() {
  return <div>TC 자동 생성 third div content</div>
}

function TcAutoCard4() {
  return <div>TC 자동 생성 fourth div content</div>
}

export const TcAutoTab = {
  value: 'tc-auto' as const,
  label: 'TC 자동 생성',
  cards: [TcAutoCard1, TcAutoCard2, TcAutoCard3, TcAutoCard4]
}
