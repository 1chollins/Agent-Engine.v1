import { LoginForm } from "@/components/auth/login-form";

type LoginPageProps = {
  searchParams: { message?: string };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  return <LoginForm message={searchParams.message} />;
}
