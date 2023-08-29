export default function Avatar({ url = null }) {
  return (
    <div className="rounded-full bg-blue-300 w-12 h-12 overflow-hidden">
      {!!url && <img src={url} alt="avatar" />}
    </div>
  );
}
