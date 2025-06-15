
const GOOGLE_API_BASE_URL = 'https://www.googleapis.com/calendar/v3'

export interface GoogleApiRequestOptions extends RequestInit {
  headers?: Record<string, string>
}

export async function googleApiRequest(url: string, accessToken: string, options: GoogleApiRequestOptions = {}) {
  console.log('Google API Request:', {
    url,
    method: options.method || 'GET',
    hasToken: !!accessToken,
    tokenPrefix: accessToken?.substring(0, 20) + '...'
  })

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  console.log('Google API Response:', {
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries())
  })

  if (!response.ok) {
    const errorText = await response.text()
    let errorData
    try {
      errorData = JSON.parse(errorText)
    } catch {
      errorData = { message: errorText }
    }
    
    console.error('Google API Error Details:', {
      status: response.status,
      statusText: response.statusText,
      errorData,
      url
    })
    
    const errorMessage = errorData?.error?.message || 
                        errorData?.message || 
                        `Request failed with status ${response.status}: ${response.statusText}`
    throw new Error(errorMessage)
  }

  if (response.status === 204) {
    return null
  }

  const data = await response.json()
  console.log('Google API Success Response:', {
    requestUrl: url,
    itemsCount: data.items?.length,
    hasNextPageToken: !!data.nextPageToken
  })

  return data
}

export { GOOGLE_API_BASE_URL }
