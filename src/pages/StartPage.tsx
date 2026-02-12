import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { UserInputForm } from "@/components/form/UserInputForm";

const StartPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 px-4 gradient-subtle">
        <div className="container">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Let's Find Your Perfect Business
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Answer a few questions and our AI will recommend the best business 
              opportunities tailored to your situation.
            </p>
          </div>
          <UserInputForm />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StartPage;
