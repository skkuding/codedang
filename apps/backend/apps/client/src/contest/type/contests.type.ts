import type { ContestResult } from '../contest.service'

export type OngoingUpcomingContests = {
  ongoing: ContestResult[]
  upcoming: ContestResult[]
}

export type RegisteredOngoingUpcomingContests = {
  registeredOngoing: ContestResult[]
  registeredUpcoming: ContestResult[]
}

export type OngoingUpcomingContestsWithRegistered = OngoingUpcomingContests &
  RegisteredOngoingUpcomingContests
