export default function AlbumView({ params }: { params: { aid: string } }) {
  return (
    <div>this page is supposed to show the info for album {params.aid}</div>
  );
}
