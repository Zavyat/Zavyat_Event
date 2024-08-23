import interact from "interactjs";

export function authenticateUser(email, password) {
  const users = [
    { email: "Ryan@zavyat.com", password: "Ryan" },
    { email: "Zain@zavyat.com", password: "Zain" },
    { email: "Juvana@zavyat.com", password: "Juvana" },
    { email: "Sharath@zavyat.com", password: "Sharath" },
  ];

  // Check if the user exists and the password matches
  return users.some(
    (user) => user.email === email && user.password === password
  );
}

export function handleDragStart(event, imgSrc) {
  event.dataTransfer.setData("text/plain", imgSrc);
}

export function handleDragOver(event) {
  event.preventDefault();
}

export function handleDrop(event) {
  event.preventDefault();

  // Ensure the drop action is only executed once
  const imgSrc = event.dataTransfer.getData("text/plain");
  if (!imgSrc) return; // Exit if no image source is found

  // Avoid multiple drops by clearing data
  event.dataTransfer.clearData();

  const container = document.getElementById("customContainer");

  // Check if the item is already dropped to prevent duplication
  if (
    Array.from(container.children).some(
      (child) => child.querySelector("img")?.src === imgSrc
    )
  ) {
    return;
  }

  const newItem = document.createElement("div");
  newItem.classList.add("customItem");

  const img = document.createElement("img");
  img.src = imgSrc;
  newItem.appendChild(img);

  const rect = container.getBoundingClientRect();
  const offsetX = event.clientX - rect.left - 25;
  const offsetY = event.clientY - rect.top - 25;

  const maxX = rect.width - 50;
  const maxY = rect.height - 50;
  const posX = Math.min(Math.max(0, offsetX), maxX);
  const posY = Math.min(Math.max(0, offsetY), maxY);

  newItem.style.left = `${posX}px`;
  newItem.style.top = `${posY}px`;

  const removeBtn = document.createElement("div");
  removeBtn.classList.add("customRemoveBtn");
  removeBtn.addEventListener("click", () => container.removeChild(newItem));
  newItem.appendChild(removeBtn);

  container.appendChild(newItem);

  interact(newItem)
    .draggable({
      listeners: {
        move(event) {
          const target = event.target;
          const x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
          const y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;
          target.style.transform = `translate(${x}px, ${y}px) rotate(${
            target.dataset.rotation || 0
          }deg)`;
          target.setAttribute("data-x", x);
          target.setAttribute("data-y", y);
        },
      },
    })
    .resizable({
      edges: { left: true, right: true, bottom: true, top: true },
    })
    .on("resizemove", function (event) {
      const target = event.target;
      const x = parseFloat(target.getAttribute("data-x")) || 0;
      const y = parseFloat(target.getAttribute("data-y")) || 0;

      target.style.width = `${event.rect.width}px`;
      target.style.height = `${event.rect.height}px`;
      target.style.transform = `translate(${x}px, ${y}px) rotate(${
        target.dataset.rotation || 0
      }deg)`;
    });

  let rotationAngle = 0;

  newItem.addEventListener("dblclick", () => {
    rotationAngle += 45;
    if (rotationAngle >= 360) rotationAngle = 0;
    newItem.style.transform = `rotate(${rotationAngle}deg)`;
    newItem.dataset.rotation = rotationAngle;
  });
}

export function initializeEventHandlers(setContainerClass) {
  const sidebarItems = document.querySelectorAll(".customSidebar-item");

  sidebarItems.forEach((item) => {
    item.addEventListener("click", function () {
      if (item.classList.contains("customOutdoor")) {
        setContainerClass("customOutdoor");
      } else if (item.classList.contains("customIndoor")) {
        setContainerClass("customIndoor");
      } else if (item.classList.contains("customClear")) {
        document.getElementById("customContainer").innerHTML = "";
        setContainerClass("");
      }
    });
  });

  const container = document.getElementById("customContainer");
  container.addEventListener("dragover", handleDragOver);
  // container.addEventListener("drop", handleDrop);
}
