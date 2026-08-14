import { getMandeuldangPermissions, type MandeuldangRole } from './permissions'

// 이후에 백엔드에서 role을 받아오는 로직을 추가할 예정
// 아직은 role을 인자로 받아서 권한을 계산하는 훅만 구현
export function useMandeuldangPermission(
  role: MandeuldangRole | null | undefined
) {
  return getMandeuldangPermissions(role)
}
