<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-2">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar class="justify-center text-center q-py-md">
        <div>
          <q-toolbar-title class="text-weight-bold text-h5">
            TALLER DON EFRAÍN
          </q-toolbar-title>
          <div class="text-subtitle2 text-grey-3">
            Servicio de reparación de equipos móviles
          </div>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-md max-width-container">
        <section class="row q-col-gutter-md q-mb-lg">
          <div class="col-12 col-sm-4">
            <q-card flat bordered class="bg-blue-1 text-blue-9 border-left-blue">
              <q-card-section>
                <div class="text-h4 text-weight-bold">{{ getStats().activeRepairs }}</div>
                <div class="text-subtitle2 text-weight-bold text-uppercase">Equipos en Taller</div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-4">
            <q-card flat bordered class="bg-red-1 text-red-9 border-left-red">
              <q-card-section>
                <div class="text-h4 text-weight-bold">${{ getStats().totalPendingBalance.toLocaleString() }}</div>
                <div class="text-subtitle2 text-weight-bold text-uppercase">Cuentas por Cobrar</div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-4">
            <q-card flat bordered class="bg-green-1 text-green-9 border-left-green">
              <q-card-section>
                <div class="text-h4 text-weight-bold">${{ getStats().totalCollected.toLocaleString() }}</div>
                <div class="text-subtitle2 text-weight-bold text-uppercase">Dinero en Caja</div>
              </q-card-section>
            </q-card>
          </div>
        </section>

        <section class="row q-col-gutter-md q-mb-lg items-center">
          <div class="col-12 col-sm-8 col-md-9">
            <q-input
              v-model="searchQuery"
              outlined
              dense
              placeholder="Buscar por cliente o equipo..."
              bg-color="white"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-sm-4 col-md-3">
            <q-btn
              color="primary"
              class="full-width text-weight-bold text-capitalize q-py-sm"
              icon="add"
              label="Registrar Servicio"
              @click="openNewServiceModal"
            />
          </div>
        </section>

        <section class="q-mb-xl">
          <div v-if="getFilteredServices().length === 0" class="text-center q-pa-xl text-grey-6 text-italic text-h6">
            No se encontraron servicios registrados.
          </div>

          <div class="row q-col-gutter-md">
            <div
              v-for="service in getFilteredServices()"
              :key="service.id"
              class="col-12 col-sm-6 col-md-4"
            >
              <q-card
                flat
                bordered
                class="service-card q-pa-sm"
                :class="getCardClass(service)"
              >
                <div
                  v-if="String(service.deviceStatus).toLowerCase() !== 'entregado'"
                  class="bg-orange text-white text-center q-py-xs q-mb-sm text-bold rounded-borders text-caption"
                >
                  ⚠️ Pendiente de Entregar
                </div>

                <q-card-section class="q-pt-xs">
                  <div class="row justify-between items-center q-mb-sm">
                    <q-badge
                      :color="getDeviceStatusColor(service.deviceStatus)"
                      text-color="white"
                      class="text-bold q-py-xs q-px-sm"
                    >
                      {{ getStatusLabel(service.deviceStatus) }}
                    </q-badge>
                    <q-badge
                      :color="getPaymentStatusColor(service.paymentStatus)"
                      text-color="white"
                      class="text-bold q-py-xs q-px-sm"
                    >
                      {{ service.paymentStatus.toUpperCase() }}
                    </q-badge>
                  </div>

                  <div class="text-h6 text-weight-bold text-grey-9">{{ service.deviceBrandModel }}</div>
                  <div class="text-subtitle2 text-grey-7"><strong>Cliente:</strong> {{ service.clientName }}</div>

                  <q-separator class="q-my-md" />

                  <div class="q-gutter-y-xs text-body2 text-grey-8">
                    <div><strong>Reparación:</strong> {{ service.repairType }}</div>
                    <div><strong>Técnico:</strong> {{ service.technician }}</div>
                    <div><strong>Método de pago:</strong> {{ service.paymentMethod }}</div>
                    <div><strong>Precio Total:</strong> ${{ Number(service.price).toLocaleString() }}</div>

                    <div v-if="String(service.paymentStatus).toLowerCase() === 'abono'" class="bg-amber-1 q-pa-sm rounded-borders q-mt-xs text-grey-9">
                      <div v-if="Number(service.advancePayment1) > 0" class="text-caption">
                        • <strong>Abono 1:</strong> ${{ Number(service.advancePayment1).toLocaleString() }}
                      </div>
                      <div v-if="Number(service.advancePayment2) > 0" class="text-caption">
                        • <strong>Abono 2:</strong> ${{ Number(service.advancePayment2).toLocaleString() }}
                      </div>
                      <q-separator class="q-my-xs" />
                      <div class="text-caption text-weight-bold text-amber-10">
                        Total Abonado: ${{ (Number(service.advancePayment1 || 0) + Number(service.advancePayment2 || 0)).toLocaleString() }}
                      </div>
                    </div>

                    <div v-if="String(service.paymentStatus).toLowerCase() === 'pendiente' || (String(service.paymentStatus).toLowerCase() === 'abono' && getPendingBalance(service) > 0)" class="q-mt-xs">
                      <strong>Saldo Pendiente:</strong>
                      <span class="text-red text-weight-bold">
                        ${{ getPendingBalance(service).toLocaleString() }}
                      </span>
                    </div>
                    <div v-else-if="String(service.paymentStatus).toLowerCase() === 'abono' && getPendingBalance(service) === 0" class="q-mt-xs text-green text-weight-bold">
                      ✓ Totalmente Cubierto
                    </div>
                  </div>

                  <div v-if="String(service.deviceStatus).toLowerCase() === 'entregado'" class="q-mt-sm">
                    <strong>Calificación:</strong>
                    <q-rating
                      v-model="service.rating"
                      max="5"
                      size="1.2em"
                      color="amber"
                      icon="star"
                      readonly
                    />
                  </div>

                  <div v-if="service.observations" class="bg-grey-2 q-pa-xs q-mt-sm rounded-borders text-caption text-grey-8 border-left-secondary">
                    <strong>Notas:</strong> {{ service.observations }}
                  </div>

                  <div class="text-caption text-grey-5 text-italic q-mt-sm">
                    Recibido: {{ formatDate(service.receptionDate) }}
                  </div>
                </q-card-section>

                <q-card-actions align="right" class="q-pt-none">
                  <q-btn flat dense color="grey-7" label="Editar" icon="edit" class="q-px-sm" @click="openEditServiceModal(service)" />
                  <q-btn flat dense color="negative" label="Eliminar" icon="delete" class="q-px-sm" @click="confirmDelete(service)" />
                </q-card-actions>
              </q-card>
            </div>
          </div>
        </section>

        <q-dialog v-model="isModalOpen" persistent>
          <q-card style="width: 500px; max-width: 90vw;">
            <q-card-section class="row items-center q-pb-none">
              <div class="text-h6 text-weight-bold">{{ isEditMode ? 'Editar Servicio' : 'Nuevo Servicio' }}</div>
              <q-space />
              <q-btn icon="close" flat round dense v-close-popup @click="isModalOpen = false" />
            </q-card-section>

            <q-card-section class="q-pt-md">
              <q-form @submit.prevent="saveService" class="q-gutter-y-md">
                <q-input
                  v-model="form.clientName"
                  outlined
                  label="Nombre del cliente"
                  :error="!!errors.clientName"
                  :error-message="errors.clientName"
                  dense
                />

                <q-input
                  v-model="form.deviceBrandModel"
                  outlined
                  label="Marca y modelo del equipo"
                  :error="!!errors.deviceBrandModel"
                  :error-message="errors.deviceBrandModel"
                  dense
                />

                <q-select
                  v-model="form.repairType"
                  outlined
                  :options="REPAIR_OPTIONS"
                  label="Tipo de reparación"
                  :error="!!errors.repairType"
                  :error-message="errors.repairType"
                  dense
                />

                <q-select
                  v-model="form.technician"
                  outlined
                  :options="TECHNICIAN_OPTIONS"
                  label="Técnico que atendió"
                  :error="!!errors.technician"
                  :error-message="errors.technician"
                  dense
                />

                <q-input
                  v-model="form.receptionDate"
                  outlined
                  type="datetime-local"
                  label="Fecha y hora de recepción"
                  stack-label
                  :error="!!errors.receptionDate"
                  :error-message="errors.receptionDate"
                  dense
                />

                <div class="row q-col-gutter-sm">
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model.number="form.price"
                      outlined
                      type="number"
                      min="0"
                      label="Precio total"
                      :error="!!errors.price"
                      :error-message="errors.price"
                      dense
                    />
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-select
                      v-model="form.paymentMethod"
                      outlined
                      :options="PAYMENT_METHODS"
                      label="Método de pago"
                      :error="!!errors.paymentMethod"
                      :error-message="errors.paymentMethod"
                      dense
                    />
                  </div>
                </div>

                <div class="row q-col-gutter-sm">
                  <div class="col-12 col-sm-6">
                    <q-select
                      v-model="form.paymentStatus"
                      outlined
                      :options="PAYMENT_STATUSES"
                      label="Estado del pago"
                      :error="!!errors.paymentStatus"
                      :error-message="errors.paymentStatus"
                      dense
                    />
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-select
                      v-model="form.deviceStatus"
                      outlined
                      :options="DEVICE_STATUSES"
                      label="Estado del equipo"
                      :error="!!errors.deviceStatus"
                      :error-message="errors.deviceStatus"
                      dense
                    />
                  </div>
                </div>

                <div v-if="String(form.paymentStatus).toLowerCase() === 'abono'" class="q-mt-sm">
                  <div class="row q-col-gutter-sm">
                    <div class="col-12 col-sm-6">
                      <q-input
                        v-model.number="form.advancePayment1"
                        outlined
                        type="number"
                        min="0"
                        label="Primer abono"
                        :error="!!errors.advancePayment1"
                        :error-message="errors.advancePayment1"
                        dense
                      />
                    </div>
                    <div class="col-12 col-sm-6">
                      <q-input
                        v-model.number="form.advancePayment2"
                        outlined
                        type="number"
                        min="0"
                        label="Segundo abono (Opcional)"
                        :error="!!errors.advancePayment2"
                        :error-message="errors.advancePayment2"
                        dense
                      />
                    </div>
                  </div>
                  <div v-if="form.price" class="text-caption text-primary text-italic q-mt-xs">
                    Total abonado: ${{ (Number(form.advancePayment1 || 0) + Number(form.advancePayment2 || 0)).toLocaleString() }} |
                    Saldo restante: ${{ Math.max(0, form.price - (Number(form.advancePayment1 || 0) + Number(form.advancePayment2 || 0))).toLocaleString() }}
                  </div>
                </div>

                <div v-if="String(form.deviceStatus).toLowerCase() === 'entregado'" class="q-mt-sm">
                  <div class="text-subtitle2 text-grey-8 q-mb-xs">Calificación del cliente (1 a 5 estrellas)</div>
                  <q-rating
                    v-model="form.rating"
                    max="5"
                    size="2.2em"
                    color="amber"
                    icon="star"
                  />
                </div>

                <q-input
                  v-model="form.observations"
                  outlined
                  type="textarea"
                  label="Observaciones adicionales (Opcional)"
                  dense
                  rows="3"
                />

                <q-card-actions align="right" class="q-px-none q-pt-md">
                  <q-btn flat label="Cancelar" color="grey-7" @click="isModalOpen = false" />
                  <q-btn type="submit" label="Guardar Registro" color="primary" class="q-px-lg" />
                </q-card-actions>
              </q-form>
            </q-card-section>
          </q-card>
        </q-dialog>

        <q-dialog v-model="showDeleteConfirm" persistent>
          <q-card style="width: 400px; max-width: 90vw;">
            <q-card-section class="row items-center">
              <q-avatar icon="warning" color="negative" text-color="white" />
              <span class="q-ml-sm text-h6 text-weight-bold text-negative">⚠️ Confirmar Eliminación</span>
            </q-card-section>

            <q-card-section class="text-body1 text-grey-8">
              ¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.
            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat label="Cancelar" color="grey-7" @click="showDeleteConfirm = false" />
              <q-btn label="Eliminar Definitivamente" color="negative" @click="deleteService" />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useLocalStorage } from '@vueuse/core'

const REPAIR_OPTIONS = [
  'cambio de pantalla',
  'cambio de batería',
  'cambio de pin de carga',
  'liberación',
  'mantenimiento de software',
  'cambio de flex',
  'otros'
]
const TECHNICIAN_OPTIONS = ['Don Efraín', 'Técnico 1', 'Técnico 2']
const PAYMENT_METHODS = ['Efectivo', 'Transferencia', 'Tarjeta']
const PAYMENT_STATUSES = ['Pagado', 'Pendiente', 'Abono']
const DEVICE_STATUSES = ['Recibido', 'En reparación', 'Listo para entregar', 'Entregado']

const services = useLocalStorage('efrain-cell-reparations', [])
const searchQuery = ref('')
const isModalOpen = ref(false)
const isEditMode = ref(false)
const editIndex = ref(-1)
const showDeleteConfirm = ref(false)
const indexToDelete = ref(-1)

const form = ref({
  id: '',
  clientName: '',
  deviceBrandModel: '',
  repairType: '',
  technician: '',
  receptionDate: '',
  price: 0,
  paymentMethod: '',
  paymentStatus: 'Pendiente',
  deviceStatus: 'Recibido',
  rating: 0,
  observations: '',
  advancePayment1: 0,
  advancePayment2: 0
})

const errors = ref({
  clientName: '',
  deviceBrandModel: '',
  repairType: '',
  technician: '',
  receptionDate: '',
  price: '',
  paymentMethod: '',
  paymentStatus: '',
  deviceStatus: '',
  advancePayment1: '',
  advancePayment2: ''
})

const getCardClass = (service) => {
  const payStatus = String(service.paymentStatus || '').toLowerCase()
  if (payStatus === 'pendiente') return 'card-alert-pending'
  if (payStatus === 'abono') return 'card-alert-abono'
  return ''
}

const getStatusLabel = (status) => {
  if (status === 'En reparación') return 'Reparando'
  if (status === 'Listo para entregar') return 'Listo'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const getDeviceStatusColor = (status) => {
  const s = String(status).toLowerCase()
  if (s === 'recibido') return 'negative'
  if (s === 'en reparación') return 'warning'
  if (s === 'listo para entregar') return 'orange'
  if (s === 'entregado') return 'positive'
  return 'grey'
}

const getPaymentStatusColor = (status) => {
  const s = String(status).toLowerCase()
  if (s === 'pagado') return 'positive'
  if (s === 'pendiente') return 'negative'
  if (s === 'abono') return 'warning'
  return 'grey'
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getPendingBalance = (service) => {
  const price = Number(service.price) || 0
  const payStatus = String(service.paymentStatus || '').toLowerCase()
  if (payStatus === 'pendiente') {
    return price
  }
  if (payStatus === 'abono') {
    const abono1 = Number(service.advancePayment1) || 0
    const abono2 = Number(service.advancePayment2) || 0
    return Math.max(0, price - (abono1 + abono2))
  }
  return 0
}

const getStats = () => {
  let pendingCount = 0
  let totalCollected = 0
  let totalPendingBalance = 0
  let activeRepairs = 0

  services.value.forEach(item => {
    const devStatus = String(item.deviceStatus || '').toLowerCase()
    const payStatus = String(item.paymentStatus || '').toLowerCase()

    if (devStatus !== 'entregado') activeRepairs++

    const price = Number(item.price) || 0
    const abono1 = Number(item.advancePayment1) || 0
    const abono2 = Number(item.advancePayment2) || 0
    const totalAbonado = abono1 + abono2

    if (payStatus === 'pendiente') {
      pendingCount++
      totalPendingBalance += price
    } else if (payStatus === 'abono') {
      totalCollected += totalAbonado
      totalPendingBalance += Math.max(0, price - totalAbonado)
      if (price - totalAbonado > 0) {
        pendingCount++
      }
    } else if (payStatus === 'pagado') {
      totalCollected += price
    }
  })

  return { pendingCount, totalCollected, totalPendingBalance, activeRepairs }
}

const getFilteredServices = () => {
  if (!searchQuery.value) return services.value
  const query = searchQuery.value.toLowerCase()
  return services.value.filter(service =>
    (service.clientName && service.clientName.toLowerCase().includes(query)) ||
    (service.deviceBrandModel && service.deviceBrandModel.toLowerCase().includes(query))
  )
}

const getLocalDatetime = () => {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000
  return new Date(now - offset).toISOString().slice(0, 16)
}

const clearErrors = () => {
  errors.value = {
    clientName: '',
    deviceBrandModel: '',
    repairType: '',
    technician: '',
    receptionDate: '',
    price: '',
    paymentMethod: '',
    paymentStatus: '',
    deviceStatus: '',
    advancePayment1: '',
    advancePayment2: ''
  }
}

const validateForm = () => {
  let isValid = true
  clearErrors()

  if (!form.value.clientName) {
    errors.value.clientName = 'El nombre del cliente es obligatorio'
    isValid = false
  }
  if (!form.value.deviceBrandModel) {
    errors.value.deviceBrandModel = 'La marca y modelo del equipo son obligatorios'
    isValid = false
  }
  if (!form.value.repairType) {
    errors.value.repairType = 'Debe seleccionar el tipo de reparación'
    isValid = false
  }
  if (!form.value.technician) {
    errors.value.technician = 'Debe indicar el técnico que atiende'
    isValid = false
  }
  if (!form.value.receptionDate) {
    errors.value.receptionDate = 'La fecha de recepción es obligatoria'
    isValid = false
  }
  if (form.value.price === null || form.value.price === undefined || form.value.price < 0) {
    errors.value.price = 'El precio debe ser igual o mayor a cero'
    isValid = false
  }
  if (!form.value.paymentMethod) {
    errors.value.paymentMethod = 'Seleccione el método de pago'
    isValid = false
  }
  if (!form.value.paymentStatus) {
    errors.value.paymentStatus = 'Seleccione el estado del pago'
    isValid = false
  }
  if (!form.value.deviceStatus) {
    errors.value.deviceStatus = 'Seleccione el estado del equipo'
    isValid = false
  }

  const payStatus = String(form.value.paymentStatus || '').toLowerCase()
  if (payStatus === 'abono') {
    const abono1 = Number(form.value.advancePayment1) || 0
    const abono2 = Number(form.value.advancePayment2) || 0
    const totalAbonado = abono1 + abono2

    if (abono1 < 0) {
      errors.value.advancePayment1 = 'El abono no puede ser un valor negativo'
      isValid = false
    }
    if (abono2 < 0) {
      errors.value.advancePayment2 = 'El abono no puede ser un valor negativo'
      isValid = false
    }
    if (abono1 === 0 && abono2 === 0) {
      errors.value.advancePayment1 = 'Se debe ingresar al menos el primer abono válido'
      isValid = false
    }
    if (totalAbonado > form.value.price) {
      errors.value.advancePayment2 = 'La suma de ambos abonos no puede ser mayor al precio total de reparación'
      isValid = false
    }
  }

  return isValid
}

const openNewServiceModal = () => {
  isEditMode.value = false
  clearErrors()
  form.value = {
    id: Date.now().toString(),
    clientName: '',
    deviceBrandModel: '',
    repairType: '',
    technician: '',
    receptionDate: getLocalDatetime(),
    price: 0,
    paymentMethod: 'Efectivo',
    paymentStatus: 'Pendiente',
    deviceStatus: 'Recibido',
    rating: 0,
    observations: '',
    advancePayment1: 0,
    advancePayment2: 0
  }
  isModalOpen.value = true
}

const openEditServiceModal = (service) => {
  isEditMode.value = true
  clearErrors()
  editIndex.value = services.value.findIndex(item => item.id === service.id)
  form.value = { ...service }
  isModalOpen.value = true
}

const saveService = () => {
  if (!validateForm()) return

  form.value.price = Number(form.value.price) || 0
  form.value.advancePayment1 = Number(form.value.advancePayment1) || 0
  form.value.advancePayment2 = Number(form.value.advancePayment2) || 0

  const payStatus = String(form.value.paymentStatus || '').toLowerCase()
  if (payStatus !== 'abono') {
    form.value.advancePayment1 = 0
    form.value.advancePayment2 = 0
  }

  const devStatus = String(form.value.deviceStatus || '').toLowerCase()
  if (devStatus !== 'entregado') {
    form.value.rating = 0
  }

  if (isEditMode.value) {
    if (editIndex.value !== -1) {
      services.value[editIndex.value] = { ...form.value }
    }
  } else {
    services.value.push({ ...form.value })
  }
  isModalOpen.value = false
}

const confirmDelete = (service) => {
  indexToDelete.value = services.value.findIndex(item => item.id === service.id)
  showDeleteConfirm.value = true
}

const deleteService = () => {
  if (indexToDelete.value !== -1) {
    services.value.splice(indexToDelete.value, 1)
  }
  showDeleteConfirm.value = false
  indexToDelete.value = -1
}
</script>

<style scoped>
.max-width-container {
  max-width: 1200px;
  margin: 0 auto;
}

.border-left-blue {
  border-left: 5px solid #2196f3;
}
.border-left-red {
  border-left: 5px solid #f44336;
}
.border-left-green {
  border-left: 5px solid #4caf50;
}
.border-left-secondary {
  border-left: 3px solid #7f8c8d;
}

.card-alert-pending {
  border-left: 6px solid #e74c3c !important;
}
.card-alert-abono {
  border-left: 6px solid #f1c40f !important;
}

.service-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

@media screen and (max-width: 768px) {
  .service-card {
    flex-direction: column;
    height: auto;
    margin-bottom: 20px;
    padding: 10px;
    box-sizing: border-box;
    width: 100%;
    margin-left: 0;
    margin-right: 0;
    border-left: none;
    border-radius: 5px;
  }
}
</style>
