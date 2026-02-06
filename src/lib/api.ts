const API_URL = process.env.API_URL || "http://localhost:3000";

export async function fetchAPI<T>(
  path: string,
  token: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${body}`);
  }

  return res.json();
}

// Churches
export const getChurches = (token: string) =>
  fetchAPI<any[]>("/api/admin/churches", token);

export const getChurch = (token: string, id: string) =>
  fetchAPI<any>(`/api/admin/churches/${id}`, token);

export const updateChurch = (token: string, id: string, data: any) =>
  fetchAPI(`/api/admin/churches/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(data),
  });

// Home Content
export const getHomeContent = (token: string, churchId: string) =>
  fetchAPI<any>(`/api/admin/churches/${churchId}/home`, token);

export const upsertHomeContent = (token: string, churchId: string, data: any) =>
  fetchAPI(`/api/admin/churches/${churchId}/home`, token, {
    method: "PUT",
    body: JSON.stringify(data),
  });

// Events
export const getEvents = (token: string, churchId: string) =>
  fetchAPI<any[]>(`/api/admin/churches/${churchId}/events`, token);

export const createEvent = (token: string, churchId: string, data: any) =>
  fetchAPI(`/api/admin/churches/${churchId}/events`, token, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateEvent = (token: string, churchId: string, id: string, data: any) =>
  fetchAPI(`/api/admin/churches/${churchId}/events/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteEvent = (token: string, churchId: string, id: string) =>
  fetchAPI(`/api/admin/churches/${churchId}/events/${id}`, token, {
    method: "DELETE",
  });

// Sermons
export const getSermons = (token: string, churchId: string) =>
  fetchAPI<any[]>(`/api/admin/churches/${churchId}/sermons`, token);

export const createSermon = (token: string, churchId: string, data: any) =>
  fetchAPI(`/api/admin/churches/${churchId}/sermons`, token, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateSermon = (token: string, churchId: string, id: string, data: any) =>
  fetchAPI(`/api/admin/churches/${churchId}/sermons/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteSermon = (token: string, churchId: string, id: string) =>
  fetchAPI(`/api/admin/churches/${churchId}/sermons/${id}`, token, {
    method: "DELETE",
  });

// Prayers
export const getPrayers = (token: string, churchId: string) =>
  fetchAPI<any[]>(`/api/admin/churches/${churchId}/prayers`, token);

export const deletePrayer = (token: string, churchId: string, id: string) =>
  fetchAPI(`/api/admin/churches/${churchId}/prayers/${id}`, token, {
    method: "DELETE",
  });

// Notices
export const getNotices = (token: string, churchId: string) =>
  fetchAPI<any[]>(`/api/admin/churches/${churchId}/notices`, token);

export const createNotice = (token: string, churchId: string, data: any) =>
  fetchAPI(`/api/admin/churches/${churchId}/notices`, token, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateNotice = (token: string, churchId: string, id: string, data: any) =>
  fetchAPI(`/api/admin/churches/${churchId}/notices/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteNotice = (token: string, churchId: string, id: string) =>
  fetchAPI(`/api/admin/churches/${churchId}/notices/${id}`, token, {
    method: "DELETE",
  });
