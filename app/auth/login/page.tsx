import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <div className="bg-gradient-to-b from-white via-slate-50 to-slate-100 py-16 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6">
        <LoginForm />
      </div>
    </div>
  );
}
