'use client'

import { useState } from 'react'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react'
import InDevelopmentDialog from '@/components/dialogs/InDevelopmentDialog'

const addItems = ['Person', 'Group']
const relationshipItems = ['Partner', 'Friend', 'Family', 'Team', 'My Projects']

export default function MyRelationshipsActions() {
  const [dialogFeature, setDialogFeature] = useState<string | null>(null)

  return (
    <>
      <div className="flex gap-3 mb-8">
        <Menu>
          <MenuButton className="rounded-full bg-accent text-white px-4 py-1.5 text-sm font-bold hover:bg-accent/90 transition-colors">
            Add
          </MenuButton>
          <MenuItems
            anchor="bottom start"
            className="z-[100] mt-2 min-w-[160px] rounded-xl bg-white/95 backdrop-blur shadow-lg p-2"
          >
            {addItems.map((item) => (
              <MenuItem key={item}>
                {({ focus }) => (
                  <button
                    type="button"
                    onClick={() => setDialogFeature(item)}
                    className={`block w-full text-left px-4 py-2 rounded-lg text-sm ${
                      focus ? 'bg-accent/10 text-accent' : 'text-gray-700'
                    }`}
                  >
                    {item}
                  </button>
                )}
              </MenuItem>
            ))}
          </MenuItems>
        </Menu>

        <Menu>
          <MenuButton className="rounded-full bg-accent text-white px-4 py-1.5 text-sm font-bold hover:bg-accent/90 transition-colors">
            Relationship Type
          </MenuButton>
          <MenuItems
            anchor="bottom start"
            className="z-[100] mt-2 min-w-[160px] rounded-xl bg-white/95 backdrop-blur shadow-lg p-2"
          >
            {relationshipItems.map((item) => (
              <MenuItem key={item}>
                {({ focus }) => (
                  <button
                    type="button"
                    onClick={() => setDialogFeature(item)}
                    className={`block w-full text-left px-4 py-2 rounded-lg text-sm ${
                      focus ? 'bg-accent/10 text-accent' : 'text-gray-700'
                    }`}
                  >
                    {item}
                  </button>
                )}
              </MenuItem>
            ))}
          </MenuItems>
        </Menu>
      </div>

      <InDevelopmentDialog
        isOpen={dialogFeature !== null}
        onClose={() => setDialogFeature(null)}
        feature={dialogFeature ?? ''}
      />
    </>
  )
}
