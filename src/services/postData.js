export default async function getUserAsync(url) {
  let response = await fetch(url);
  let data = await response.json()
  return data;
}