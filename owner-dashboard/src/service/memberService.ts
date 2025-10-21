import api from '../router/api'
import type {
  Member,
  CreateMemberData,
  UpdateMemberData,
  MemberResponse,
  MembersByPlan,
} from '../types/member'

export const memberService = {
  // Get all members
  async getMembers(): Promise<Member[]> {
    try {
      const response = await api.get('/api/dashboard/members')
      return response.data
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error('Failed to fetch members')
    }
  },

  // Get member by ID
  async getMemberById(id: string): Promise<Member> {
    try {
      const response = await api.get(`/api/members/${id}`)
      return response.data
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error('Failed to fetch member')
    }
  },

  // Create new member/subscriber
  async createMember(data: CreateMemberData): Promise<MemberResponse> {
    try {
      const response = await api.post('/api/members', data)
      return response.data
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error('Failed to create member')
    }
  },

  // Update member
  async updateMember(id: string, data: UpdateMemberData): Promise<MemberResponse> {
    try {
      const response = await api.put(`/api/members/${id}`, data)
      return response.data
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error('Failed to update member')
    }
  },

  // Delete member
  async deleteMember(id: string): Promise<{ message: string }> {
    try {
      const response = await api.delete(`/api/members/${id}`)
      return response.data
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error('Failed to delete member')
    }
  },

  // Get members by plan
  async getMembersByPlan(): Promise<MembersByPlan[]> {
    try {
      const response = await api.get('/api/dashboard/members-by-plan')
      return response.data
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error('Failed to fetch members by plan')
    }
  },
}
