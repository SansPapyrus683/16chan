export default function PostView({ params }: { params: { tag: string } }) {
  return (
    <div>this page is supposed to show the info for the tag {params.tag}</div>
  );
}
