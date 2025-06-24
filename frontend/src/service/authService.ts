export const registerUser = async (userData: { org_name: string, email: string, password: string }) => {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed')
    }

    return data
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Network error occurred')
  }
}

export const login = async (userData: { email: string, password: string }) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Login failed')
    }

    return data
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Network error occurred')
  }
}