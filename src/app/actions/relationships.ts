'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const personSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.union([z.literal(''), z.string().trim().email('Enter a valid email')]),
})

const groupSchema = z.object({
  name: z.string().trim().min(1, 'Group name is required').max(100),
  kind: z.enum(['family', 'friend', 'team', 'other']),
  memberIds: z.array(z.string().uuid()).min(1, 'Choose at least one person'),
})

async function authenticatedClient() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Please sign in again.')
  }
  return { supabase, user }
}

export async function createPerson(input: { name: string; email: string }) {
  const parsed = personSchema.safeParse(input)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Check the person details.')
  }

  const { supabase, user } = await authenticatedClient()
  const { error } = await supabase.from('people').insert({
    owner_user_id: user.id,
    name: parsed.data.name,
    email: parsed.data.email || null,
    is_self: false,
  })

  if (error) {
    console.error('Create person failed:', error.message)
    throw new Error('Could not add that person.')
  }

  revalidatePath('/my-relationships')
}

export async function deletePerson(personId: string) {
  const id = z.string().uuid().parse(personId)
  const { supabase, user } = await authenticatedClient()
  const { error } = await supabase
    .from('people')
    .delete()
    .eq('id', id)
    .eq('owner_user_id', user.id)
    .eq('is_self', false)

  if (error) {
    console.error('Delete person failed:', error.message)
    throw new Error('Could not remove that person.')
  }

  revalidatePath('/my-relationships')
}

export async function createGroup(input: {
  name: string
  kind: string
  memberIds: string[]
}) {
  const parsed = groupSchema.safeParse(input)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Check the group details.')
  }

  const { supabase, user } = await authenticatedClient()
  const { data: ownedPeople, error: peopleError } = await supabase
    .from('people')
    .select('id')
    .eq('owner_user_id', user.id)
    .in('id', parsed.data.memberIds)

  if (peopleError || ownedPeople?.length !== new Set(parsed.data.memberIds).size) {
    throw new Error('One or more selected people are unavailable.')
  }

  const { data: group, error: groupError } = await supabase
    .from('groups')
    .insert({
      owner_user_id: user.id,
      name: parsed.data.name,
      kind: parsed.data.kind,
    })
    .select('id')
    .single()

  if (groupError || !group) {
    console.error('Create group failed:', groupError?.message)
    throw new Error('Could not create that group.')
  }

  const { error: membersError } = await supabase.from('group_members').insert(
    Array.from(new Set(parsed.data.memberIds)).map((personId) => ({
      group_id: group.id,
      person_id: personId,
    }))
  )

  if (membersError) {
    await supabase.from('groups').delete().eq('id', group.id)
    console.error('Create group members failed:', membersError.message)
    throw new Error('Could not add the selected people to that group.')
  }

  revalidatePath('/my-relationships')
}

export async function deleteGroup(groupId: string) {
  const id = z.string().uuid().parse(groupId)
  const { supabase, user } = await authenticatedClient()
  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', id)
    .eq('owner_user_id', user.id)

  if (error) {
    console.error('Delete group failed:', error.message)
    throw new Error('Could not remove that group.')
  }

  revalidatePath('/my-relationships')
}
