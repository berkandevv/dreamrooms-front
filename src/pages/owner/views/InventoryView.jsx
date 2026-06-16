import { formatPrice } from '../../../utils/formatPrice'
import { formatSquareMeters } from '../../../utils/formatSquareMeters'
import { pluralize } from '../../../utils/textUtils'
import AvailabilityPreview from '../AvailabilityPreview'
import {
  getAvailabilityRanges,
  getSpecialAvailabilityDays,
} from '../availabilityHelpers'
import RoomTypeFormFields from '../fields/RoomTypeFormFields'
import {
  Metric,
  PanelCard,
  PrimaryButton,
  SelectInput,
  StatusBadge,
  TextInput,
} from '../OwnerUi'

// Vista de inventario: tarjetas de habitaciones, disponibilidad y formularios
// para crear habitaciones, cerrar fechas y aplicar disponibilidad por rango.
export default function InventoryView({
  availabilityForm,
  availabilityPreview,
  availabilityPreviewError,
  closeDate,
  hotels,
  isAvailabilityPreviewLoading,
  isSaving,
  onAvailabilitySubmit,
  onCloseDateSubmit,
  onCreateRoomType,
  onHotelChange,
  onRoomTypeChange,
  roomTypeForm,
  roomTypeServices,
  roomTypes,
  selectedHotelId,
  selectedRoomTypeId,
  updateAvailabilityForm,
  updateCloseDate,
  updateRoomTypeForm,
}) {
  const selectedRoomType = roomTypes.find((roomType) => {
    return String(roomType.id) === String(selectedRoomTypeId)
  })
  const availabilityRanges = getAvailabilityRanges(availabilityPreview)
  const specialAvailabilityDays = getSpecialAvailabilityDays(
    availabilityPreview,
    selectedRoomType,
  )

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <section className="space-y-6 lg:col-span-8">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <h2 className="text-2xl font-bold text-primary">Inventario</h2>
            <p className="text-secondary">
              Gestiona tipos de habitación, precios y disponibilidad
            </p>
          </div>
          <select
            className="cursor-pointer rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-on-surface outline-none transition hover:border-outline focus:border-primary focus:ring-2 focus:ring-primary/15"
            onChange={(event) => onHotelChange(event.target.value)}
            value={selectedHotelId}
          >
            {hotels.map((hotel) => (
              <option key={hotel.id} value={hotel.id}>
                {hotel.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {roomTypes.map((roomType) => (
            <article
              aria-pressed={String(roomType.id) === String(selectedRoomTypeId)}
              className={`cursor-pointer overflow-hidden rounded-xl border bg-surface-container-lowest text-left shadow-[0_8px_24px_rgba(19,27,46,0.08)] transition hover:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                String(roomType.id) === String(selectedRoomTypeId)
                  ? 'border-primary ring-2 ring-primary/30'
                  : 'border-outline-variant'
              }`}
              key={roomType.id}
              onClick={() => onRoomTypeChange(String(roomType.id))}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onRoomTypeChange(String(roomType.id))
                }
              }}
              role="button"
              tabIndex={0}
            >
              {roomType.cover_image?.url && (
                <img
                  alt={roomType.cover_image.alt_text || roomType.name}
                  className="h-40 w-full object-cover"
                  src={roomType.cover_image.url}
                />
              )}
              <div className="p-5">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-primary">
                      {roomType.name}
                    </h3>
                    <p className="text-sm text-secondary">
                      {roomType.bed_type || 'Cama sin definir'} ·{' '}
                      {formatSquareMeters(roomType.size_m2)} m²
                    </p>
                  </div>
                  <StatusBadge status={roomType.status} />
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <Metric label="Unidades" value={roomType.total_units || 0} />
                  <Metric
                    label="Capacidad"
                    value={`${roomType.capacity_adults || 0} ${pluralize(
                      roomType.capacity_adults,
                      'adulto',
                      'adultos',
                    )}, ${roomType.capacity_children || 0} ${pluralize(
                      roomType.capacity_children,
                      'niño',
                      'niños',
                    )}`}
                  />
                  <Metric
                    label="Precio"
                    value={formatPrice(
                      roomType.base_price,
                      roomType.currency_symbol,
                    )}
                  />
                </div>

                <p
                  className={`mt-4 text-xs font-semibold ${
                    String(roomType.id) === String(selectedRoomTypeId)
                      ? 'text-primary'
                      : 'text-secondary'
                  }`}
                >
                  {String(roomType.id) === String(selectedRoomTypeId)
                    ? 'Mostrando su disponibilidad abajo'
                    : 'Pulsa para ver su disponibilidad'}
                </p>
              </div>
            </article>
          ))}
        </div>

        <AvailabilityPreview
          availabilityDays={availabilityPreview}
          availabilityError={availabilityPreviewError}
          availabilityRanges={availabilityRanges}
          isLoading={isAvailabilityPreviewLoading}
          selectedRoomType={selectedRoomType}
          specialAvailabilityDays={specialAvailabilityDays}
        />
      </section>

      <aside className="space-y-6 lg:col-span-4">
        <PanelCard title="Crear habitación">
          <form className="space-y-3" onSubmit={onCreateRoomType}>
            <RoomTypeFormFields
              form={roomTypeForm}
              onChange={updateRoomTypeForm}
              services={roomTypeServices}
              showImageUpload
            />
            <PrimaryButton disabled={isSaving}>Crear habitación</PrimaryButton>
          </form>
        </PanelCard>

        <PanelCard title="Cerrar una fecha">
          <form className="space-y-3" onSubmit={onCloseDateSubmit}>
            <SelectInput
              label="Tipo de habitación"
              name="room_type_id"
              onChange={(event) => onRoomTypeChange(event.target.value)}
              value={selectedRoomTypeId}
            >
              {roomTypes.map((roomType) => (
                <option key={roomType.id} value={roomType.id}>
                  {roomType.name}
                </option>
              ))}
            </SelectInput>
            <TextInput
              label="Fecha"
              name="close_date"
              onChange={updateCloseDate}
              required
              type="date"
              value={closeDate}
            />
            <PrimaryButton disabled={isSaving || !selectedRoomTypeId}>
              Cerrar fecha
            </PrimaryButton>
          </form>
        </PanelCard>

        <PanelCard title="Disponibilidad por rango o temporada">
          <p className="mb-4 text-sm text-secondary">
            Aplica unidades, precio, estado y mínimo de noches a un periodo
            completo.
          </p>
          <form className="space-y-3" onSubmit={onAvailabilitySubmit}>
            <SelectInput
              label="Tipo de habitación"
              name="room_type_id"
              onChange={(event) => onRoomTypeChange(event.target.value)}
              value={selectedRoomTypeId}
            >
              {roomTypes.map((roomType) => (
                <option key={roomType.id} value={roomType.id}>
                  {roomType.name}
                </option>
              ))}
            </SelectInput>
            <div className="grid grid-cols-2 gap-3">
              <TextInput
                label="Desde"
                name="from"
                onChange={updateAvailabilityForm}
                required
                type="date"
                value={availabilityForm.from}
              />
              <TextInput
                label="Hasta"
                name="to"
                onChange={updateAvailabilityForm}
                required
                type="date"
                value={availabilityForm.to}
              />
              <TextInput
                label="Unidades"
                min="0"
                name="available_units"
                onChange={updateAvailabilityForm}
                required
                type="number"
                value={availabilityForm.available_units}
              />
              <TextInput
                label="Precio"
                min="0"
                name="price"
                onChange={updateAvailabilityForm}
                required
                step="0.01"
                type="number"
                value={availabilityForm.price}
              />
              <TextInput
                label="Mín. noches"
                min="1"
                name="min_stay_nights"
                onChange={updateAvailabilityForm}
                type="number"
                value={availabilityForm.min_stay_nights}
              />
            </div>
            <SelectInput
              label="Estado"
              name="status"
              onChange={updateAvailabilityForm}
              value={availabilityForm.status}
            >
              <option value="open">Abierto</option>
              <option value="closed">Cerrado</option>
            </SelectInput>
            <PrimaryButton disabled={isSaving}>Aplicar cambios</PrimaryButton>
          </form>
        </PanelCard>
      </aside>
    </div>
  )
}
