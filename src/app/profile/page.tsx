import ProfileForm from "@/components/profile/form";
import ProtectedRoute from "@/components/auth/protected-route";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="container max-w-screen-md py-8 mx-auto">
        <div className="mb-8 md:px-0 px-4">
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and preferences.
          </p>
        </div>
        <ProfileForm />
      </div>
    </ProtectedRoute>
  );
}
