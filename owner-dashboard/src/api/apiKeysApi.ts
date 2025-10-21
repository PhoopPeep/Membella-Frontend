import axios from 'axios'
import type {
  GatewayCreateApiKeyRequest,
  GatewayCreateApiKeyResponse,
  GatewayListFeaturesResponse,
  GatewayUsageStatsResponse,
} from '@/types/gateway'

// Features API Gateway URL
const FEATURES_API_GATEWAY_URL =
  import.meta.env.VITE_FEATURES_API_GATEWAY_URL ||
  'https://kvts7dvmtb.execute-api.ap-southeast-1.amazonaws.com/dev'

/**
 * Create API Key via Features API Gateway
 */
export async function createApiKeyViaGateway(
  data: GatewayCreateApiKeyRequest,
): Promise<GatewayCreateApiKeyResponse> {
  try {
    const response = await axios.post<GatewayCreateApiKeyResponse>(
      `${FEATURES_API_GATEWAY_URL}/admin/api-keys`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
    return response.data
  } catch (error: unknown) {
    const err = error as { response?: { data?: { error?: { message?: string } } } }
    throw new Error(err.response?.data?.error?.message || 'Failed to create API key')
  }
}

/**
 * List features using API key
 */
export async function listFeaturesViaGateway(
  apiKey: string,
): Promise<GatewayListFeaturesResponse> {
  try {
    const response = await axios.get<GatewayListFeaturesResponse>(
      `${FEATURES_API_GATEWAY_URL}/features`,
      {
        headers: {
          'x-api-key': apiKey,
        },
      },
    )
    return response.data
  } catch (error: unknown) {
    const err = error as { response?: { data?: { error?: { message?: string } } } }
    throw new Error(err.response?.data?.error?.message || 'Failed to list features')
  }
}

/**
 * Get usage statistics using API key
 */
export async function getUsageStatsViaGateway(
  apiKey: string,
  detailed: boolean = true,
): Promise<GatewayUsageStatsResponse> {
  try {
    const response = await axios.get<GatewayUsageStatsResponse>(
      `${FEATURES_API_GATEWAY_URL}/features/stats`,
      {
        headers: {
          'x-api-key': apiKey,
        },
        params: {
          detailed: detailed.toString(),
        },
      },
    )
    return response.data
  } catch (error: unknown) {
    const err = error as { response?: { data?: { error?: { message?: string } } } }
    throw new Error(err.response?.data?.error?.message || 'Failed to get usage statistics')
  }
}

/**
 * Test API key connectivity
 */
export async function testApiKeyConnection(apiKey: string): Promise<boolean> {
  try {
    await listFeaturesViaGateway(apiKey)
    return true
  } catch (error: unknown) {
    console.error('API key test failed:', error)
    return false
  }
}

/**
 * Health check
 */
export async function healthCheck(): Promise<{ status: string; timestamp: string }> {
  try {
    const response = await axios.get<{
      success: boolean
      data: { status: string; timestamp: string }
      timestamp: string
    }>(`${FEATURES_API_GATEWAY_URL}/health`)

    // Extract status from nested data object
    return {
      status: response.data.data.status,
      timestamp: response.data.data.timestamp,
    }
  } catch (error: unknown) {
    console.error('Health check failed:', error)
    throw new Error('API Gateway is not available')
  }
}


