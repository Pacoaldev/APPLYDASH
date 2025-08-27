import AdminLogoutButton from "../(auth)/logout/AdminLogoutButton";


export default function AdminDashboardPage(){
  return (
    <div className="flex items-center flex-col justify-center h-screen space-y-10">
      <h1 className="text-5xl ">Admin Dashboard</h1>
      <AdminLogoutButton />
    </div>
  );
}