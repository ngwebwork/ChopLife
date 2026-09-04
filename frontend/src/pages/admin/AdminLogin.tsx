import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { UtensilsCrossed, LogIn } from "lucide-react";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { getErrorMessage } from "@/services/api";
import { toast } from "@/store/toastStore";

interface LoginForm {
  email: string;
  password: string;
}

export function AdminLogin() {
  const { isAuthenticated, login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  if (isAuthenticated) {
    const from = (location.state as { from?: Location })?.from?.pathname || "/admin";
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (data: LoginForm) => {
    setSubmitting(true);
    try {
      const { token, user } = await authService.login(data.email, data.password);
      login(token, user);
      toast.success(`Welcome back, ${user.name || user.email}`);
      navigate("/admin");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-900 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white">
            <UtensilsCrossed size={22} />
          </span>
          <h1 className="mt-4 font-display text-xl font-extrabold text-ink-900">ChopLife Admin</h1>
          <p className="mt-1 text-sm text-ink-400">Sign in to manage your restaurant</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="admin@choplife.com"
            {...register("email", { required: "Email is required" })}
            error={errors.email?.message}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            {...register("password", { required: "Password is required" })}
            error={errors.password?.message}
          />
          <Button type="submit" fullWidth size="lg" loading={submitting} icon={<LogIn size={18} />}>
            Sign In
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-400">
          Setting up for the first time?{" "}
          <Link to="/admin/register" className="font-semibold text-brand-700 hover:underline">
            Create admin account
          </Link>
        </p>
      </div>
    </div>
  );
}
