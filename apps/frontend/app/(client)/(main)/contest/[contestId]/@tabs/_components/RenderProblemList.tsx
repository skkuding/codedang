export function RenderProblemList(state: string, isRegistered: boolean) {
  console.log('state:', state)
  console.log('registered?:', isRegistered)
  if (state === 'Upcoming') {
    return (
      <div className="h-[608px] w-[1208px] place-content-center rounded-2xl bg-[#d9d9d940]">
        <div className="text-center text-xl font-semibold text-[#000000]">
          {`Contest Hasn't Started`}
        </div>
        <div className="text-center text-base font-normal text-[#00000080]">
          The problem list will be released after the start of the contest
        </div>
      </div>
    )
  } else if (state === 'Ongoing' && !isRegistered) {
    return (
      <div className="h-[608px] w-[1208px] place-content-center rounded-2xl bg-[#d9d9d940]">
        <div className="text-center text-xl font-semibold text-[#000000]">
          Please Register for The Contest First!
        </div>
        <div className="text-center text-base font-normal text-[#00000080]">
          The problem list only be revealed to contest participants
        </div>
      </div>
    )
  } else {
    return <div>Problem List입니다</div>
  }
}
