import avatar from "@/assets/avatar.jpg";
import wordmark from "@/assets/wordmark.png";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <img src={avatar} alt="" className="size-10 rounded-full object-cover" />
      <img src={wordmark} alt="Kuji" className="h-6 w-auto" />
    </div>
  );
}
