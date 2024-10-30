const baseURL = import.meta.env.VITE_BASE_URL;

export async function fetchAPI({ path, method = "GET", body = {} }) {
  let options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  };
  if (Object.keys(body).length > 0)
    Object.assign(options, { body: JSON.stringify(body) });
  const res = await fetch(`${baseURL}/${path}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
}
