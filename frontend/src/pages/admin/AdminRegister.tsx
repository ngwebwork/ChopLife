import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { UtensilsCrossed, UserPlus } from "lucide-react";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { getErrorMessage } from "@/services/api";
import { toast } from "@/store/toastStore";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

export function AdminRegister() {
  useDocumentTitle("Create Admin Account");
  const { isAuthenticated, login } = useAuthStore();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>();

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const onSubmit = async (data: RegisterForm) => {
    setSubmitting(true);
    try {
      const { token, user } = await authService.register(data.name, data.email, data.password);
      login(token, user);
      toast.success("Admin account created");
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
          <h1 className="mt-4 font-display text-xl font-extrabold text-ink-900">Create Admin Account</h1>
          <p className="mt-1 text-center text-sm text-ink-400">
            For initial restaurant setup only
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <Input
            label="Full Name"
            {...register("name", { required: "Name is required" })}
            error={errors.name?.message}
          />
          <Input
            label="Email"
            type="email"
            {...register("email", { required: "Email is required" })}
            error={errors.email?.message}
          />
          <Input
            label="Password"
            type="password"
            {...register("password", {
              required: "Password is required",
              minLength: { value: 6, message: "Password must be at least 6 characters" },
            })}
            error={errors.password?.message}
          />
          <Button type="submit" fullWidth size="lg" loading={submitting} icon={<UserPlus size={18} />}>
            Create Account
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-400">
          Already have an account?{" "}
          <Link to="/admin/login" className="font-semibold text-brand-700 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
