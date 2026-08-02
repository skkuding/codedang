function TcOutputCard1() {
  return <div>TC 아웃풋 생성 first div content</div>
}

function TcOutputCard2() {
  return <div>TC 아웃풋 생성 second div content</div>
}

function TcOutputCard3() {
  return <div>TC 아웃풋 생성 third div content</div>
}

export const TcOutputTab = {
  value: 'tc-output' as const,
  label: 'TC 아웃풋 생성',
  cards: [TcOutputCard1, TcOutputCard2, TcOutputCard3]
}
