import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../services/auth.service';
import { getCookie, decodeToken, isUserHR } from '../utils/auth';

const getUserFromLoginResponse = (data) => {
  return data?.user || data?.userDetails || data?.employee || null;
};

const getUserIdFromLoginResponse = (data) => {
  return getUserFromLoginResponse(data)?._id || data?.userId || data?._id || null;
};

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const data = await authService.login(email, password);
      let user = getUserFromLoginResponse(data);
      let userId = getUserIdFromLoginResponse(data);
      
      if (!userId) {
        const token = getCookie('AccessToken');
        const decoded = decodeToken(token);
        userId = decoded?.userId;
      }

      if (!userId) {
        throw new Error('Invalid login response');
      }

      if (!user) {
        const profileRes = await authService.getProfile(userId);
        user = profileRes.user;
        console.log(user);
      }
      
      localStorage.setItem('bb_user', JSON.stringify(user));
      
      return { user };
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { getState }) => {
    try {
      const state = getState();
      const userId = state.auth.user?._id;
      if (userId) {
        await authService.logout(userId);
      }
    } catch (error) {
      console.warn('Logout API failed:', error);
    } finally {
      localStorage.removeItem('bb_user');
      document.cookie = 'AccessToken=; Max-Age=0; path=/;';
      document.cookie = 'RefreshToken=; Max-Age=0; path=/;';
    }
  }
);

export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      const token = getCookie('AccessToken');
      if (!token) {
        throw new Error('No access token');
      }
      const decoded = decodeToken(token);
      if (!decoded || !decoded.userId) {
        throw new Error('Invalid token');
      }
      
      const profileRes = await authService.getProfile(decoded.userId);
      const user = profileRes.user;
      
      localStorage.setItem('bb_user', JSON.stringify(user));
      
      return { user };
    } catch (error) {
      localStorage.removeItem('bb_user');
      return rejectWithValue(error.message || 'Session expired');
    }
  }
);

const getInitialUser = () => {
  try {
    const user = localStorage.getItem('bb_user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: getInitialUser(),
    isAuthenticated: !!getInitialUser(),
    loading: false,
    error: null,
    isInitialized: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      // Check Auth
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isInitialized = true;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
      });
  },
});

export const { clearError } = authSlice.actions;
export const selectIsHR = (state) => isUserHR(state.auth.user);
export default authSlice.reducer;
