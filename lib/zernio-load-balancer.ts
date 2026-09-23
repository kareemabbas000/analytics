import { createClient } from '@/utils/supabase/server'
import { decrypt } from './encryption'

export interface ZernioCredential {
  id: string
  name: string
  api_key_decrypted: string
  status: string
  priority: number
}

/**
 * The Load Balancer implements ACCOUNT AFFINITY + HEALTH AWARE ROUTING.
 */
export class ZernioLoadBalancer {
  private orgId: string

  constructor(orgId: string) {
    this.orgId = orgId
  }

  /**
   * Retrieves the best authorized credential for a specific connected account.
   * Maintains account affinity if the assigned credential is healthy.
   * Fails over if necessary.
   */
  async getCredentialForAccount(connectedAccountId: string): Promise<ZernioCredential> {
    const supabase = await createClient()

    // 1. Get the account and its currently assigned credential
    const { data: account, error: accountError } = await supabase
      .from('zernio_connected_accounts')
      .select('*, zernio_credentials(*)')
      .eq('id', connectedAccountId)
      .single()

    if (accountError || !account) {
      throw new Error('Connected account not found or access denied.')
    }

    // 2. Check if the currently assigned credential is healthy and enabled
    const assignedCred = account.zernio_credentials
    if (assignedCred && assignedCred.enabled && assignedCred.status === 'healthy') {
      return {
        id: assignedCred.id,
        name: assignedCred.name,
        api_key_decrypted: decrypt(assignedCred.api_key_encrypted),
        status: assignedCred.status,
        priority: assignedCred.priority,
      }
    }

    // 3. Failover: If no assigned credential or it's unhealthy, find the next best healthy credential
    const { data: availableCreds, error: credsError } = await supabase
      .from('zernio_credentials')
      .select('*')
      .eq('enabled', true)
      .eq('status', 'healthy')
      .order('priority', { ascending: true })

    if (credsError || !availableCreds || availableCreds.length === 0) {
      throw new Error('No healthy Zernio credentials available.')
    }

    const fallbackCred = availableCreds[0]

    // 4. Log the failover event (if there was a previous assigned credential)
    if (assignedCred && assignedCred.id !== fallbackCred.id) {
      await supabase.from('zernio_failover_events').insert({
        organization_id: this.orgId,
        connected_account_id: connectedAccountId,
        prev_credential_id: assignedCred.id,
        new_credential_id: fallbackCred.id,
        reason: `Previous credential status was ${assignedCred.status}`,
      })
      
      // Update account affinity to the new healthy credential
      await supabase
        .from('zernio_connected_accounts')
        .update({ assigned_credential_id: fallbackCred.id })
        .eq('id', connectedAccountId)
    }

    return {
      id: fallbackCred.id,
      name: fallbackCred.name,
      api_key_decrypted: decrypt(fallbackCred.api_key_encrypted),
      status: fallbackCred.status,
      priority: fallbackCred.priority,
    }
  }

  /**
   * Records the result of a Zernio API request, updating credential health if necessary.
   */
  async logRequestResult(
    credentialId: string,
    connectedAccountId: string,
    endpoint: string,
    method: string,
    statusCode: number,
    durationMs: number,
    success: boolean,
    errorCode?: string
  ) {
    const supabase = await createClient()
    
    // Log the request
    await supabase.from('zernio_request_logs').insert({
      credential_id: credentialId,
      organization_id: this.orgId,
      connected_account_id: connectedAccountId,
      endpoint,
      method,
      status_code: statusCode,
      duration: durationMs,
      success,
      error_code: errorCode
    })

    // Update credential health based on specific Zernio response codes
    if (!success) {
      let newStatus = null
      
      if (statusCode === 429) {
        newStatus = 'rate_limited'
      } else if (statusCode === 401) {
        newStatus = 'authentication_error'
      } else if (statusCode === 403) {
        newStatus = 'permission_error'
      }

      if (newStatus) {
        await supabase
          .from('zernio_credentials')
          .update({ status: newStatus })
          .eq('id', credentialId)
      }
    }
  }
}
