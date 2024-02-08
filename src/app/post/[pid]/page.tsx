export default function PostView({ params }: { params: { pid: string } }) {
  return <div>this page is supposed to show the info for {params.pid}</div>;
}
