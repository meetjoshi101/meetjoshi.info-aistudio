// Mock Supabase client for testing
export const mockSupabaseClient = {
  auth: {
    signInWithPassword: jest.fn(),
    getUser: jest.fn(),
    admin: {
      signOut: jest.fn()
    }
  }
};

export const mockSupabaseAdmin = {
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn()
  })),
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(),
      remove: jest.fn(),
      getPublicUrl: jest.fn()
    }))
  }
};

// Mock modules
jest.mock('../config/supabase.js', () => ({
  supabaseClient: mockSupabaseClient,
  supabaseAdmin: mockSupabaseAdmin
}));
