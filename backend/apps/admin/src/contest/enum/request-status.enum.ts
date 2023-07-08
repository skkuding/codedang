export enum RequestStatus {
  pending, // public 요청 후 대기 중
  accept, // public 요청 승인됨
  reject, // publice 요청 거절됨
  none // public 전환을 요청하지 않은 contest
}
