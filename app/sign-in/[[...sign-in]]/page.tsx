import { SignIn } from "@clerk/nextjs";

export const metadata = { title: "Sign in — Chris Gramly" };

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24 bg-ink">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="eyebrow mb-3">§ Restricted</div>
          <h1 className="font-display font-extralight text-4xl tracking-[-0.04em] text-bone">
            Dashboard sign-in
          </h1>
        </div>
        <SignIn
          appearance={{
            variables: {
              colorPrimary: "#d4b46a",
              colorBackground: "#181108",
              colorText: "#ece3cc",
              colorInputBackground: "#0f0b06",
              colorInputText: "#ece3cc",
            },
          }}
        />
      </div>
    </div>
  );
}
