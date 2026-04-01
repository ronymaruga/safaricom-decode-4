var decodeStarter = StudioWidgetWrapper.extend({
  init: function (...args) {
    const thisObj = this;
    thisObj._super.apply(thisObj, args);
    if ($.isFunction(thisObj.getWidgetI18n)) {
      thisObj.getWidgetI18n().then(function () {
        thisObj.render();
      });
    } else {
      thisObj.render();
    }
  },

  render: function () {
    const thisObj = this;
    const elem = thisObj.getContainer();

    const i18n = HttpUtils.getI18n(
      { locale: HttpUtils.getLocale(), messages: thisObj.getMessages() },
      Vue.createApp(),
    );

    if (!elem) return;

    let containerDiv = $(".scfClientRenderedContainer", elem);
    if (containerDiv.length) {
      $(containerDiv).empty();
    } else {
      containerDiv = document.createElement("div");
      containerDiv.className = "scfClientRenderedContainer";
      $(elem).append(containerDiv);
    }

    // ╔══════════════════════════════════════════════════════════════════════╗
    // ║  CONFIG — Edit this block to customise your miniprogram             ║
    // ║  This is the ONLY section you need to change for your business case ║
    // ╚══════════════════════════════════════════════════════════════════════╝
    const CONFIG = {
      // ── Business details ────────────────────────────────────────────────
      // TODO: Change this to your business name
      businessName: "Biashara Board",

      // ── Provider details ─────────────────────────────────────────────────
      // TODO: Change these to your service provider details
      providerName: "Kamau Wanjiku",
      providerRole: "Fundi",
      rating: "4.9",
      avatarInitials: "KW",
      avatarColor: "#E8703A", // TODO: Pick any hex colour for the avatar

      // ── Service details ───────────────────────────────────────────────────
      // TODO: Change these to match the service you are selling
      serviceName: "Pipe Repair",
      serviceDescription: "Fix leaks, burst pipes, and joints",
      servicePrice: 10, // TODO: Full price in KES (integer)
      serviceDuration: "1–2 hours",

      // ── Payment details ───────────────────────────────────────────────────
      // TODO: Replace with your real M-PESA buygoods till number
      tillNumber: "3350657",
      // TODO: Replace with your business name as it appears on the M-PESA PIN screen
      tradingName: "Kamau Plumbing",
      // Deposit = 50% of servicePrice. Change the multiplier below if needed.
      // Example: 0.5 = 50%, 1.0 = full amount, 0.25 = 25%
      depositRatio: 0.1,
    };
    // ╔══════════════════════════════════════════════════════════════════════╗
    // ║  END OF CONFIG — Do not edit below unless you know what you're doing║
    // ╚══════════════════════════════════════════════════════════════════════╝

    // ── Load Miniprogram H5 bridge ────────────────────────────────────────
    // Must be loaded before any window.my calls are made.
    // If the script is already loaded, calls callback immediately.
    function loadMiniprogramBridge(callback) {
      if (window.my) {
        callback();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://appx/web-view.min.js";
      script.async = true;

      script.onload = function () {
        console.log("[decodeStarter] Miniprogram bridge loaded");
        demoMode = false; // running inside M-PESA Super App
        callback();
      };

      script.onerror = function () {
        // Script failed to load — running outside M-PESA Super App
        console.warn(
          "[decodeStarter] Bridge failed to load — demo mode active",
        );
        callback();
      };

      document.head.appendChild(script);
    }

    // ── Payment helper ────────────────────────────────────────────────────
    // Uses window.my (not typeof my) for reliable detection.
    // Live mode: sends postMessage to miniprogram shell which calls my.call().
    // Demo mode: simulates a 2.5s APP push wait and returns success.
    let resolvePayment = null;
    let rejectPayment = null;
    function payWithMpesa(tillNumber, amount, tradingName) {
      return new Promise(function (resolve, reject) {
        if (window.my) {
          // ── LIVE MODE (inside M-PESA Super App) ─────────────────────
          // Send payment request to the miniprogram shell.
          // The miniprogram handles my.pay() and posts the result back.
          resolvePayment = resolve;
          rejectPayment = reject;
          window.my.postMessage({
            action: "pay",
            tillNumber: String(tillNumber),
            amount: String(Math.round(amount)),
            tradingName: String(tradingName),
          });
        } else {
          // ── DEMO MODE ───────────────────────────────────────────────
          // window.my not available — browser / AppCube Studio preview.
          // Simulates a 2.5s APP push wait then returns success.
          // No code change needed when deployed inside M-PESA Super App.
          console.log("[decodeStarter] Demo mode — simulating M-PESA payment");
          console.log(
            "[decodeStarter] Till:",
            tillNumber,
            "| Amount: KES",
            amount,
          );
          setTimeout(function () {
            resolve({ transactionId: "TEW1234", demo: true });
          }, 2500);
        }
      });
    }

    // ── Booking reference generator ───────────────────────────────────────
    function generateRef() {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let ref = "BB-";
      for (let i = 0; i < 6; i++) {
        ref += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return ref;
    }

    // ── Error message mapper ──────────────────────────────────────────────
    function getErrorMessage(code) {
      const messages = {
        6001: "Payment cancelled. Please enter your M-PESA PIN to confirm.",
        6002: "Network error. Please check your connection and try again.",
      };
      return (
        messages[code] ||
        "Payment was not completed. Please try again. (code: " +
          (code || "unknown") +
          ")"
      );
    }

    // ── Calculate deposit amount ──────────────────────────────────────────
    const rawDeposit = CONFIG.servicePrice * CONFIG.depositRatio;
    const depositAmount = Math.ceil(rawDeposit);

    // ── Vue app ───────────────────────────────────────────────────────────
    const app = Vue.createApp({
      i18n,

      data() {
        return {
          CONFIG,
          depositAmount,
          isDemoMode: true, // set correctly after bridge loads below
          isLoading: false,
          isPaid: false,
          errorMessage: "",
          bookingRef: "",
        };
      },
      mounted() {
        loadMiniprogramBridge(() => {
          this.isDemoMode = !window.my;
          if (window.my) {
            window.my.onMessage = (result) => {
              console.log("[decodeStarter] onMessage:", JSON.stringify(result));
              if (result.type !== "paymentResponse") return;
              if (result.success === true) {
                resolvePayment && resolvePayment(result);
              } else {
                rejectPayment && rejectPayment(result);
              }
              resolvePayment = null;
              rejectPayment = null;
            };
          }
        });
      },

      methods: {
        formatPrice(amount) {
          return Number(amount).toLocaleString("en-KE");
        },

        async handlePay() {
          if (this.isLoading || this.isPaid) return;
          this.isLoading = true;
          this.errorMessage = "";

          try {
            const result = await payWithMpesa(
              CONFIG.tillNumber,
              this.depositAmount,
              CONFIG.tradingName,
            );

            this.bookingRef = generateRef();
            this.isPaid = true;

            localStorage.setItem(
              "bb_bookingResult",
              JSON.stringify({
                success: true,
                bookingRef: this.bookingRef,
                provider: CONFIG.providerName,
                service: CONFIG.serviceName,
                amountPaid: this.depositAmount,
                demo: result.demo || false,
                timestamp: new Date().toISOString(),
              }),
            );
          } catch (err) {
            this.errorMessage = getErrorMessage(err && err.resultCode);
          } finally {
            this.isLoading = false;
          }
        },

        resetPayment() {
          this.isLoading = false;
          this.isPaid = false;
          this.errorMessage = "";
          this.bookingRef = "";
          localStorage.removeItem("bb_bookingResult");
        },
      },
    });

    app.use(i18n);
    app.mount($("#decodeStarter", elem)[0]);

    $(window).resize(() => {
      thisObj.sksRefreshEvents();
    });
  },
});
