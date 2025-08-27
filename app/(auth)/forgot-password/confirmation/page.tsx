
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Mail } from "lucide-react";
import Link from 'next/link';
export default function RegistrationConfirmation(
  // { searchParams }: { searchParams: { email?: string } }
) {
  // const email = searchParams.email;
  
  return (
    <main className="flex justify-center items-center min-h-screen px-4">
      <Card className="w-full max-w-md rounded-xl shadow-sm border border-gray-200 text-center">
        <CardHeader className="flex flex-col items-center mt-6 space-y-4">

          <div className="w-20 h-20 rounded-full overflow-hidden">
            <Avatar className="h-20 w-20 rounded-lg">
              <AvatarImage
                src="https://github.com/Fralopala2/mi-portfolio/blob/main/images/Applydash-logo.png?raw=true"
                alt="User"
                className="rounded-lg"
              />
              <AvatarFallback className="rounded-lg">PL</AvatarFallback>
            </Avatar>
          </div>

          <h1 className="text-xl font-semibold text-black">
            Check Your Email
          </h1>
        </CardHeader>

        <CardContent className="px-6 pb-8">
          <div className="flex justify-center mb-4">
            <Mail className="h-10 w-10 text-gray-600" />
          </div>
          <p className="text-gray-700 text-sm mb-4">
            We&apos;ve sent a password reset link to your email address {" "}. Please check
            your inbox and click the link to reset your password.
          </p>
          <Link href={`https://mail.google.com/mail/`} target="_blank" rel="noopener noreferrer">
          <button className="w-full bg-black text-white py-2 px-4 rounded-md text-sm font-medium transition hover:opacity-90 mb-6">
            Confirm your email
          </button>
          </Link>
          <p className="text-xs text-gray-500">
             If you don&apos;t see the email, please check your spam folder.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}