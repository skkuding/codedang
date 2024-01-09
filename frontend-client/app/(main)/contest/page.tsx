import ContestCardList from '../_components/ContestCardList'

export default function Contest() {
  //auth session 따라 registered 타입 추가
  return (
    <>
      <ContestCardList type={'Ongoing'} />
    </>
  )
}
