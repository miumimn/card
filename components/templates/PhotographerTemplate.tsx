import { SocialIcons } from "./SocialIcons";

export default function PhotographerTemplate({ user }) {
  return (
    <div className="relative w-full max-w-sm rounded-2xl overflow-hidden bg-black text-white shadow-lg">
      <img
        src={user.profile_image || "/placeholder-photo.jpg"}
        alt="Profile"
        className="w-full h-48 object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent" />
      <div className="absolute bottom-0 p-4 w-full text-center">
        <h2 className="text-lg font-semibold">{user.name || "Your Name"}</h2>
        <p className="text-sm text-gray-300">{user.title || "Photographer"}</p>
        <SocialIcons socials={user.socials} />
      </div>
    </div>
  );
}
