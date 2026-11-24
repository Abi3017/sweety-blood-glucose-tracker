import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import FormField from '../components/common/FormField';
import PasswordField from '../components/common/PasswordField';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import { PASSWORD_RULES, registerSchema } from '../validations/authSchemas';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { applyServerErrors } from '../utils/forms';

function PasswordChecklist({ value }) {
  return (
    <ul className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2" aria-label="Password requirements">
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(value || '');
        return (
          <li key={rule.label} className={`flex items-center gap-1.5 ${met ? 'text-mint-700' : 'text-slate-500'}`}>
            <Check className={`h-3.5 w-3.5 ${met ? 'opacity-100' : 'opacity-30'}`} aria-hidden />
            {rule.label}
            <span className="sr-only">{met ? '(met)' : '(not met)'}</span>
          </li>
        );
      })}
    </ul>
  );
}

export default function Register() {
  useDocumentTitle('Create account');
  const { register: registerUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (values) => {
    setServerError('');
    try {
      await registerUser(values);
      toast.success('Welcome to Sweety! Your account is ready.');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      if (!applyServerErrors(error, setError, ['name', 'email', 'password', 'confirmPassword'])) {
        setServerError(error.message);
      }
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start tracking your daily blood glucose readings."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <Alert type="error">{serverError}</Alert>

        <FormField label="Full name" autoComplete="name" placeholder="Asha Kumar" error={errors.name?.message} {...register('name')} />
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
          autoComplete="new-password"
          placeholder="Create a strong password"
          error={errors.password?.message}
          hint={<PasswordChecklist value={watch('password')} />}
          {...register('password')}
        />
        <PasswordField
          label="Confirm password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" className="w-full" loading={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  );
}
