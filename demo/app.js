const buyBtn = document.getElementById("buyBtn");
const qrContainer = document.getElementById("qrContainer");
const orderStatus = document.getElementById("orderStatus");
const events = document.getElementById("events");

const orderService = document.getElementById("orderService");
const paymentService = document.getElementById("paymentService");
const eventBus = document.getElementById("eventBus");
const inventoryService = document.getElementById("inventoryService");
const notificationService = document.getElementById("notificationService");

function wait(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}

function addEvent(text){
  const div = document.createElement("div");
  div.className = "event";

  const time = new Date().toLocaleTimeString();

  div.innerHTML = `[${time}] ${text}`;

  events.appendChild(div);

  events.scrollTop = events.scrollHeight;
}

function activate(service){
  service.classList.add("active");
}

function deactivate(service){
  service.classList.remove("active");
}

buyBtn.addEventListener("click", async ()=>{

  events.innerHTML = "";

  orderStatus.innerHTML = "CREANDO PEDIDO";

  activate(orderService);

  addEvent("📦 ORDER_CREATED");

  await wait(1500);

  deactivate(orderService);

  qrContainer.classList.remove("hidden");

  activate(paymentService);

  orderStatus.innerHTML = "ESPERANDO PAGO";

  addEvent("💳 QR_PAYMENT_GENERATED");

  await wait(2500);

  addEvent("🏦 BANK_WEBHOOK_RECEIVED");

  await wait(1500);

  deactivate(paymentService);

  activate(eventBus);

  addEvent("📨 EVENT: PAYMENT_CONFIRMED");

  await wait(1500);

  deactivate(eventBus);

  activate(inventoryService);

  addEvent("🏪 STOCK_RESERVED");

  await wait(1500);

  deactivate(inventoryService);

  activate(orderService);

  addEvent("📦 ORDER_CONFIRMED");

  orderStatus.innerHTML = "PEDIDO CONFIRMADO";

  await wait(1500);

  deactivate(orderService);

  activate(notificationService);

  addEvent("🔔 PUSH_NOTIFICATION_SENT");

  await wait(1500);

  deactivate(notificationService);

  addEvent("🎉 SAGA COMPLETADA EXITOSAMENTE");

});