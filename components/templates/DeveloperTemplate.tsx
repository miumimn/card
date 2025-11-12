import { SocialIcons } from "./SocialIcons";

export default function DeveloperTemplate({ user }) {
  return (
    <div className="max-w-sm w-full bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-xl shadow-lg p-6 text-center">
      <img
        src={user.profile_image || "/placeholder-dev.jpg"}
        alt="Profile"
        className="w-24 h-24 rounded-full mx-auto border-2 border-indigo-500"
      />
      <h2 className="text-xl font-semibold mt-3">{user.name || "Your Name"}</h2>
      <p className="text-sm text-gray-400">{user.title || "Fullstack Developer"}</p>
      <p className="mt-3 text-gray-300 text-sm">{user.bio || "Building cool things for the web."}</p>
      <SocialIcons socials={user.socials} />
    </div>
  );
}
