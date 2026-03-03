import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { EnhancedSignupForm } from "@/components/auth/EnhancedSignupForm";

const SignupPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4 bg-muted/20">
        <EnhancedSignupForm />
      </main>
      <Footer />
    </div>
  );
};

export default SignupPage;
