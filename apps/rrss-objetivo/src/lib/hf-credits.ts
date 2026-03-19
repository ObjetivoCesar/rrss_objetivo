export async function getHFCredits() {
  const token = process.env.HUGGINGFACE_ACCESS_TOKEN;
  if (!token) return null;

  try {
    const res = await fetch("https://huggingface.co/api/whoami-v2", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      name: data.name,
      fullname: data.fullname,
      plan: data.plan,
      canPay: data.canPay,
    };
  } catch {
    return null;
  }
}
