const grid = document.getElementById("artwork-grid");
const count = document.getElementById("artwork-count");
const empty = document.getElementById("empty-state");

function makeCard(artwork) {
  const card = document.createElement("article");
  const link = document.createElement("a");
  link.href = "./works/" + encodeURIComponent(artwork.id) + "/";
  link.setAttribute("aria-label", "观看《" + artwork.title + "》");
  const imageWrap = document.createElement("span");
  imageWrap.className = "artwork-cover";
  const image = document.createElement("img");
  image.src = "./works/" + encodeURIComponent(artwork.id) + "/" + artwork.cover.split("/").map(encodeURIComponent).join("/");
  image.alt = artwork.title;
  image.loading = "lazy";
  image.decoding = "async";
  imageWrap.append(image);
  const info = document.createElement("div");
  info.className = "artwork-info";
  const title = document.createElement("h2");
  title.textContent = artwork.title;
  const date = document.createElement("time");
  date.dateTime = artwork.date;
  date.textContent = artwork.date.slice(0, 7).replace("-", ".");
  info.append(title, date);
  const description = document.createElement("p");
  description.className = "artwork-description";
  description.textContent = artwork.description;
  link.append(imageWrap, info, description);
  card.append(link);
  return card;
}

try {
  const response = await fetch("./works.json");
  if (!response.ok) throw new Error("Catalog HTTP " + response.status);
  const catalog = await response.json();
  if (catalog.schemaVersion !== 1 || !Array.isArray(catalog.artworks)) throw new Error("Invalid catalog");
  const published = catalog.artworks.filter(artwork => artwork.status === "published");
  for (const artwork of published) {
    if (!/^\d{3,}-[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(artwork.id)
      || typeof artwork.cover !== "string" || /(^\/|\\|:|(^|\/)\.\.?($|\/))/.test(artwork.cover)) {
      throw new Error("Invalid artwork path");
    }
  }
  grid.replaceChildren(...published.map(makeCard));
  count.textContent = published.length + " 件";
  empty.hidden = published.length !== 0;
} catch (error) {
  document.getElementById("catalog-error").hidden = false;
  console.error("The artwork catalog could not be loaded.", error);
} finally {
  grid.setAttribute("aria-busy", "false");
}
