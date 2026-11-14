export function isManagementNavItemActive(
  pathname: string,
  itemPath: string
): boolean {
  if (itemPath === '/admin') {
    return pathname === itemPath
  }

  if (
    itemPath === '/admin/course' &&
    (pathname === '/admin/blueprint' ||
      pathname.startsWith('/admin/blueprint/'))
  ) {
    return true
  }

  return pathname.startsWith(itemPath)
}
