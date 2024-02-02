import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { AuthForm } from "@/components/AuthForm";

export default async function Index() {
  const cookieStore = cookies();

  const canInitSupabaseClient = () => {
    // This function is just for the interactive tutorial.
    // Feel free to remove it once you have Supabase connected.
    try {
      createClient(cookieStore);
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <div className="row">
        <div className="col-6">
          <h1 className="header">Supabase Auth + Storage</h1>
          <p>
            Experience our Auth and Storage through a simple profile management
            example. Create a user profile and upload an avatar image. Fast,
            simple, secure.
          </p>
        </div>
        <div className="col-6 auth-widget">
          <AuthForm />
        </div>
      </div>
    </div>
  );
}
