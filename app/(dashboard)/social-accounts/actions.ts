'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function connectAccount(platform: string) {
  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Generate a mock Zernio account ID and handle for the demo
  const zernioId = `zr_acct_${Math.random().toString(36).substr(2, 9)}`
  const handle = `@${user.email?.split('@')[0]}_${platform}`

  // For this demo, we assume the user's "organization" is automatically the first one they belong to,
  // or we create one if they don't have one (since we bypassed the normal org creation flow).
  // Let's check if they have an org, if not, create one.
  let { data: members } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)

  let orgId = members?.[0]?.organization_id

  if (!orgId) {
    // Create an org automatically
    const { data: org } = await supabase
      .from('organizations')
      .insert({ name: `${user.email?.split('@')[0]}'s Org` })
      .select()
      .single()
    
    if (org) {
      orgId = org.id
      await supabase.from('organization_members').insert({
        organization_id: orgId,
        user_id: user.id,
        role: 'ADMIN'
      })
    }
  }

  if (orgId) {
    // Add the connected account
    const { error } = await supabase.from('zernio_connected_accounts').insert({
      organization_id: orgId,
      platform,
      handle,
      zernio_account_id: zernioId,
      status: 'connected'
    })

    if (error) {
      console.error('Failed to connect:', error)
    }
  }

  revalidatePath('/social-accounts')
  redirect('/social-accounts')
}
