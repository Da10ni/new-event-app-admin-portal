import type { FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setLoading, setCredentials, setError } from '../../store/slices/authSlice';
import { setTokens } from '../../services/api/axiosInstance';
import { authApi } from '../../services/api/authApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { MdEmail, MdLock } from 'react-icons/md';

const AdminLoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      dispatch(setError('Please enter your email and password'));
      return;
    }

    dispatch(setLoading(true));
    dispatch(setError(''));

    try {
      const response = await authApi.login({ email, password });
      const { user, accessToken, refreshToken } = response.data.data;

      if (user.role !== 'admin' && user.role !== 'super_admin') {
        dispatch(setError('Access denied. Admin privileges required.'));
        dispatch(setLoading(false));
        return;
      }

      setTokens(accessToken, refreshToken);
      dispatch(setCredentials({ user, token: accessToken }));
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      dispatch(
        setError(
          axiosError.response?.data?.message || 'Login failed. Please check your credentials.'
        )
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-neutral-600">Welcome Back</h2>
        <p className="text-sm text-neutral-400 mt-1">Sign in to your admin account</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-lg">
          <p className="text-sm text-error-500">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="admin@events.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<MdEmail className="w-4 h-4" />}
          required
          disabled={loading}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<MdLock className="w-4 h-4" />}
          required
          disabled={loading}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
        >
          Sign In to Admin Portal
        </Button>
      </form>

      <p className="text-center text-xs text-neutral-400 mt-6">
        This portal is restricted to authorized administrators only.
      </p>
    </div>
  );
};

export default AdminLoginPage;
