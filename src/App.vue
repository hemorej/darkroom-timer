<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const dark = ref(false)
const view = ref('setup')
const modalOpen = ref(false)

const develop = ref('10')
const invert = ref('60')
const stop = ref('1')
const fix = ref('5')
const wash = ref('10')

const recipeName = ref('')
const recipeTemp = ref('')
const recipeDev = ref('')

const saved = ref([])

const stages = ref([])
const idx = ref(0)
const stageLeft = ref(0)
const totalLeft = ref(0)
const paused = ref(false)
const done = ref(false)
const elapsedInStage = ref(0)

function pad(n) { return String(n).padStart(2, '0') }
function fmt(s) { s = Math.max(0, Math.round(s)); return pad(Math.floor(s / 60)) + ':' + pad(s % 60) }
function mins(v) { return Math.max(0, Math.round((parseFloat(v) || 0) * 60)) }

function onInvertBlur() {
  const n = parseInt(invert.value) || 0
  invert.value = n === 0 ? '0' : String(Math.max(30, Math.round(n / 30) * 30))
}

let timerInterval = null

function tick() {
  if (view.value !== 'running' || paused.value || done.value) return
  if (stageLeft.value <= 1) {
    if (idx.value >= stages.value.length - 1) {
      stageLeft.value = 0
      totalLeft.value = 0
      done.value = true
    } else {
      const next = idx.value + 1
      idx.value = next
      stageLeft.value = stages.value[next].secs
      totalLeft.value = Math.max(0, totalLeft.value - 1)
      elapsedInStage.value = 0
    }
  } else {
    stageLeft.value--
    totalLeft.value = Math.max(0, totalLeft.value - 1)
    elapsedInStage.value++
  }
}

function start() {
  const list = [
    { key: 'develop', label: 'Development', secs: mins(develop.value) },
    { key: 'stop',    label: 'Stopping',    secs: mins(stop.value)    },
    { key: 'fix',     label: 'Fixing',      secs: mins(fix.value)     },
    { key: 'wash',    label: 'Washing',     secs: mins(wash.value)    },
  ].filter(x => x.secs > 0)
  if (!list.length) return
  const total = list.reduce((a, b) => a + b.secs, 0)
  stages.value = list
  idx.value = 0
  stageLeft.value = list[0].secs
  totalLeft.value = total
  paused.value = false
  done.value = false
  elapsedInStage.value = 0
  view.value = 'running'
}

function resetForm() {
  develop.value = ''
  invert.value = ''
  stop.value = ''
  fix.value = ''
  wash.value = ''
}

function reset() {
  view.value = 'setup'
  paused.value = false
  done.value = false
}

function openModal() { modalOpen.value = true }

function closeModal() {
  modalOpen.value = false
  recipeName.value = ''
  recipeTemp.value = ''
  recipeDev.value = ''
}

function saveRecipe() {
  const name = (recipeName.value || '').trim() || ('Recipe ' + (saved.value.length + 1))
  const rec = {
    name,
    temp: recipeTemp.value,
    developer: recipeDev.value,
    times: { develop: develop.value, invert: invert.value, stop: stop.value, fix: fix.value, wash: wash.value },
  }
  const next = [...saved.value, rec]
  try { localStorage.setItem('darkroom-timer-recipes', JSON.stringify(next)) } catch (e) {}
  saved.value = next
  modalOpen.value = false
  recipeName.value = ''
  recipeTemp.value = ''
  recipeDev.value = ''
}

function loadRecipe(r) {
  const t = r.times || {}
  develop.value = t.develop ?? ''
  invert.value  = t.invert  ?? ''
  stop.value    = t.stop    ?? ''
  fix.value     = t.fix     ?? ''
  wash.value    = t.wash    ?? ''
}

const totalPreviewMin = computed(() =>
  Math.round((mins(develop.value) + mins(stop.value) + mins(fix.value) + mins(wash.value)) / 60)
)

const invertDisplay = computed(() => {
  const s = parseInt(invert.value) || 0
  if (s === 0) return 'off'
  const m = Math.floor(s / 60)
  const rem = s % 60
  if (m === 0) return `${s} sec`
  return rem === 0 ? `${m} min` : `${m}m ${rem}s`
})

const curStage = computed(() => stages.value[idx.value])

const agitation = computed(() => {
  if (view.value !== 'running' || done.value || !curStage.value) return null
  if (curStage.value.key !== 'develop') return null
  const iv = parseInt(invert.value) || 0
  if (iv <= 0) return null
  const into = elapsedInStage.value % iv
  const active = into < 5
  return { active, label: active ? 'Invert the tank now' : `Next inversion in ${fmt(iv - into)}` }
})

const overline = computed(() => {
  if (!curStage.value) return ''
  if (done.value) return 'Complete · well developed'
  return `${curStage.value.label} · stage ${idx.value + 1} of ${stages.value.length}`
})

const bigTime = computed(() => done.value ? '00:00' : fmt(stageLeft.value))
const totalTimeStr = computed(() => fmt(totalLeft.value))

const stageRows = computed(() =>
  stages.value.map((st, i) => ({
    label: st.label,
    timeStr: i === idx.value && !done.value ? fmt(stageLeft.value) : fmt(st.secs),
    current: i === idx.value && !done.value,
    completed: i < idx.value || (done.value && i <= idx.value),
  }))
)

onMounted(() => {
  try {
    const raw = localStorage.getItem('darkroom-timer-recipes')
    if (raw) saved.value = JSON.parse(raw)
  } catch (e) {}
  timerInterval = setInterval(tick, 1000)
})

onUnmounted(() => clearInterval(timerInterval))
</script>

<template>
  <div class="app" :class="{ dark }">
    <div class="page">
      <div class="container">

        <!-- Header -->
        <header class="header">
          <div class="app-title">Darkroom Timer</div>
          <button class="theme-toggle" @click="dark = !dark">
            <span>{{ dark ? '☀' : '☾' }}</span>{{ dark ? 'Light' : 'Darkroom' }}
          </button>
        </header>

        <!-- ===== SETUP VIEW ===== -->
        <div v-if="view === 'setup'" class="card">

          <div v-if="saved.length > 0" class="recipes-section">
            <div class="section-overline">Saved recipes</div>
            <div class="chips-row">
              <button v-for="r in saved" :key="r.name" class="chip" @click="loadRecipe(r)">{{ r.name }}</button>
            </div>
          </div>

          <div class="fields">
            <label class="field-row">
              <span class="field-label">Develop for</span>
              <span class="field-value-wrap">
                <input class="field-input" v-model="develop"
                  @beforeinput="$event.data && /[^0-9]/.test($event.data) && $event.preventDefault()"
                  @blur="develop = String(Math.max(0, parseInt(develop) || 0))"
                  inputmode="numeric" placeholder="0" />
                <span class="field-unit">min</span>
              </span>
            </label>
            <label class="field-row">
              <span class="field-label">Invert every</span>
              <span class="field-value-wrap">
                <input class="field-input" v-model="invert"
                  @beforeinput="$event.data && /[^0-9]/.test($event.data) && $event.preventDefault()"
                  @blur="onInvertBlur"
                  inputmode="numeric" placeholder="30" />
                <span class="field-unit">sec</span>
              </span>
            </label>
            <label class="field-row">
              <span class="field-label">Stop for</span>
              <span class="field-value-wrap">
                <input class="field-input" v-model="stop"
                  @beforeinput="$event.data && /[^0-9]/.test($event.data) && $event.preventDefault()"
                  @blur="stop = String(Math.max(0, parseInt(stop) || 0))"
                  inputmode="numeric" placeholder="0" />
                <span class="field-unit">min</span>
              </span>
            </label>
            <label class="field-row">
              <span class="field-label">Fix for</span>
              <span class="field-value-wrap">
                <input class="field-input" v-model="fix"
                  @beforeinput="$event.data && /[^0-9]/.test($event.data) && $event.preventDefault()"
                  @blur="fix = String(Math.max(0, parseInt(fix) || 0))"
                  inputmode="numeric" placeholder="0" />
                <span class="field-unit">min</span>
              </span>
            </label>
            <label class="field-row">
              <span class="field-label">Wash for</span>
              <span class="field-value-wrap">
                <input class="field-input" v-model="wash"
                  @beforeinput="$event.data && /[^0-9]/.test($event.data) && $event.preventDefault()"
                  @blur="wash = String(Math.max(0, parseInt(wash) || 0))"
                  inputmode="numeric" placeholder="0" />
                <span class="field-unit">min</span>
              </span>
            </label>
          </div>

          <div class="total-row">
            <span class="total-label">Total process</span>
            <span class="total-value">≈ {{ totalPreviewMin }} min</span>
          </div>

          <div class="ghost-row">
            <button class="ghost-btn" @click="resetForm">Reset</button>
            <button class="ghost-btn" @click="openModal">Save</button>
          </div>
          <button class="start-btn" @click="start">Start developing ▸</button>
        </div>

        <!-- ===== RUNNING VIEW ===== -->
        <div v-else-if="view === 'running'" class="card">

          <div class="run-overline">{{ overline }}</div>

          <div class="run-time-row">
            <div class="run-bigtime">{{ bigTime }}</div>
            <div class="run-total-wrap">
              <div class="run-total-label">total left</div>
              <div class="run-total-value">{{ totalTimeStr }}</div>
            </div>
          </div>

          <div v-if="agitation" class="agit-callout" :class="{ active: agitation.active }">
            <span class="agit-dot" :class="{ pulsing: agitation.active }"></span>
            <span class="agit-label">{{ agitation.label }}</span>
          </div>

          <div class="stage-list">
            <div
              v-for="row in stageRows"
              :key="row.label"
              class="stage-row"
              :class="{ current: row.current, completed: row.completed }"
            >
              <span class="stage-name">
                <span class="stage-dot"></span>{{ row.label }}
              </span>
              <span class="stage-time">{{ row.timeStr }}</span>
            </div>
          </div>

          <div class="controls-row">
            <button class="reset-circle" @click="reset">↺</button>
            <button class="pause-btn" :class="{ paused, done }" @click="togglePause">
              {{ done ? 'Done' : (paused ? 'Resume' : 'Pause') }}
            </button>
          </div>
        </div>

        <div class="footer">made by <a target="_blank" href="https://jerome-arfouche.com">jerome</a> · for film developers</div>
      </div>
    </div>

    <!-- ===== SAVE MODAL ===== -->
    <div v-if="modalOpen" class="modal-scrim" @click="closeModal">
      <div class="modal-card" @click.stop>
        <div class="modal-title">Save recipe</div>
        <div class="modal-subtitle">Store these times to reuse later</div>

        <label class="modal-field">
          <span class="modal-field-label">Recipe name</span>
          <input class="modal-input" v-model="recipeName" placeholder="e.g. HP5 @ 400" />
        </label>

        <div class="modal-two-col">
          <label class="modal-field flex1">
            <span class="modal-field-label">Temperature</span>
            <input class="modal-input" v-model="recipeTemp" placeholder="20°C" />
          </label>
          <label class="modal-field flex1">
            <span class="modal-field-label">Developer</span>
            <input class="modal-input" v-model="recipeDev" placeholder="Ilfosol 3" />
          </label>
        </div>

        <div class="modal-summary">
          Develops <b class="modal-summary-val">{{ develop || '0' }} min</b> · agitate every <b class="modal-summary-val">{{ invertDisplay }}</b>
        </div>

        <div class="modal-buttons">
          <button class="ghost-btn" @click="closeModal">Cancel</button>
          <button class="accent-btn" @click="saveRecipe">Save recipe</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* ---- Design tokens ---- */
.app {
  --page-bg: #F7F2E9;
  --surface: #FFFDF8;
  --ink: #2B2521;
  --sub: #6B5F50;
  --faint: #A99C8B;
  --line: #E7DDCB;
  --accent: #A2362B;
  --accent-deep: #8A2D23;
  --overline-color: #A2362B;
  --num: #2B2521;
  --soft-bg: #F7E8E5;
  --soft-border: #E5C6C0;
  --accent-shadow: rgba(162,54,43,.3);
}

.app.dark {
  --page-bg: #140605;
  --surface: #1C0A08;
  --ink: #F0C9C0;
  --sub: #B5786E;
  --faint: #7A4138;
  --line: #3A1B16;
  --accent: #FF4F36;
  --accent-deep: #FF6A52;
  --overline-color: #C2402F;
  --num: #FF4F36;
  --soft-bg: #2A0E0A;
  --soft-border: #4A1812;
  --accent-shadow: rgba(0,0,0,.4);
}

/* ---- Page ---- */
.page {
  min-height: 100vh;
  background: var(--page-bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px 60px;
  font-family: 'IBM Plex Sans', -apple-system, sans-serif;
  transition: background 0.3s ease;
}

.container {
  width: 100%;
  max-width: 540px;
}

/* ---- Header ---- */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 36px;
}

.app-title {
  font-family: 'Spectral', serif;
  font-weight: 600;
  font-size: 28px;
  color: var(--ink);
  letter-spacing: -0.01em;
}

.theme-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 16px;
  border: 1.5px solid var(--line);
  background: var(--surface);
  border-radius: 22px;
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: var(--sub);
  cursor: pointer;
}

/* ---- Card ---- */
.card {
  background: var(--surface);
  border-radius: 18px;
  box-shadow: 0 1px 4px rgba(40,20,10,.08);
  padding: 30px 28px 32px;
}

/* ---- Saved recipes ---- */
.recipes-section {
  margin-bottom: 24px;
}

.section-overline {
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--faint);
  font-weight: 600;
  margin-bottom: 12px;
  font-family: 'IBM Plex Sans', sans-serif;
}

.chips-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  height: 38px;
  padding: 0 16px;
  border: 1.5px solid var(--line);
  background: var(--soft-bg);
  border-radius: 19px;
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: var(--accent-deep);
  cursor: pointer;
}

/* ---- Time fields ---- */
.fields {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 0 11px;
  border-bottom: 1.5px solid var(--line);
  cursor: pointer;
}

.field-label {
  font-size: 16px;
  color: var(--sub);
}

.field-value-wrap {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.field-input {
  width: 90px;
  border: none;
  background: transparent;
  text-align: right;
  font-family: 'Spectral', serif;
  font-weight: 500;
  font-size: 30px;
  color: var(--ink);
  outline: none;
  font-variant-numeric: tabular-nums;
}

.field-input::placeholder { color: var(--faint); opacity: 0.6; }

.field-unit {
  font-size: 14px;
  color: var(--faint);
}

/* ---- Total preview ---- */
.total-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
}

.total-label {
  font-size: 14px;
  color: var(--faint);
}

.total-value {
  font-family: 'Spectral', serif;
  font-weight: 500;
  font-size: 20px;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}

/* ---- Ghost buttons ---- */
.ghost-row {
  display: flex;
  gap: 10px;
  margin-top: 26px;
}

.ghost-btn {
  flex: 1;
  height: 50px;
  border: 1.5px solid var(--line);
  background: transparent;
  border-radius: 25px;
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 600;
  font-size: 15px;
  color: var(--sub);
  cursor: pointer;
}

/* ---- Start button ---- */
.start-btn {
  width: 100%;
  height: 60px;
  margin-top: 12px;
  border: none;
  border-radius: 30px;
  background: var(--accent);
  color: #fff;
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 600;
  font-size: 18px;
  cursor: pointer;
  box-shadow: 0 6px 18px var(--accent-shadow);
}

/* ---- Running view ---- */
.run-overline {
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--overline-color);
  font-weight: 600;
  margin-bottom: 12px;
}

.run-time-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
}

.run-bigtime {
  font-family: 'Spectral', serif;
  font-weight: 300;
  font-size: 84px;
  line-height: 0.92;
  color: var(--num);
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}

.run-total-wrap {
  text-align: right;
  padding-bottom: 12px;
}

.run-total-label {
  font-size: 13px;
  color: var(--faint);
}

.run-total-value {
  font-family: 'Spectral', serif;
  font-weight: 400;
  font-size: 22px;
  color: var(--sub);
  font-variant-numeric: tabular-nums;
}

/* ---- Agitation callout ---- */
@keyframes drt-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
}

.agit-callout {
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--page-bg);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 16px 18px;
}

.agit-callout.active {
  background: var(--soft-bg);
  border-color: var(--accent);
}

.agit-dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--accent);
  flex: none;
}

.agit-dot.pulsing {
  animation: drt-pulse 1s ease-in-out infinite;
}

.agit-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--sub);
}

.agit-callout.active .agit-label {
  color: var(--accent-deep);
}

/* ---- Stage list ---- */
.stage-list {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
}

.stage-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-top: 1px solid var(--line);
}

.stage-name {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 400;
  color: var(--sub);
}

.stage-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--line);
  flex: none;
}

.stage-time {
  font-family: 'Spectral', serif;
  font-weight: 400;
  font-size: 21px;
  color: var(--sub);
  font-variant-numeric: tabular-nums;
}

.stage-row.current .stage-name { font-weight: 600; color: var(--ink); }
.stage-row.current .stage-dot  { background: var(--accent); }
.stage-row.current .stage-time { font-weight: 600; color: var(--ink); }

.stage-row.completed .stage-name { color: var(--faint); }
.stage-row.completed .stage-dot  { background: var(--faint); }
.stage-row.completed .stage-time { color: var(--faint); }

/* ---- Controls ---- */
.controls-row {
  display: flex;
  gap: 10px;
  margin-top: 26px;
}

.reset-circle {
  width: 56px;
  height: 56px;
  border: 1.5px solid var(--line);
  background: transparent;
  border-radius: 28px;
  font-size: 20px;
  color: var(--sub);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  flex: none;
}

.pause-btn {
  flex: 1;
  height: 56px;
  border: 1.5px solid var(--accent);
  border-radius: 28px;
  background: transparent;
  color: var(--accent);
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 600;
  font-size: 17px;
  cursor: pointer;
}

.pause-btn.paused {
  background: var(--accent);
  color: #fff;
}

.pause-btn.done {
  background: var(--soft-bg);
  color: var(--faint);
  border-color: var(--line);
}

/* ---- Footer ---- */
.footer {
  text-align: center;
  margin-top: 28px;
  font-size: 13px;
  color: var(--faint);
}

.footer a {
  color: var(--sub);
  text-decoration: underline;
  text-decoration-color: var(--line);
  text-underline-offset: 2px;
}

/* ---- Modal ---- */
.modal-scrim {
  position: fixed;
  inset: 0;
  background: rgba(25,12,8,.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 50;
}

.modal-card {
  width: 100%;
  max-width: 440px;
  background: var(--surface);
  border-radius: 18px;
  box-shadow: 0 24px 60px rgba(20,8,4,.4);
  padding: 30px 28px;
}

.modal-title {
  font-family: 'Spectral', serif;
  font-weight: 600;
  font-size: 23px;
  color: var(--ink);
}

.modal-subtitle {
  font-size: 14px;
  color: var(--faint);
  margin: 3px 0 24px;
}

.modal-field {
  display: block;
  margin-bottom: 20px;
}

.modal-field-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--sub);
  margin-bottom: 8px;
}

.modal-input {
  width: 100%;
  height: 48px;
  border: 1.5px solid var(--line);
  border-radius: 12px;
  background: var(--page-bg);
  padding: 0 14px;
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 16px;
  color: var(--ink);
  outline: none;
}

.modal-two-col {
  display: flex;
  gap: 14px;
  margin-bottom: 0;
}

.modal-field.flex1 {
  flex: 1;
  margin-bottom: 0;
}

.modal-summary {
  background: var(--soft-bg);
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 14px;
  color: var(--sub);
  margin: 18px 0 24px;
  line-height: 1.5;
}

.modal-summary-val {
  color: var(--ink);
  font-weight: 600;
}

.modal-buttons {
  display: flex;
  gap: 10px;
}

.modal-buttons .ghost-btn {
  margin: 0;
}

.accent-btn {
  flex: 1;
  height: 50px;
  border: none;
  border-radius: 25px;
  background: var(--accent);
  color: #fff;
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
}
</style>
