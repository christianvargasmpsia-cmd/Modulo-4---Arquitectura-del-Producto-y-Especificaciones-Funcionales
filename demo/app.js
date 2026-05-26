// ── DOM refs ─────────────────────────────────────────────────────────────────
const buyBtn             = document.getElementById("buyBtn");
const failBtn            = document.getElementById("failBtn");
const clearBtn           = document.getElementById("clearBtn");
const qrContainer        = document.getElementById("qrContainer");
const orderStatusEl      = document.getElementById("orderStatus");
const eventsEl           = document.getElementById("events");
const stockCountEl       = document.getElementById("stockCount");
const timerCountEl       = document.getElementById("timerCount");
const timerCircle        = document.getElementById("timerCircle");

const svcOrder       = document.getElementById("orderService");
const svcPayment     = document.getElementById("paymentService");
const svcBus         = document.getElementById("eventBus");
const svcInventory   = document.getElementById("inventoryService");
const svcNotif       = document.getElementById("notificationService");

const steps = [1,2,3,4,5].map(n => document.getElementById("step" + n));
const lines = [1,2,3,4].map(n => document.getElementById("line" + n));

// ── State ─────────────────────────────────────────────────────────────────────
let stock       = 10;
let running     = false;
let timerHandle = null;
const TIMER_SECS    = 15;
const CIRCUMFERENCE = 2 * Math.PI * 45; // ≈ 283

// ── Helpers ───────────────────────────────────────────────────────────────────
const wait = ms => new Promise(r => setTimeout(r, ms));

function log(text, type = "order") {
  const div  = document.createElement("div");
  div.className = `event ${type}`;
  const time = new Date().toLocaleTimeString("es-BO", { hour12: false });
  div.innerHTML = `<span class="event-time">${time}</span><span class="event-text">${text}</span>`;
  eventsEl.appendChild(div);
  eventsEl.scrollTop = eventsEl.scrollHeight;
}

function setStatus(text, cls) {
  orderStatusEl.textContent = text;
  orderStatusEl.className   = cls;
}

function activate(el)        { el.classList.add("active"); }
function deactivate(el)      { el.classList.remove("active", "error"); }
function activateErr(el)     { el.classList.remove("active"); el.classList.add("error"); }

function setStep(i, state) { // state: "active" | "done" | "failed"
  steps[i].classList.remove("active", "done", "failed");
  steps[i].classList.add(state);
}

function litLine(i, red = false) {
  lines[i].classList.remove("lit", "lit-red");
  lines[i].classList.add(red ? "lit-red" : "lit");
}

function resetAll() {
  steps.forEach(s => s.classList.remove("active", "done", "failed"));
  lines.forEach(l => l.classList.remove("lit", "lit-red"));
  [svcOrder, svcPayment, svcBus, svcInventory, svcNotif].forEach(deactivate);
  qrContainer.classList.add("hidden");
  stopTimer();
  timerCircle.classList.remove("urgent");
  timerCircle.style.strokeDashoffset = "0";
  timerCountEl.textContent = TIMER_SECS;
  setStatus("⏳ PENDIENTE", "status-pending");
}

// QR countdown timer
function startTimer() {
  let remaining = TIMER_SECS;
  timerCountEl.textContent = remaining;
  timerCircle.style.strokeDashoffset = "0";

  timerHandle = setInterval(() => {
    remaining--;
    timerCountEl.textContent = remaining;
    const offset = CIRCUMFERENCE * (1 - remaining / TIMER_SECS);
    timerCircle.style.strokeDashoffset = String(offset);
    if (remaining <= 5) timerCircle.classList.add("urgent");
    if (remaining <= 0) stopTimer();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerHandle);
  timerHandle = null;
}

function lock()   { buyBtn.disabled = true; failBtn.disabled = true; running = true; }
function unlock() { buyBtn.disabled = false; failBtn.disabled = false; running = false; }

// ── Happy Path ────────────────────────────────────────────────────────────────
buyBtn.addEventListener("click", async () => {
  if (running) return;
  eventsEl.innerHTML = "";
  resetAll();
  lock();

  // Step 1 — Order Created
  setStep(0, "active");
  setStatus("⏳ CREANDO PEDIDO...", "status-waiting");
  activate(svcOrder);
  log("📦 <b>ORDER_CREATED</b> &nbsp;·&nbsp; pedido-001 &nbsp;·&nbsp; Bs. 25.00 &nbsp;·&nbsp; correlationId: ORD-001", "order");
  await wait(1400);
  deactivate(svcOrder);
  setStep(0, "done");
  litLine(0);

  // Step 2 — Payment / QR
  setStep(1, "active");
  qrContainer.classList.remove("hidden");
  activate(svcPayment);
  setStatus("🔳 ESPERANDO PAGO QR", "status-waiting");
  log("💳 <b>QR_GENERATED</b> &nbsp;·&nbsp; TTL=300 s (demo: 15 s) &nbsp;·&nbsp; ref=QR-001", "payment");
  startTimer();
  await wait(1000);

  activate(svcBus);
  log("📨 <b>PAYMENT_PENDING</b> → RabbitMQ &nbsp;·&nbsp; exchange=payments", "bus");
  await wait(900);
  deactivate(svcBus);

  await wait(1400);
  stopTimer();
  log("🏦 <b>BANK_WEBHOOK_RECEIVED</b> &nbsp;·&nbsp; HMAC-SHA256 ✓ &nbsp;·&nbsp; monto exacto ✓ &nbsp;·&nbsp; idempotency-key: WH-001", "payment");
  deactivate(svcPayment);
  setStep(1, "done");
  litLine(1);

  // Step 3 — Payment Confirmed via Event Bus
  setStep(2, "active");
  activate(svcBus);
  log("📨 <b>PAYMENT_CONFIRMED</b> → RabbitMQ &nbsp;·&nbsp; fanout → inventory, order", "bus");
  await wait(1100);
  deactivate(svcBus);
  setStep(2, "done");
  litLine(2);

  // Step 4 — Stock Reserved
  setStep(3, "active");
  activate(svcInventory);
  log(`🏪 <b>STOCK_RESERVED</b> &nbsp;·&nbsp; UPDATE atómico &nbsp;·&nbsp; stock: ${stock} → ${stock - 1} &nbsp;·&nbsp; Redis lock ✓`, "inventory");
  await wait(1300);
  stock--;
  stockCountEl.textContent = stock;
  activate(svcBus);
  log("📨 <b>STOCK_RESERVED</b> → RabbitMQ &nbsp;·&nbsp; → order-service", "bus");
  await wait(900);
  deactivate(svcBus);
  deactivate(svcInventory);
  setStep(3, "done");
  litLine(3);

  // Step 5 — Order Confirmed + Notification
  setStep(4, "active");
  activate(svcOrder);
  setStatus("✅ PEDIDO CONFIRMADO", "status-confirmed");
  log("📦 <b>ORDER_CONFIRMED</b> &nbsp;·&nbsp; pedido-001 &nbsp;·&nbsp; estado: CONFIRMADO", "order");
  await wait(1200);
  deactivate(svcOrder);

  activate(svcNotif);
  log("🔔 <b>PUSH_NOTIFICATION_SENT</b> &nbsp;·&nbsp; FCM &nbsp;·&nbsp; «Tu pedido fue confirmado 🎉»", "notification");
  await wait(1100);
  deactivate(svcNotif);
  setStep(4, "done");

  log("🎉 <b>SAGA COMPLETADA EXITOSAMENTE</b> &nbsp;·&nbsp; 5/5 pasos OK", "success");
  unlock();
});

// ── Failure Path (Saga Compensation) ─────────────────────────────────────────
failBtn.addEventListener("click", async () => {
  if (running) return;
  eventsEl.innerHTML = "";
  resetAll();
  lock();

  // Mark inv-amount as violated for the demo
  const invAmount = document.getElementById("inv-amount");
  invAmount.classList.add("violated");

  // Step 1 — Order Created
  setStep(0, "active");
  setStatus("⏳ CREANDO PEDIDO...", "status-waiting");
  activate(svcOrder);
  log("📦 <b>ORDER_CREATED</b> &nbsp;·&nbsp; pedido-002 &nbsp;·&nbsp; Bs. 25.00 &nbsp;·&nbsp; correlationId: ORD-002", "order");
  await wait(1400);
  deactivate(svcOrder);
  setStep(0, "done");
  litLine(0);

  // Step 2 — QR + Webhook with WRONG amount
  setStep(1, "active");
  qrContainer.classList.remove("hidden");
  activate(svcPayment);
  setStatus("🔳 ESPERANDO PAGO QR", "status-waiting");
  log("💳 <b>QR_GENERATED</b> &nbsp;·&nbsp; TTL=300 s (demo: 15 s) &nbsp;·&nbsp; ref=QR-002", "payment");
  startTimer();
  await wait(1000);
  activate(svcBus);
  log("📨 <b>PAYMENT_PENDING</b> → RabbitMQ", "bus");
  await wait(900);
  deactivate(svcBus);
  await wait(1400);
  stopTimer();
  log("🏦 <b>BANK_WEBHOOK_RECEIVED</b> &nbsp;·&nbsp; HMAC-SHA256 ✓ &nbsp;·&nbsp; ⚠️ monto recibido: Bs. 20.00 ≠ Bs. 25.00", "error");
  activateErr(svcPayment);
  await wait(800);
  deactivate(svcPayment);
  setStep(1, "failed");
  litLine(1, true);

  // Compensation
  log("❌ <b>PAYMENT_FAILED</b> &nbsp;·&nbsp; motivo: monto incorrecto &nbsp;·&nbsp; correlationId: ORD-002", "error");
  setStep(2, "active");
  activate(svcBus);
  log("📨 <b>PAYMENT_FAILED</b> → RabbitMQ &nbsp;·&nbsp; → order-service, inventory-service", "bus");
  await wait(1000);
  deactivate(svcBus);

  // Compensating: cancel order
  activateErr(svcOrder);
  setStatus("❌ PAGO RECHAZADO", "status-failed");
  log("⏪ <b>[COMPENSACIÓN]</b> ORDER_CANCELLED &nbsp;·&nbsp; pedido-002 &nbsp;·&nbsp; stock NO descontado", "compensating");
  await wait(1000);
  deactivate(svcOrder);
  setStep(2, "failed");
  litLine(2, true);

  // Compensating: release stock (precautionary)
  activateErr(svcInventory);
  log("⏪ <b>[COMPENSACIÓN]</b> STOCK_RELEASED &nbsp;·&nbsp; reserva cancelada &nbsp;·&nbsp; stock: " + stock + " (sin cambio)", "compensating");
  await wait(1000);
  deactivate(svcInventory);

  // Notification of rejection
  activate(svcNotif);
  log("🔔 <b>PUSH_NOTIFICATION_SENT</b> &nbsp;·&nbsp; «Tu pago fue rechazado. Intenta nuevamente.»", "notification");
  await wait(1000);
  deactivate(svcNotif);

  log("🔁 <b>SAGA COMPENSADA</b> &nbsp;·&nbsp; Invariante: monto exacto violado &nbsp;·&nbsp; sistema consistente", "error");

  // Restore invariant display after a moment
  await wait(2000);
  invAmount.classList.remove("violated");

  unlock();
});

// ── Clear log ─────────────────────────────────────────────────────────────────
clearBtn.addEventListener("click", () => { eventsEl.innerHTML = ""; });
