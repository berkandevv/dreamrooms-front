import { useState } from 'react'
import { formatDate } from '../../utils/dateUtils'
import { formatPrice } from '../../utils/formatPrice'
import { pluralize } from '../../utils/textUtils'
import {
  getMinStayNights,
  isSpecialAvailabilityDay,
} from './availabilityHelpers'
import { Metric, PanelCard, StatusBadge } from './OwnerUi'

export default function AvailabilityPreview({
  availabilityDays,
  availabilityError,
  availabilityRanges,
  isLoading,
  selectedRoomType,
  specialAvailabilityDays,
}) {
  // Clasifica los días y rangos por estado (abiertos, cerrados y especiales)
  const openDays = availabilityDays.filter((dayAvailability) => {
    return dayAvailability.status === 'open'
  }).length
  const unavailableDays = availabilityDays.filter((dayAvailability) => {
    return dayAvailability.status !== 'open'
  }).length
  const regularRanges = availabilityRanges.filter((availabilityRange) => {
    return !isSpecialAvailabilityDay(availabilityRange.sample, selectedRoomType)
  })
  const closedRanges = availabilityRanges.filter((availabilityRange) => {
    return availabilityRange.sample.status === 'closed'
  })
  const specialRanges = availabilityRanges.filter((availabilityRange) => {
    return (
      availabilityRange.sample.status !== 'closed' &&
      isSpecialAvailabilityDay(availabilityRange.sample, selectedRoomType)
    )
  })
  const [showAllRegularRanges, setShowAllRegularRanges] = useState(false)
  const [showAllClosedRanges, setShowAllClosedRanges] = useState(false)
  const [showAllSpecialRanges, setShowAllSpecialRanges] = useState(false)
  const visibleRegularRanges = showAllRegularRanges
    ? regularRanges
    : regularRanges.slice(0, 4)
  const visibleClosedRanges = showAllClosedRanges
    ? closedRanges
    : closedRanges.slice(0, 4)
  const visibleSpecialRanges = showAllSpecialRanges
    ? specialRanges
    : specialRanges.slice(0, 4)

  return (
    <PanelCard
      title={
        selectedRoomType
          ? `Disponibilidad · ${selectedRoomType.name}`
          : 'Disponibilidad próxima'
      }
    >
      {!selectedRoomType && (
        <p className="text-sm text-secondary">
          Selecciona una habitación para ver los próximos 90 días.
        </p>
      )}

      {selectedRoomType && isLoading && (
        <p className="text-sm text-secondary">Cargando disponibilidad...</p>
      )}

      {selectedRoomType && availabilityError && (
        <p className="rounded-lg border border-error bg-error-container p-3 text-sm font-semibold text-error">
          {availabilityError}
        </p>
      )}

      {selectedRoomType &&
        !isLoading &&
        !availabilityError &&
        availabilityRanges.length === 0 && (
          <p className="text-sm text-secondary">
            No hay disponibilidad cargada para los próximos 90 días.
          </p>
        )}

      {selectedRoomType && availabilityRanges.length > 0 && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Metric label="Abiertos" value={openDays} />
            <Metric label="No disponibles" value={unavailableDays} />
            <Metric label="Con cambios" value={specialAvailabilityDays.length} />
          </div>

          <AvailabilityRangeSection
            emptyText="No hay rangos o temporadas en este periodo."
            ranges={visibleRegularRanges}
            roomType={selectedRoomType}
            title="Rangos / temporadas"
          />

          {regularRanges.length > 4 && (
            <ShowMoreButton
              hiddenItems={regularRanges.length - 4}
              isExpanded={showAllRegularRanges}
              labels={['Ver menos rangos', 'rangos más']}
              onClick={() => setShowAllRegularRanges((isVisible) => !isVisible)}
            />
          )}

          <AvailabilityRangeSection
            emptyText="No hay fechas cerradas en este periodo."
            ranges={visibleClosedRanges}
            roomType={selectedRoomType}
            title="Fechas cerradas"
          />

          {closedRanges.length > 4 && (
            <ShowMoreButton
              hiddenItems={closedRanges.length - 4}
              isExpanded={showAllClosedRanges}
              labels={['Ver menos fechas cerradas', 'rangos cerrados más']}
              onClick={() => setShowAllClosedRanges((isVisible) => !isVisible)}
            />
          )}

          <AvailabilityRangeSection
            emptyText="No hay cambios especiales en este periodo."
            ranges={visibleSpecialRanges}
            roomType={selectedRoomType}
            title="Cambios especiales"
          />

          {specialRanges.length > 4 && (
            <ShowMoreButton
              hiddenItems={specialRanges.length - 4}
              isExpanded={showAllSpecialRanges}
              labels={['Ver menos cambios especiales', 'cambios especiales más']}
              onClick={() => setShowAllSpecialRanges((isVisible) => !isVisible)}
            />
          )}
        </div>
      )}
    </PanelCard>
  )
}

// Botón para mostrar u ocultar los rangos adicionales de una sección
function ShowMoreButton({ hiddenItems, isExpanded, labels, onClick }) {
  return (
    <button
      className="text-sm font-semibold text-secondary underline transition hover:text-primary"
      onClick={onClick}
      type="button"
    >
      {isExpanded ? labels[0] : `Ver ${hiddenItems} ${labels[1]}`}
    </button>
  )
}

// Renderiza una sección con su lista de rangos de disponibilidad
function AvailabilityRangeSection({ emptyText, ranges, roomType, title }) {
  return (
    <section>
      <h3 className="text-base font-bold text-primary">{title}</h3>
      {ranges.length === 0 ? (
        <p className="mt-2 text-sm text-secondary">{emptyText}</p>
      ) : (
        <div className="mt-3 space-y-2">
          {ranges.map((availabilityRange) => (
            <AvailabilityRangeRow
              availabilityRange={availabilityRange}
              key={`${availabilityRange.from}-${availabilityRange.to}`}
              roomType={roomType}
            />
          ))}
        </div>
      )}
    </section>
  )
}

// Da formato a la fecha o al rango de fechas de un periodo
function formatAvailabilityRangeDate(availabilityRange) {
  if (availabilityRange.from === availabilityRange.to) {
    return formatDate(availabilityRange.from)
  }

  return `${formatDate(availabilityRange.from)} - ${formatDate(availabilityRange.to)}`
}

// Muestra el detalle de un rango de disponibilidad (unidades, precio y estado)
function AvailabilityRangeRow({ availabilityRange, roomType }) {
  const { sample } = availabilityRange
  const minStayNights = getMinStayNights(sample)

  return (
    <article className="rounded-lg border border-outline-variant bg-surface p-3">
      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
        <div>
          <p className="font-bold text-primary">
            {formatAvailabilityRangeDate(availabilityRange)}
          </p>
          <p className="mt-1 text-sm text-secondary">
            {sample.available_units}{' '}
            {pluralize(sample.available_units, 'unidad', 'unidades')} ·{' '}
            {formatPrice(sample.price, roomType.currency_symbol)} · mínimo{' '}
            {minStayNights} {pluralize(minStayNights, 'noche', 'noches')}
          </p>
        </div>
        <StatusBadge status={sample.status} />
      </div>
    </article>
  )
}
