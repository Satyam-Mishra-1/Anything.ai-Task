import "../styles/forms.css";

export function MessageBar({
  type,
  message,
}: {
  type: "success" | "error";
  message: string;
}) {
  return (
    <div
      className={`message-bar ${type}`}
      role="alert"
    >
      {message}
    </div>
  );
}

