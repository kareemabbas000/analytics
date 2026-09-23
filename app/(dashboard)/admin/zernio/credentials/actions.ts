'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { encrypt } from '@/lib/encryption'
import { revalidatePath } from 'next/cache'

export async function addCredential(formData: FormData) {
  const supabase = await createClient()

  // Verify super admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.app_metadata?.is_super_admin) {
    throw new Error('Unauthorized')
  }

  const name = formData.get('name') as string
  const apiKey = formData.get('api_key') as string
  const description = formData.get('description') as string
  const priority = parseInt(formData.get('priority') as string) || 1

  if (!name || !apiKey) {
    redirect('/admin/zernio/credentials/new?error=Missing required fields')
  }

  // Encrypt the API key before saving
  let encryptedKey = ''
  try {
    encryptedKey = encrypt(apiKey)
  } catch (error: any) {
    redirect('/admin/zernio/credentials/new?error=Encryption failed. Ensure ENCRYPTION_KEY is set in .env.local')
  }

  const { error } = await supabase.from('zernio_credentials').insert({
    name,
    api_key_encrypted: encryptedKey,
    description,
    priority,
    status: 'healthy', // Mark new credentials as healthy immediately
    enabled: true
  })

  if (error) {
    redirect(`/admin/zernio/credentials/new?error=${error.message}`)
  }

  revalidatePath('/admin/zernio/credentials')
  redirect('/admin/zernio/credentials')
}
