import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
  return (
    <div className="bg-gradient-to-b from-white to-slate-100 py-16">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6">
        <RegisterForm />
      </div>
    </div>
  );
}
