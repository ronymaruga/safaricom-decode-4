<div id="ronDev">
  <!-- ── HEADER ─────────────────────────────────────────────────────────── -->
  <div class="st-header">
    <div class="st-header__brand">
      <div class="st-header__dot"></div>
      <span class="st-header__name">{{ CONFIG.businessName }}</span>
    </div>
    <!-- Demo mode badge — hidden in production -->
    <div class="st-header__demo-badge" v-if="isDemoMode">⚡ Demo Mode</div>
  </div>

  <!-- ── PROVIDER CARD (dark bento hero) ───────────────────────────────── -->
  <div class="st-hero">
    <div class="st-hero__avatar" :style="{ background: CONFIG.avatarColor }">
      {{ CONFIG.avatarInitials }}
    </div>
    <div class="st-hero__info">
      <h1 class="st-hero__name">{{ CONFIG.providerName }}</h1>
      <span class="st-hero__role">{{ CONFIG.providerRole }}</span>
      <div class="st-hero__rating">
        <span class="st-hero__stars">★★★★★</span>
        <span class="st-hero__rating-val">{{ CONFIG.rating }}</span>
      </div>
    </div>
    <div class="st-hero__deco"></div>
  </div>

  <!-- ── SERVICE CARD ───────────────────────────────────────────────────── -->
  <div class="st-service">
    <div class="st-service__top">
      <div class="st-service__info">
        <span class="st-service__label">Service</span>
        <span class="st-service__name">{{ CONFIG.serviceName }}</span>
        <span class="st-service__desc">{{ CONFIG.serviceDescription }}</span>
      </div>
      <div class="st-service__price-box">
        <span class="st-service__price-label">Total</span>
        <span class="st-service__price"
          >KES {{ formatPrice(CONFIG.servicePrice) }}</span
        >
      </div>
    </div>
    <div class="st-service__divider"></div>
    <div class="st-service__deposit-row">
      <span class="st-service__deposit-label">Deposit due now</span>
      <span class="st-service__deposit-amount"
        >KES {{ formatPrice(depositAmount) }}</span
      >
    </div>
    <div class="st-service__duration-row">
      <span class="st-service__duration-icon">⏱</span>
      <span class="st-service__duration">{{ CONFIG.serviceDuration }}</span>
    </div>
  </div>

  <!-- ── PAYMENT SECTION ────────────────────────────────────────────────── -->
  <div class="st-payment">
    <!-- M-PESA branding row -->
    <div class="st-payment__mpesa-row">
      <div class="st-payment__mpesa-logo">M</div>
      <div class="st-payment__mpesa-info">
        <span class="st-payment__mpesa-title">Pay with M-PESA</span>
        <span class="st-payment__mpesa-sub"
          >You'll need to approve the payment on the MPESA APP</span
        >
      </div>
    </div>

    <!-- Pay button -->
    <button
      class="st-payment__btn"
      :class="{
        'st-payment__btn--loading': isLoading,
        'st-payment__btn--success': isPaid,
      }"
      :disabled="isLoading || isPaid"
      @click="handlePay"
    >
      <span v-if="!isLoading && !isPaid">
        Pay KES {{ formatPrice(depositAmount) }} deposit
      </span>
      <span v-else-if="isLoading" class="st-payment__spinner-row">
        <span class="st-payment__spinner"></span>
        Waiting for M-PESA…
      </span>
      <span v-else>✓ Payment Complete</span>
    </button>

    <!-- Error message -->
    <div class="st-payment__error" v-if="errorMessage">
      <span>⚠️ {{ errorMessage }}</span>
      <button class="st-payment__retry" @click="resetPayment">Retry</button>
    </div>

    <!-- Security note -->
    <p class="st-payment__note">
      🔒 Secured by Safaricom M-PESA · No hidden charges
    </p>
  </div>

  <!-- ── SUCCESS STATE ───────────────────────────────────────────────────── -->
  <div class="st-success" v-if="isPaid">
    <div class="st-success__icon">✓</div>
    <h2 class="st-success__title">Booking Confirmed!</h2>
    <p class="st-success__sub">
      {{ CONFIG.providerName }} will be in touch shortly.
    </p>
    <div class="st-success__ref">
      <span class="st-success__ref-label">Reference</span>
      <span class="st-success__ref-val">{{ bookingRef }}</span>
    </div>
    <span class="st-success__demo" v-if="isDemoMode">
      ⚡ Simulated payment — deploy inside M-PESA Super App for live payments
    </span>
    <button class="st-success__reset" @click="resetPayment">Book Again</button>
  </div>
</div>
