import { useMemo } from 'react'
import { getMandeuldangPermissions, type MandeuldangRole } from './permissions'

// 백엔드는 현재 사용자의 role을 내려주고 API에서 실제 권한을 검증해야 한다.
// 프론트에서는 전달받은 role로 화면의 노출 및 비활성화 상태만 계산한다.
export function useMandeuldangPermission(
  role: MandeuldangRole | null | undefined
) {
  return useMemo(() => getMandeuldangPermissions(role), [role])
}
