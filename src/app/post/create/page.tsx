import { CreatePost } from "@/components/MakePost";

export default function PostCreation() {
  return (
    <div className="mx-[30%] min-w-[50%] space-y-4">
      <h1>Create a Post</h1>
      <CreatePost />
    </div>
  );
}
