export default function ChatBubble({ message }: { message: any }) {
  const isUser = message.is_from_user;
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`p-3 rounded-2xl max-w-[80%] ${isUser ? 'bg-green-500 text-white' : 'bg-white text-black'}`}>
        {message.image_url && <img src={message.image_url} className="rounded-lg mb-2" />}
        <p className="text-sm">{message.content}</p>
      </div>
    </div>
  );
}
