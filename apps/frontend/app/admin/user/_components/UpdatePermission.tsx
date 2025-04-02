import { Switch } from '@/components/shadcn/switch'
import { UPDATE_PERMISSIONS } from '@/graphql/user/mutation'
import { useMutation } from '@apollo/client'
import type { Row } from '@tanstack/react-table'
import { useState } from 'react'
import type { DataTableUser } from './Columns'

export function UpdatePermission({
  row,
  accessorkey
}: {
  row: Row<DataTableUser>
  accessorkey: string
}) {
  const [UpdatePermission] = useMutation(UPDATE_PERMISSIONS)
  const [canCreateCourse, setCanCreateCourse] = useState(
    row.original.canCreateCourse
  )
  const [canCreateContest, setCanCreateContest] = useState(
    row.original.canCreateContest
  )
  return (
    <div>
      {accessorkey === 'canCreateCourse' ? (
        <Switch
          checked={canCreateCourse}
          onCheckedChange={async (checked) => {
            setCanCreateCourse(checked)
            try {
              await UpdatePermission({
                variables: {
                  input: {
                    userId: row.original.id,
                    canCreateCourse: checked,
                    canCreateContest
                  }
                }
              })
            } catch (error) {
              console.error('Failed to update Course Permission', error)
              setCanCreateCourse(!checked)
            }
          }}
        />
      ) : (
        <Switch
          checked={canCreateContest}
          onCheckedChange={async (checked) => {
            setCanCreateContest(checked)
            try {
              await UpdatePermission({
                variables: {
                  input: {
                    userId: row.original.id,
                    canCreateCourse,
                    canCreateContest: checked
                  }
                }
              })
            } catch (error) {
              console.error('Failed to update Contest Permission', error)
              setCanCreateContest(!checked)
            }
          }}
        />
      )}
    </div>
  )
}
