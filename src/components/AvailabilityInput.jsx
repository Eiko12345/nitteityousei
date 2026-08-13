import { useMemo, useRef, useState } from 'react'
import { fixedDates, timeSlots } from '../data/fixedSchedule'
import { pieces } from '../data/pieces'
import './AvailabilityInput.css'

const weekdays = ['日', '月', '火', '水', '木', '金', '土']

const dateLabel = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return `${month}/${day}（${weekdays[date.getDay()]}）`
}

function AvailabilityInput({ name, setName, parts, setParts, availability, setAvailability, setStep, onSubmit }) {
  const [month, setMonth] = useState(8)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const dragState = useRef({ active: false, value: false, visited: new Set() })

  const visibleDates = useMemo(
    () => fixedDates.filter((date) => Number(date.slice(5, 7)) === month),
    [month],
  )

  const setChoice = (id, selected) => {
    setAvailability((current) => {
      const next = { ...current }
      if (selected) next[id] = '○'
      else delete next[id]
      return next
    })
  }

  const fillDate = (date, selected) => {
    setAvailability((current) => {
      const next = { ...current }
      timeSlots.forEach(({ start }) => {
        const id = `${date}-${start}`
        if (selected) next[id] = '○'
        else delete next[id]
      })
      return next
    })
  }

  const beginDrag = (event, id, selected) => {
    event.preventDefault()
    dragState.current = { active: true, value: selected, visited: new Set([id]) }
    setChoice(id, selected)
  }

  const continueDrag = (event) => {
    if (!dragState.current.active) return
    event.preventDefault()
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-slot-id]')
    const id = target?.dataset.slotId
    if (!id || dragState.current.visited.has(id)) return
    dragState.current.visited.add(id)
    setChoice(id, dragState.current.value)
  }

  const endDrag = () => {
    dragState.current.active = false
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert('名前を入力してください')
      return
    }

    const availableOnly = Object.fromEntries(
      Object.entries(availability).filter(([, value]) => value === '○'),
    )
    try {
      setIsSubmitting(true)
      await onSubmit({ name, parts, availability: availableOnly })
      alert('回答を保存しました')
    } catch (error) {
      console.error('Firestoreへの回答保存に失敗しました', error)
      alert('回答の保存に失敗しました。通信環境を確認して、もう一度お試しください。')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="availability-page">
      <header className="availability-header">
        <div>
          <p className="eyebrow">SCHEDULE</p>
          <h1>日程回答</h1>
          <p>基本情報と参加可否を入力してください。</p>
        </div>
      </header>

      <section className="profile-form">
        <div className="name-field">
          <label htmlFor="response-name">名前</label>
          <input
            id="response-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="名前を入力してください"
          />
        </div>
        <div className="part-fields">
          {pieces.map((piece) => (
            <label key={piece.id}>
              <span>{piece.name}</span>
              <select
                value={parts[piece.id]}
                onChange={(event) => setParts((current) => ({
                  ...current,
                  [piece.id]: event.target.value,
                }))}
              >
                <option value="">乗らない</option>
                {Array.from({ length: piece.partCount }, (_, index) => {
                  const part = index + 1
                  const suffix = part === 1 ? 'st' : part === 2 ? 'nd' : part === 3 ? 'rd' : 'th'
                  const label = part === piece.assistantPart ? 'assi.' : `${part}${suffix}`
                  return <option key={part} value={part}>{label}</option>
                })}
              </select>
            </label>
          ))}
        </div>
      </section>

      <nav className="month-tabs" aria-label="表示する月">
        {[8, 9, 10].map((value) => (
          <button
            className={month === value ? 'active' : ''}
            key={value}
            onClick={() => setMonth(value)}
          >
            2026年{value}月
          </button>
        ))}
      </nav>

      <p className="grid-help">クリックで○を切り替えられます。押したまま横や縦に動かすと、連続して選択・解除できます。</p>

      <div className="schedule-scroll" onPointerMove={continueDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onPointerLeave={endDrag}>
        <table className="schedule-grid">
          <thead>
            <tr>
              <th className="date-column">日付</th>
              {timeSlots.map(({ start }) => <th key={start}>{start}</th>)}
            </tr>
          </thead>
          <tbody>
            {visibleDates.map((date) => (
              <tr key={date}>
                <th className="date-column">
                  <span>{dateLabel(date)}</span>
                  <span className="day-fill">
                    <button onClick={() => fillDate(date, true)}>全て○</button>
                    <button onClick={() => fillDate(date, false)}>解除</button>
                  </span>
                </th>
                {timeSlots.map(({ start }) => {
                  const id = `${date}-${start}`
                  const selected = availability[id] === '○'
                  return (
                    <td key={start}>
                      <button
                        className={`slot-button ${selected ? 'yes' : ''}`}
                        data-slot-id={id}
                        aria-label={`${dateLabel(date)} ${start} ${selected ? '参加可能' : '○ではない'}`}
                        aria-pressed={selected}
                        onPointerDown={(event) => beginDrag(event, id, !selected)}
                      >
                        {selected ? '○' : ''}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="availability-actions">
        <button className="secondary-button" onClick={() => setStep(0)}>戻る</button>
        <button className="submit-button" disabled={isSubmitting} onClick={handleSubmit}>
          {isSubmitting ? '保存中…' : '回答する'}
        </button>
      </footer>
    </main>
  )
}

export default AvailabilityInput
