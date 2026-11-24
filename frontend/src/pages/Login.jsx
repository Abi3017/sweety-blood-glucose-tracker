import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthLayout from '../components/layout/AuthLayout';
import FormField from '../components/common/FormField';
import PasswordField from '../components/common/PasswordField';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import { loginSchema } from '../validations/authSchemas';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function Login() {
  useDocumentTitle('Log in');
  const { login, sessionMessage, clearSessionMessage } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '', rememberMe: false } });

  const onSubmit = async (values) => {
    setServerError('');
    clearSessionMessage();
    try {
      await login(values);
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (error) {
      setServerError(error.message);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to record and review your glucose readings."
      footer={
        <>
          New to Sweety?{' '}
          <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {sessionMessage && <Alert type="info">{sessionMessage}</Alert>}
        <Alert type="error">{serverError}</Alert>

        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <PasswordField
          label="Password"
          autoComplete="current-password"
          placeholder="Enter your password"
          error={errors.password?.message}
          {...register('password')}
        />

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-brand-600" {...register('rememberMe')} />
          Keep me signed in on this device
        </label>

        <Button type="submit" className="w-full" loading={isSubmitting}>
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </Button>
      </form>
    </AuthLayout>
  );
}
