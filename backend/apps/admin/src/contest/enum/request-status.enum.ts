export enum RequestStatus {
  pending = 'PENDING', // public 요청 후 대기 중
  accept = 'ACCEPT', // public 요청 승인됨
  reject = 'REJECT', // publice 요청 거절됨
  none = 'NONE' // public 전환을 요청하지 않은 contest
}
